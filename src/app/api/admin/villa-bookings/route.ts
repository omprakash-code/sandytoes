import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedAdminIdFromCookies } from "@/services/auth/adminAuth.server";

export async function GET(req: Request) {
  try {
    const adminId = await getAuthenticatedAdminIdFromCookies();
    if (!adminId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const query = url.searchParams.get("q")?.trim();
    const status = url.searchParams.get("status")?.trim();

    const bookings = await prisma.villaBooking.findMany({
      where: {
        ...(status ? { status: status as never } : {}),
        ...(query
          ? {
              OR: [
                { bookingRef: { contains: query, mode: "insensitive" } },
                { guestFirstName: { contains: query, mode: "insensitive" } },
                { guestLastName: { contains: query, mode: "insensitive" } },
                { guestEmail: { contains: query, mode: "insensitive" } },
                { guestPhone: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        notes: {
          orderBy: { createdAt: "desc" },
          take: 3,
          include: {
            admin: {
              select: { name: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: bookings.map((booking) => ({
        id: booking.id,
        bookingRef: booking.bookingRef,
        propertyName: booking.propertyName,
        checkIn: booking.checkIn.toISOString().slice(0, 10),
        checkOut: booking.checkOut.toISOString().slice(0, 10),
        nights: booking.nights,
        adults: booking.adults,
        children: booking.children,
        guestName: `${booking.guestFirstName} ${booking.guestLastName}`.trim(),
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        totalCents: booking.totalCents,
        currency: booking.currency,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        createdAt: booking.createdAt.toISOString(),
        latestPayment: booking.payments[0]
          ? {
              provider: booking.payments[0].provider,
              status: booking.payments[0].status,
              amountCents: booking.payments[0].amountCents,
            }
          : null,
        notes: booking.notes.map((note) => ({
          id: note.id,
          note: note.note,
          adminName: note.admin?.name ?? "Admin",
          createdAt: note.createdAt.toISOString(),
        })),
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/villa-bookings error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load bookings." },
      { status: 500 }
    );
  }
}
