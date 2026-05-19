import { prisma } from "@/lib/db";
import { addDays, listNightKeys, toDateKey } from "@/lib/villa-booking";
import {
  DEFAULT_VILLA_SLUG,
  getRequiredVillaBySlug,
} from "@/services/villa/villa.service";

function monthRange(year: number, month: number) {
  const safeYear = Number.isFinite(year) ? year : new Date().getUTCFullYear();
  const safeMonth = Number.isFinite(month) ? Math.min(12, Math.max(1, month)) : new Date().getUTCMonth() + 1;
  const start = new Date(Date.UTC(safeYear, safeMonth - 1, 1));
  const end = new Date(Date.UTC(safeYear, safeMonth, 1));
  return { start, end };
}

function pushRangeDays(
  days: Map<string, { bookings: string[]; locks: string[]; blocks: string[] }>,
  start: Date,
  end: Date,
  key: "bookings" | "locks" | "blocks",
  id: string,
) {
  listNightKeys(start, end).forEach((dateKey) => {
    const bucket = days.get(dateKey);
    if (bucket) bucket[key].push(id);
  });
}

export async function getVillaAdminCalendar({
  villaSlug = DEFAULT_VILLA_SLUG,
  year,
  month,
}: {
  villaSlug?: string;
  year: number;
  month: number;
}) {
  const villa = await getRequiredVillaBySlug(villaSlug);
  const { start, end } = monthRange(year, month);
  const now = new Date();

  const [bookings, locks, blocks] = await Promise.all([
    prisma.villaBooking.findMany({
      where: {
        villaId: villa.id,
        checkIn: { lt: end },
        checkOut: { gt: start },
        status: { in: ["CONFIRMED", "READY_FOR_PAYMENT", "NO_SHOW"] },
      },
      orderBy: { checkIn: "asc" },
      select: {
        id: true,
        bookingRef: true,
        checkIn: true,
        checkOut: true,
        guestFirstName: true,
        guestLastName: true,
        status: true,
        paymentStatus: true,
      },
    }),
    prisma.villaBookingLock.findMany({
      where: {
        villaId: villa.id,
        status: "ACTIVE",
        expiresAt: { gt: now },
        checkIn: { lt: end },
        checkOut: { gt: start },
      },
      orderBy: { checkIn: "asc" },
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
        guestEmail: true,
        expiresAt: true,
      },
    }),
    prisma.villaBlock.findMany({
      where: {
        villaId: villa.id,
        startDate: { lt: end },
        endDate: { gt: start },
      },
      orderBy: { startDate: "asc" },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        type: true,
        reason: true,
        source: true,
      },
    }),
  ]);

  const days = new Map<string, { bookings: string[]; locks: string[]; blocks: string[] }>();
  for (let cursor = start; cursor < end; cursor = addDays(cursor, 1)) {
    days.set(toDateKey(cursor), { bookings: [], locks: [], blocks: [] });
  }

  bookings.forEach((booking) => pushRangeDays(days, booking.checkIn, booking.checkOut, "bookings", booking.id));
  locks.forEach((lock) => pushRangeDays(days, lock.checkIn, lock.checkOut, "locks", lock.id));
  blocks.forEach((block) => pushRangeDays(days, block.startDate, block.endDate, "blocks", block.id));

  return {
    villa: {
      id: villa.id,
      slug: villa.slug,
      name: villa.name,
      timezone: villa.timezone,
    },
    month: {
      year: start.getUTCFullYear(),
      month: start.getUTCMonth() + 1,
      startDate: toDateKey(start),
      endDate: toDateKey(end),
    },
    days: Array.from(days.entries()).map(([date, state]) => ({
      date,
      state: state.bookings.length
        ? "booked"
        : state.blocks.length
          ? "blocked"
          : state.locks.length
            ? "pending"
            : "available",
      ...state,
    })),
    bookings: bookings.map((booking) => ({
      id: booking.id,
      bookingRef: booking.bookingRef,
      startDate: toDateKey(booking.checkIn),
      endDate: toDateKey(booking.checkOut),
      label: `${booking.bookingRef} · ${booking.guestFirstName} ${booking.guestLastName}`.trim(),
      status: booking.status,
      paymentStatus: booking.paymentStatus,
    })),
    locks: locks.map((lock) => ({
      id: lock.id,
      startDate: toDateKey(lock.checkIn),
      endDate: toDateKey(lock.checkOut),
      label: lock.guestEmail || "Active checkout hold",
      expiresAt: lock.expiresAt.toISOString(),
    })),
    blocks: blocks.map((block) => ({
      id: block.id,
      startDate: toDateKey(block.startDate),
      endDate: toDateKey(block.endDate),
      type: block.type,
      source: block.source,
      reason: block.reason,
    })),
  };
}
