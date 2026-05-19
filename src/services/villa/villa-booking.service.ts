import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  buildVillaBookingRef,
  daysBetweenDateKeys,
  normalizeCardLast4,
  parseDateKey,
} from "@/lib/villa-booking";
import {
  assertDateRangeAvailable,
  assertNoAvailabilityConflict,
  VillaDateRangeUnavailableError,
} from "@/services/villa/villa-availability.service";
import {
  assertLockValid,
  cleanupExpiredLocks,
  VillaLockExpiredError,
} from "@/services/villa/villa-lock.service";
import { logBookingActivity } from "@/services/villa/villa-activity.service";
import { buildGuestBookingConfirmationEmail } from "@/services/villa/villa-email-template.service";
import { calculateVillaPricing } from "@/services/villa/villa-pricing.service";
import {
  DEFAULT_VILLA_SLUG,
  getRequiredVillaBySlug,
} from "@/services/villa/villa.service";

export { VillaDateRangeUnavailableError, VillaLockExpiredError };

export class VillaBookingValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VillaBookingValidationError";
  }
}

export type CreateVillaBookingInput = {
  villaSlug?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phoneCountry: string;
    phone: string;
  };
  billingAddress: {
    country: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
  };
  payment: {
    method: "card" | "affirm";
    cardLast4?: string;
  };
  damageOption: "protection" | "deposit";
  promoCode?: string;
  consent: boolean;
};

type LockQuoteSnapshot = {
  villaSlug?: string;
  villaName?: string;
  nights?: number;
  nightlyRateCents?: number;
  subtotalCents?: number;
  cleaningFeeCents?: number;
  damageProtectionFeeCents?: number;
  totalCents?: number;
  currency?: string;
  promoCode?: string | null;
};

export type CreateBookingFromLockInput = {
  lockToken: string;
  guest: CreateVillaBookingInput["guest"];
  billingAddress: CreateVillaBookingInput["billingAddress"];
  payment: CreateVillaBookingInput["payment"];
  damageOption: CreateVillaBookingInput["damageOption"];
  consent: boolean;
  provider?: "MOCK" | "STRIPE" | "MANUAL";
  providerPaymentId?: string;
  providerRawResponse?: Prisma.InputJsonValue;
};

function readLockQuoteSnapshot(value: unknown): LockQuoteSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new VillaBookingValidationError("This reservation quote is no longer valid.");
  }

  const quote = value as LockQuoteSnapshot;
  const requiredNumbers = [
    quote.nights,
    quote.nightlyRateCents,
    quote.subtotalCents,
    quote.totalCents,
  ];
  if (
    requiredNumbers.some((numberValue) => typeof numberValue !== "number") ||
    typeof quote.currency !== "string"
  ) {
    throw new VillaBookingValidationError("This reservation quote is no longer valid.");
  }

  return quote;
}

/**
 * @deprecated Booking-first hold flow retained only as rollback/reference.
 * Active checkout should create VillaBookingLock first, then create the
 * booking from the backend payment confirmation path.
 */
export async function createVillaBooking(input: CreateVillaBookingInput) {
  if (!input.consent) {
    throw new VillaBookingValidationError("Please accept the terms to book.");
  }

  const checkIn = parseDateKey(input.checkIn);
  const checkOut = parseDateKey(input.checkOut);
  if (!checkIn || !checkOut || checkOut <= checkIn) {
    throw new VillaBookingValidationError("Enter valid stay dates.");
  }

  const nights = daysBetweenDateKeys(checkIn, checkOut);
  if (nights < 1 || nights > 60) {
    throw new VillaBookingValidationError("Choose a valid stay length.");
  }

  const villaSlug = input.villaSlug || DEFAULT_VILLA_SLUG;
  const cardLast4 =
    input.payment.method === "card"
      ? normalizeCardLast4(input.payment.cardLast4)
      : null;

  if (input.payment.method === "card" && !cardLast4) {
    throw new VillaBookingValidationError("Enter valid card details.");
  }

  return prisma.$transaction(async (tx) => {
    const villa = await getRequiredVillaBySlug(villaSlug, tx);
    if (input.adults + input.children > villa.maxGuests) {
      throw new VillaBookingValidationError(
        `This villa sleeps up to ${villa.maxGuests} guests.`,
      );
    }

    // Transitional MVP path: the current checkout still creates a
    // READY_FOR_PAYMENT booking row before real Stripe integration.
    // TODO(Stripe phase): create bookings only after validating an active
    // VillaBookingLock from the Stripe webhook/payment confirmation service.
    await tx.$executeRaw(
      Prisma.sql`SELECT pg_advisory_xact_lock(hashtext(${villa.id}))`,
    );

    const now = new Date();
    await assertDateRangeAvailable({ villaId: villa.id, checkIn, checkOut, now }, tx);

    const pricing = calculateVillaPricing({ villa, nights });
    const booking = await tx.villaBooking.create({
      data: {
        bookingRef: buildVillaBookingRef(),
        villaId: villa.id,
        propertySlug: villa.slug,
        propertyName: villa.name,
        checkIn,
        checkOut,
        nights,
        adults: input.adults,
        children: input.children,
        guestFirstName: input.guest.firstName,
        guestLastName: input.guest.lastName,
        guestEmail: input.guest.email,
        guestPhoneCountry: input.guest.phoneCountry,
        guestPhone: input.guest.phone,
        billingCountry: input.billingAddress.country,
        billingAddress: input.billingAddress.address,
        billingAddress2: input.billingAddress.address2 || null,
        billingCity: input.billingAddress.city,
        billingState: input.billingAddress.state,
        billingZip: input.billingAddress.zip,
        paymentMethod: input.payment.method,
        cardLast4,
        damageOption:
          input.damageOption === "protection" ? "PROTECTION" : "DEPOSIT",
        nightlyRateCents: pricing.nightlyRateCents,
        subtotalCents: pricing.subtotalCents,
        damageProtectionFeeCents: pricing.damageProtectionFeeCents,
        totalCents: pricing.totalCents,
        currency: pricing.currency,
        promoCode: input.promoCode || null,
        status: "READY_FOR_PAYMENT",
        paymentStatus: "INITIALIZED",
        termsAcceptedAt: now,
        expiresAt: new Date(now.getTime() + 30 * 60 * 1000),
        payments: {
          create: {
            villaId: villa.id,
            provider: "MANUAL",
            method: input.payment.method,
            amountCents: pricing.totalCents,
            currency: pricing.currency,
            status: "INITIALIZED",
          },
        },
        emailLogs: {
          create: {
            villaId: villa.id,
            recipient: input.guest.email,
            subject: `Sandy Toes booking request ${villa.name}`,
            template: "villa-booking-request-created",
            status: "PENDING",
          },
        },
      },
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return booking;
  });
}

export async function createBookingFromLock(input: CreateBookingFromLockInput) {
  if (!input.consent) {
    throw new VillaBookingValidationError("Please accept the terms to book.");
  }

  const cardLast4 =
    input.payment.method === "card"
      ? normalizeCardLast4(input.payment.cardLast4)
      : null;

  if (input.payment.method === "card" && !cardLast4) {
    throw new VillaBookingValidationError("Enter valid card details.");
  }

  return prisma.$transaction(async (tx) => {
    const now = new Date();
    const initialLock = await assertLockValid(input.lockToken, tx, now);

    await tx.$executeRaw(
      Prisma.sql`SELECT pg_advisory_xact_lock(hashtext(${initialLock.villaId}))`,
    );

    await cleanupExpiredLocks(tx, now, initialLock.villaId);
    const lock = await assertLockValid(input.lockToken, tx, now);
    const quote = readLockQuoteSnapshot(lock.quoteSnapshot);

    await assertNoAvailabilityConflict(
      {
        villaId: lock.villaId,
        checkIn: lock.checkIn,
        checkOut: lock.checkOut,
        now,
        excludeLockId: lock.id,
      },
      tx,
    );

    const bookingRef = buildVillaBookingRef();
    const guestName = `${input.guest.firstName} ${input.guest.lastName}`.trim();
    const guestEmailPreview = buildGuestBookingConfirmationEmail({
      bookingRef,
      villaName: lock.villa.name,
      guestName,
      guestEmail: input.guest.email,
      checkIn: lock.checkIn,
      checkOut: lock.checkOut,
      nights: quote.nights ?? daysBetweenDateKeys(lock.checkIn, lock.checkOut),
      adults: lock.adults,
      children: lock.children,
      totalCents: quote.totalCents ?? 0,
      currency: quote.currency ?? lock.villa.currency,
    });
    const booking = await tx.villaBooking.create({
      data: {
        bookingRef,
        villaId: lock.villaId,
        propertySlug: lock.villa.slug,
        propertyName: lock.villa.name,
        checkIn: lock.checkIn,
        checkOut: lock.checkOut,
        nights: quote.nights ?? daysBetweenDateKeys(lock.checkIn, lock.checkOut),
        adults: lock.adults,
        children: lock.children,
        guestFirstName: input.guest.firstName,
        guestLastName: input.guest.lastName,
        guestEmail: input.guest.email,
        guestPhoneCountry: input.guest.phoneCountry,
        guestPhone: input.guest.phone,
        billingCountry: input.billingAddress.country,
        billingAddress: input.billingAddress.address,
        billingAddress2: input.billingAddress.address2 || null,
        billingCity: input.billingAddress.city,
        billingState: input.billingAddress.state,
        billingZip: input.billingAddress.zip,
        paymentMethod: input.payment.method,
        cardLast4,
        damageOption:
          input.damageOption === "protection" ? "PROTECTION" : "DEPOSIT",
        nightlyRateCents: quote.nightlyRateCents ?? 0,
        subtotalCents: quote.subtotalCents ?? 0,
        damageProtectionFeeCents: quote.damageProtectionFeeCents ?? 0,
        totalCents: quote.totalCents ?? 0,
        currency: quote.currency ?? lock.villa.currency,
        promoCode: quote.promoCode || null,
        status: "CONFIRMED",
        paymentStatus: "PAID",
        termsAcceptedAt: now,
        expiresAt: null,
        payments: {
          create: {
            villaId: lock.villaId,
            provider: input.provider ?? "MOCK",
            providerPaymentId: input.providerPaymentId ?? `MOCK-${bookingRef}`,
            method: input.payment.method,
            amountCents: quote.totalCents ?? 0,
            currency: quote.currency ?? lock.villa.currency,
            status: "PAID",
            paidAt: now,
            providerRawResponse: input.providerRawResponse ?? Prisma.JsonNull,
          },
        },
        emailLogs: {
          create: {
            villaId: lock.villaId,
            recipient: guestEmailPreview.to,
            subject: guestEmailPreview.subject,
            template: guestEmailPreview.template,
            status: "PENDING",
          },
        },
      },
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    const consumed = await tx.villaBookingLock.updateMany({
      where: {
        id: lock.id,
        status: "ACTIVE",
      },
      data: {
        status: "CONSUMED",
        consumedAt: now,
        consumedBookingRef: booking.bookingRef,
      },
    });

    if (consumed.count !== 1) {
      throw new VillaBookingValidationError("This reservation hold was already used.");
    }

    await logBookingActivity(
      {
        villaId: lock.villaId,
        bookingId: booking.id,
        type: "BOOKING_CREATED",
        message: `Booking ${booking.bookingRef} created from reservation hold`,
        metadata: {
          lockId: lock.id,
          lockToken: lock.lockToken,
          provider: input.provider ?? "MOCK",
        },
      },
      tx,
    );

    await logBookingActivity(
      {
        villaId: lock.villaId,
        bookingId: booking.id,
        type: "BOOKING_CONFIRMED",
        message: `Booking ${booking.bookingRef} confirmed`,
        metadata: {
          providerPaymentId: input.providerPaymentId ?? `MOCK-${bookingRef}`,
          provider: input.provider ?? "MOCK",
        },
      },
      tx,
    );

    return booking;
  });
}
