import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createVillaPaymentIntent,
  VillaPaymentValidationError,
} from "@/services/villa/villa-payment.service";
import {
  VillaDateRangeUnavailableError,
  VillaLockExpiredError,
} from "@/services/villa/villa-lock.service";

const createIntentSchema = z.object({
  lockToken: z.string().trim().min(16),
  sessionId: z.string().trim().optional(),
});

export async function POST(req: Request) {
  try {
    const parsed = createIntentSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Reservation hold is required before payment.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const intent = await createVillaPaymentIntent(parsed.data);
    return NextResponse.json({
      success: true,
      data: intent,
    });
  } catch (error) {
    if (error instanceof VillaLockExpiredError) {
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

    if (error instanceof VillaPaymentValidationError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 },
      );
    }

    console.error("POST /api/villa-payments/create-intent error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to prepare payment." },
      { status: 500 },
    );
  }
}
