import { NextResponse } from "next/server";

export async function POST() {
  // Deprecated Phase 1 confirmation route. Payment success must not be driven
  // by a frontend booking reference. Use the lock-consuming payment path:
  // /api/villa-payments/mock-confirm now, Stripe webhook later.
  return NextResponse.json(
    {
      success: false,
      code: "FRONTEND_CONFIRMATION_DEPRECATED",
      message: "Reservation confirmation must use the payment confirmation flow.",
    },
    { status: 410 },
  );
}
