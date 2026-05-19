import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedAdminIdFromCookies } from "@/services/auth/adminAuth.server";
import {
  applyBookingLifecycleAction,
  releaseBookingLockByToken,
  rescheduleBooking,
  VillaAdminBookingError,
  VillaDateRangeUnavailableError,
} from "@/services/villa/villa-admin-booking.service";

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("CONFIRM_BOOKING"),
    reason: z.string().trim().optional(),
  }),
  z.object({
    action: z.literal("CANCEL_BOOKING"),
    reason: z.string().trim().optional(),
  }),
  z.object({
    action: z.literal("MARK_NO_SHOW"),
    reason: z.string().trim().optional(),
  }),
  z.object({
    action: z.literal("MARK_REFUNDED"),
    reason: z.string().trim().optional(),
  }),
  z.object({
    action: z.literal("RESCHEDULE_BOOKING"),
    checkIn: z.string(),
    checkOut: z.string(),
    reason: z.string().trim().optional(),
  }),
  z.object({
    action: z.literal("RELEASE_LOCK"),
    lockToken: z.string().trim().min(16),
  }),
]);

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await getAuthenticatedAdminIdFromCookies();
    if (!adminId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const parsed = actionSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid booking action." }, { status: 400 });
    }

    const { id } = await context.params;
    if (parsed.data.action === "RESCHEDULE_BOOKING") {
      const booking = await rescheduleBooking({
        bookingId: id,
        checkIn: parsed.data.checkIn,
        checkOut: parsed.data.checkOut,
        actorId: adminId,
        reason: parsed.data.reason,
      });
      return NextResponse.json({ success: true, data: booking });
    }

    if (parsed.data.action === "RELEASE_LOCK") {
      await releaseBookingLockByToken({
        lockToken: parsed.data.lockToken,
        actorId: adminId,
      });
      return NextResponse.json({ success: true });
    }

    const booking = await applyBookingLifecycleAction({
      bookingId: id,
      action: parsed.data.action,
      actorId: adminId,
      reason: parsed.data.reason,
    });

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    if (error instanceof VillaDateRangeUnavailableError) {
      return NextResponse.json(
        {
          success: false,
          code: "DATES_UNAVAILABLE",
          message: "The selected dates are no longer available.",
          unavailableDates: error.unavailableDates,
        },
        { status: 409 },
      );
    }

    if (error instanceof VillaAdminBookingError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    console.error("POST /api/admin/villa-bookings/[id]/actions error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update booking." },
      { status: 500 },
    );
  }
}
