import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAuthenticatedAdminIdFromCookies } from "@/services/auth/adminAuth.server";
import { logBookingActivity } from "@/services/villa/villa-activity.service";

const noteSchema = z.object({
  note: z.string().trim().min(2).max(2000),
});

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await getAuthenticatedAdminIdFromCookies();
    if (!adminId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const parsed = noteSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Enter a note." }, { status: 400 });
    }

    const { id } = await context.params;
    const booking = await prisma.villaBooking.findUnique({
      where: { id },
      select: { villaId: true },
    });
    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found." }, { status: 404 });
    }

    const note = await prisma.$transaction(async (tx) => {
      const created = await tx.villaAdminNote.create({
        data: {
          bookingId: id,
          villaId: booking.villaId,
          adminId,
          note: parsed.data.note,
        },
        include: {
          admin: {
            select: { name: true },
          },
        },
      });

      await logBookingActivity(
        {
          villaId: booking.villaId,
          bookingId: id,
          actorId: adminId,
          type: "ADMIN_NOTE_ADDED",
          message: "Admin note added",
          metadata: { noteId: created.id },
        },
        tx,
      );

      return created;
    });

    return NextResponse.json({ success: true, data: note });
  } catch (error) {
    console.error("POST /api/admin/villa-bookings/[id]/notes error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save note." },
      { status: 500 }
    );
  }
}
