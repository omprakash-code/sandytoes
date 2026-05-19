import { Prisma, type PaymentStatus, type VillaBookingStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  daysBetweenDateKeys,
  parseDateKey,
  toDateKey,
} from "@/lib/villa-booking";
import {
  assertNoAvailabilityConflict,
  VillaDateRangeUnavailableError,
} from "@/services/villa/villa-availability.service";
import { logBookingActivity } from "@/services/villa/villa-activity.service";
import { releaseLock } from "@/services/villa/villa-lock.service";
import { calculateVillaPricing } from "@/services/villa/villa-pricing.service";

export { VillaDateRangeUnavailableError };

export class VillaAdminBookingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VillaAdminBookingError";
  }
}

export type BookingLifecycleAction =
  | "CONFIRM_BOOKING"
  | "CANCEL_BOOKING"
  | "MARK_NO_SHOW"
  | "MARK_REFUNDED";

function assertTransitionAllowed(
  action: BookingLifecycleAction,
  booking: {
    status: VillaBookingStatus;
    paymentStatus: PaymentStatus;
  },
) {
  if (booking.status === "EXPIRED") {
    throw new VillaAdminBookingError("Expired bookings cannot be changed.");
  }

  if (action === "CONFIRM_BOOKING" && booking.status === "CANCELLED") {
    throw new VillaAdminBookingError("Cancelled bookings cannot be confirmed.");
  }

  if (action === "MARK_NO_SHOW" && booking.status !== "CONFIRMED") {
    throw new VillaAdminBookingError("Only confirmed bookings can be marked no-show.");
  }

  if (action === "MARK_REFUNDED" && booking.paymentStatus !== "PAID") {
    throw new VillaAdminBookingError("Only paid bookings can be marked refunded.");
  }
}

export async function applyBookingLifecycleAction({
  bookingId,
  action,
  actorId,
  reason,
}: {
  bookingId: string;
  action: BookingLifecycleAction;
  actorId?: string | null;
  reason?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.villaBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        villaId: true,
        bookingRef: true,
        status: true,
        paymentStatus: true,
      },
    });

    if (!booking) throw new VillaAdminBookingError("Booking was not found.");
    assertTransitionAllowed(action, booking);

    let status: VillaBookingStatus | undefined;
    let paymentStatus: PaymentStatus | undefined;
    let activityType: Prisma.BookingActivityLogCreateInput["type"];
    let message: string;
    const now = new Date();

    if (action === "CONFIRM_BOOKING") {
      status = "CONFIRMED";
      paymentStatus = booking.paymentStatus === "PAID" ? "PAID" : "OFFLINE";
      activityType = "BOOKING_CONFIRMED";
      message = `Booking ${booking.bookingRef} confirmed by admin`;
    } else if (action === "CANCEL_BOOKING") {
      status = "CANCELLED";
      activityType = "BOOKING_CANCELLED";
      message = `Booking ${booking.bookingRef} cancelled`;
    } else if (action === "MARK_NO_SHOW") {
      status = "NO_SHOW";
      activityType = "NO_SHOW_MARKED";
      message = `Booking ${booking.bookingRef} marked no-show`;
    } else {
      paymentStatus = "REFUNDED";
      activityType = "REFUND_MARKED";
      message = `Booking ${booking.bookingRef} marked refunded`;
    }

    const updated = await tx.villaBooking.update({
      where: { id: booking.id },
      data: {
        ...(status ? { status } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
        ...(action === "CANCEL_BOOKING"
          ? {
              cancelledAt: now,
              cancelledReason: reason?.trim() || "Cancelled by admin",
            }
          : {}),
      },
    });

    await logBookingActivity(
      {
        villaId: booking.villaId,
        bookingId: booking.id,
        actorId: actorId ?? null,
        type: activityType,
        message,
        metadata: { action, reason: reason || null },
      },
      tx,
    );

    return updated;
  });
}

export async function rescheduleBooking({
  bookingId,
  checkIn: checkInValue,
  checkOut: checkOutValue,
  actorId,
  reason,
}: {
  bookingId: string;
  checkIn: string;
  checkOut: string;
  actorId?: string | null;
  reason?: string;
}) {
  const checkIn = parseDateKey(checkInValue);
  const checkOut = parseDateKey(checkOutValue);
  if (!checkIn || !checkOut || checkOut <= checkIn) {
    throw new VillaAdminBookingError("Choose a valid stay range.");
  }

  return prisma.$transaction(async (tx) => {
    const booking = await tx.villaBooking.findUnique({
      where: { id: bookingId },
      include: { villa: true },
    });
    if (!booking) throw new VillaAdminBookingError("Booking was not found.");
    if (booking.status !== "CONFIRMED" && booking.status !== "READY_FOR_PAYMENT") {
      throw new VillaAdminBookingError("Only active bookings can be rescheduled.");
    }

    await tx.$executeRaw(
      Prisma.sql`SELECT pg_advisory_xact_lock(hashtext(${booking.villaId}))`,
    );

    await assertNoAvailabilityConflict(
      {
        villaId: booking.villaId,
        checkIn,
        checkOut,
        excludeBookingId: booking.id,
      },
      tx,
    );

    const nights = daysBetweenDateKeys(checkIn, checkOut);
    const pricing = calculateVillaPricing({ villa: booking.villa, nights });
    const previous = {
      checkIn: toDateKey(booking.checkIn),
      checkOut: toDateKey(booking.checkOut),
      nights: booking.nights,
      totalCents: booking.totalCents,
    };

    const updated = await tx.villaBooking.update({
      where: { id: booking.id },
      data: {
        checkIn,
        checkOut,
        nights,
        nightlyRateCents: pricing.nightlyRateCents,
        subtotalCents: pricing.subtotalCents,
        damageProtectionFeeCents: pricing.damageProtectionFeeCents,
        totalCents: pricing.totalCents,
        currency: pricing.currency,
      },
    });

    await logBookingActivity(
      {
        villaId: booking.villaId,
        bookingId: booking.id,
        actorId: actorId ?? null,
        type: "DATES_RESCHEDULED",
        message: `Booking ${booking.bookingRef} rescheduled`,
        metadata: {
          previous,
          next: {
            checkIn: checkInValue,
            checkOut: checkOutValue,
            nights,
            totalCents: pricing.totalCents,
          },
          reason: reason || null,
        },
      },
      tx,
    );

    return updated;
  });
}

export async function releaseBookingLockByToken({
  lockToken,
  actorId,
}: {
  lockToken: string;
  actorId?: string | null;
}) {
  const lock = await prisma.villaBookingLock.findUnique({
    where: { lockToken },
    select: { villaId: true, lockToken: true },
  });
  if (!lock) throw new VillaAdminBookingError("Lock was not found.");

  await releaseLock(lockToken);
  await logBookingActivity({
    villaId: lock.villaId,
    actorId: actorId ?? null,
    type: "LOCK_RELEASED",
    message: "Admin released an active checkout hold",
    metadata: { lockToken },
  });
}
