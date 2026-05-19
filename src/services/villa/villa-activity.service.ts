import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { VillaDbClient } from "@/services/villa/villa.service";

export async function logBookingActivity(
  {
    villaId,
    bookingId,
    actorId,
    type,
    message,
    metadata,
  }: {
    villaId: string;
    bookingId?: string | null;
    actorId?: string | null;
    type: Prisma.BookingActivityLogCreateInput["type"];
    message: string;
    metadata?: Prisma.InputJsonValue;
  },
  db: VillaDbClient = prisma,
) {
  return db.bookingActivityLog.create({
    data: {
      villaId,
      bookingId: bookingId ?? null,
      actorId: actorId ?? null,
      type,
      message,
      metadata: metadata ?? Prisma.JsonNull,
    },
  });
}
