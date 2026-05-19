import { NextResponse } from "next/server";

export async function POST() {
  // Deprecated Phase 1 route. Temporary reservation holds must now be created
  // through /api/villa-booking-locks, then converted to bookings only from the
  // backend payment confirmation path.
  return NextResponse.json(
    {
      success: false,
      code: "BOOKING_FIRST_FLOW_DEPRECATED",
      message: "Create a reservation hold before payment.",
    },
    { status: 410 },
  );
}
