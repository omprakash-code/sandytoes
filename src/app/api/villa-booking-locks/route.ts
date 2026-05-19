import { NextResponse } from "next/server";
import { z } from "zod";
import { toDateKey } from "@/lib/villa-booking";
import {
  createBookingLock,
  VillaDateRangeUnavailableError,
  VillaLockValidationError,
} from "@/services/villa/villa-lock.service";
import { VillaNotFoundError } from "@/services/villa/villa.service";

const lockRequestSchema = z.object({
  villaSlug: z.string().trim().optional(),
  checkIn: z.string(),
  checkOut: z.string(),
  adults: z.number().int().min(1).max(14),
  children: z.number().int().min(0).max(8).default(0),
  guestEmail: z.string().trim().email().optional(),
  guestPhone: z.string().trim().min(6).optional(),
  promoCode: z.string().trim().optional(),
  sessionId: z.string().trim().min(8).optional(),
});

export async function POST(req: Request) {
  try {
    const parsed = lockRequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check the stay details and try again.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const lock = await createBookingLock(parsed.data);
    const quote =
      lock.quoteSnapshot && typeof lock.quoteSnapshot === "object"
        ? lock.quoteSnapshot
        : null;

    return NextResponse.json({
      success: true,
      data: {
        lockToken: lock.lockToken,
        sessionId: lock.sessionId,
        expiresAt: lock.expiresAt.toISOString(),
        villa: {
          slug: lock.villa.slug,
          name: lock.villa.name,
          timezone: lock.villa.timezone,
          currency: lock.villa.currency,
        },
        stay: {
          checkIn: toDateKey(lock.checkIn),
          checkOut: toDateKey(lock.checkOut),
          adults: lock.adults,
          children: lock.children,
        },
        quote,
      },
    });
  } catch (error) {
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

    if (error instanceof VillaLockValidationError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 },
      );
    }

    if (error instanceof VillaNotFoundError) {
      return NextResponse.json(
        { success: false, message: "Villa is not available." },
        { status: 404 },
      );
    }

    console.error("POST /api/villa-booking-locks error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to hold these dates." },
      { status: 500 },
    );
  }
}
