import { prisma } from "@/lib/db";
import { listNightKeys } from "@/lib/villa-booking";
import type { VillaDbClient } from "@/services/villa/villa.service";

export type VillaAvailabilityResult = {
  available: boolean;
  unavailableDates: string[];
  blocks: Array<{
    id: string;
    startDate: string;
    endDate: string;
    type: string;
    reason: string | null;
  }>;
};

export class VillaDateRangeUnavailableError extends Error {
  unavailableDates: string[];

  constructor(unavailableDates: string[]) {
    super("Selected dates are no longer available.");
    this.name = "VillaDateRangeUnavailableError";
    this.unavailableDates = unavailableDates;
  }
}

export function assertValidStayDateRange(checkIn: Date, checkOut: Date) {
  if (checkOut <= checkIn) {
    throw new Error("CHECK_OUT_MUST_BE_AFTER_CHECK_IN");
  }
}

export async function getVillaAvailability(
  {
    villaId,
    checkIn,
    checkOut,
    now = new Date(),
    excludeLockId,
    excludeBookingId,
    excludeBlockId,
  }: {
    villaId: string;
    checkIn: Date;
    checkOut: Date;
    now?: Date;
    excludeLockId?: string;
    excludeBookingId?: string;
    excludeBlockId?: string;
  },
  db: VillaDbClient = prisma,
): Promise<VillaAvailabilityResult> {
  assertValidStayDateRange(checkIn, checkOut);

  const [bookings, locks, blocks] = await Promise.all([
    db.villaBooking.findMany({
      where: {
        villaId,
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
        OR: [
          { status: "CONFIRMED" },
          // Transitional compatibility: current checkout can still create
          // READY_FOR_PAYMENT rows. New Stripe flow will use VillaBookingLock.
          {
            status: "READY_FOR_PAYMENT",
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
        ],
      },
      select: {
        checkIn: true,
        checkOut: true,
      },
    }),
    db.villaBookingLock.findMany({
      where: {
        villaId,
        ...(excludeLockId ? { id: { not: excludeLockId } } : {}),
        status: "ACTIVE",
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
        expiresAt: { gt: now },
      },
      select: {
        checkIn: true,
        checkOut: true,
      },
    }),
    db.villaBlock.findMany({
      where: {
        villaId,
        ...(excludeBlockId ? { id: { not: excludeBlockId } } : {}),
        startDate: { lt: checkOut },
        endDate: { gt: checkIn },
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        type: true,
        reason: true,
      },
    }),
  ]);

  const unavailableDates = new Set<string>();
  bookings.forEach((booking) => {
    listNightKeys(booking.checkIn, booking.checkOut).forEach((dateKey) =>
      unavailableDates.add(dateKey),
    );
  });
  locks.forEach((lock) => {
    listNightKeys(lock.checkIn, lock.checkOut).forEach((dateKey) =>
      unavailableDates.add(dateKey),
    );
  });
  blocks.forEach((block) => {
    listNightKeys(block.startDate, block.endDate).forEach((dateKey) =>
      unavailableDates.add(dateKey),
    );
  });

  return {
    available: unavailableDates.size === 0,
    unavailableDates: Array.from(unavailableDates).sort(),
    blocks: blocks.map((block) => ({
      id: block.id,
      startDate: block.startDate.toISOString().slice(0, 10),
      endDate: block.endDate.toISOString().slice(0, 10),
      type: block.type,
      reason: block.reason,
    })),
  };
}

export async function assertDateRangeAvailable(
  input: {
    villaId: string;
    checkIn: Date;
    checkOut: Date;
    now?: Date;
    excludeLockId?: string;
    excludeBookingId?: string;
    excludeBlockId?: string;
  },
  db: VillaDbClient = prisma,
) {
  return assertNoAvailabilityConflict(input, db);
}

export async function assertNoAvailabilityConflict(
  input: {
    villaId: string;
    checkIn: Date;
    checkOut: Date;
    now?: Date;
    excludeLockId?: string;
    excludeBookingId?: string;
    excludeBlockId?: string;
  },
  db: VillaDbClient = prisma,
) {
  const availability = await getVillaAvailability(input, db);
  if (!availability.available) {
    throw new VillaDateRangeUnavailableError(availability.unavailableDates);
  }

  return availability;
}
