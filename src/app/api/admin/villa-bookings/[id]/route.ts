import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedAdminIdFromCookies } from "@/services/auth/adminAuth.server";

async function requireAdmin() {
  const adminId = await getAuthenticatedAdminIdFromCookies();
  return adminId;
}

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdmin();
    if (!adminId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const booking = await prisma.villaBooking.findUnique({
      where: { id },
      include: {
        payments: { orderBy: { createdAt: "desc" } },
        emailLogs: { orderBy: { createdAt: "desc" } },
        notes: {
          orderBy: { createdAt: "desc" },
          include: { admin: { select: { name: true } } },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error("GET /api/admin/villa-bookings/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load booking." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdmin();
    if (!adminId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await req.json().catch(() => null);
    await context.params;
    return NextResponse.json(
      {
        success: false,
        code: "FREE_FORM_BOOKING_UPDATE_DEPRECATED",
        message: "Use controlled booking actions instead.",
      },
      { status: 410 },
    );
  } catch (error) {
    console.error("PATCH /api/admin/villa-bookings/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update booking." },
      { status: 500 }
    );
  }
}
