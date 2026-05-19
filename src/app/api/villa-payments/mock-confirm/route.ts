import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createBookingFromLock,
  VillaBookingValidationError,
  VillaDateRangeUnavailableError,
  VillaLockExpiredError,
} from "@/services/villa/villa-booking.service";

const mockConfirmSchema = z.object({
  lockToken: z.string().trim().min(16),
  paymentSessionId: z.string().trim().min(8),
  guest: z.object({
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    email: z.string().trim().email(),
    phoneCountry: z.string().trim().min(1),
    phone: z.string().trim().min(6),
  }),
  billingAddress: z.object({
    country: z.string().trim().min(1),
    address: z.string().trim().min(1),
    address2: z.string().trim().optional(),
    city: z.string().trim().min(1),
    state: z.string().trim().min(1),
    zip: z.string().trim().min(1),
  }),
  payment: z.object({
    method: z.enum(["card", "affirm"]),
    cardLast4: z.string().optional(),
  }),
  damageOption: z.enum(["protection", "deposit"]),
  consent: z.boolean(),
});

export async function POST(req: Request) {
  try {
    const parsed = mockConfirmSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check the reservation details and try again.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    // Temporary development-only payment simulation. Real production path:
    // Stripe webhook -> createBookingFromLock({ provider: "STRIPE", ... }).
    // TODO(Stripe): remove this endpoint once Stripe webhooks are active.
    const booking = await createBookingFromLock({
      lockToken: parsed.data.lockToken,
      guest: parsed.data.guest,
      billingAddress: parsed.data.billingAddress,
      payment: parsed.data.payment,
      damageOption: parsed.data.damageOption,
      consent: parsed.data.consent,
      provider: "MOCK",
      providerPaymentId: parsed.data.paymentSessionId,
      providerRawResponse: {
        source: "mock-confirm-endpoint",
        paymentSessionId: parsed.data.paymentSessionId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        bookingId: booking.id,
        bookingRef: booking.bookingRef,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
      },
    });
  } catch (error) {
    if (error instanceof VillaLockExpiredError) {
      // TODO(payment recovery): when Stripe captures money after lock expiry,
      // record a payment-captured-but-booking-failed incident for admin follow-up.
      return NextResponse.json(
        { success: false, code: "LOCK_EXPIRED", message: error.message },
        { status: 409 },
      );
    }

    if (error instanceof VillaDateRangeUnavailableError) {
      return NextResponse.json(
        {
          success: false,
          code: "DATES_UNAVAILABLE",
          message: error.message,
          unavailableDates: error.unavailableDates,
        },
        { status: 409 },
      );
    }

    if (error instanceof VillaBookingValidationError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 },
      );
    }

    console.error("POST /api/villa-payments/mock-confirm error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to confirm reservation." },
      { status: 500 },
    );
  }
}
