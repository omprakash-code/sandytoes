import { Prisma } from "@prisma/client";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/db";
import {
  daysBetweenDateKeys,
  parseDateKey,
  toDateKey,
} from "@/lib/villa-booking";
import {
  assertNoAvailabilityConflict,
  VillaDateRangeUnavailableError,
} from "@/services/villa/villa-availability.service";
import { calculateVillaPricing } from "@/services/villa/villa-pricing.service";
import {
  DEFAULT_VILLA_SLUG,
  getRequiredVillaBySlug,
  type VillaDbClient,
} from "@/services/villa/villa.service";

const lockTokenId = customAlphabet(
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789",
  32,
);
const sessionId = customAlphabet(
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789",
  24,
);

const DEFAULT_LOCK_TTL_MINUTES = 30;

export { VillaDateRangeUnavailableError };

export class VillaLockValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VillaLockValidationError";
  }
}

export class VillaLockExpiredError extends Error {
  constructor() {
    super("This reservation hold has expired.");
    this.name = "VillaLockExpiredError";
  }
}

export type CreateBookingLockInput = {
  villaSlug?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  guestEmail?: string;
  guestPhone?: string;
  promoCode?: string;
  sessionId?: string;
  ttlMinutes?: number;
};

export async function createBookingLock(input: CreateBookingLockInput) {
  const checkIn = parseDateKey(input.checkIn);
  const checkOut = parseDateKey(input.checkOut);
  if (!checkIn || !checkOut || checkOut <= checkIn) {
    throw new VillaLockValidationError("Enter valid stay dates.");
  }

  const nights = daysBetweenDateKeys(checkIn, checkOut);
  if (nights < 1 || nights > 60) {
    throw new VillaLockValidationError("Choose a valid stay length.");
  }

  if (input.adults < 1 || input.children < 0) {
    throw new VillaLockValidationError("Enter a valid guest count.");
  }

  const ttlMinutes = Math.max(
    5,
    Math.min(60, Math.trunc(input.ttlMinutes ?? DEFAULT_LOCK_TTL_MINUTES)),
  );

  return prisma.$transaction(async (tx) => {
    const villa = await getRequiredVillaBySlug(
      input.villaSlug || DEFAULT_VILLA_SLUG,
      tx,
    );
    const totalGuests = input.adults + input.children;
    if (totalGuests > villa.maxGuests) {
      throw new VillaLockValidationError(
        `This villa sleeps up to ${villa.maxGuests} guests.`,
      );
    }

    // Serializes range decisions per villa until PostgreSQL exclusion
    // constraints are introduced in a later hardening phase.
    await tx.$executeRaw(
      Prisma.sql`SELECT pg_advisory_xact_lock(hashtext(${villa.id}))`,
    );

    const now = new Date();
    await cleanupExpiredLocks(tx, now, villa.id);
    await assertNoAvailabilityConflict({ villaId: villa.id, checkIn, checkOut, now }, tx);

    const pricing = calculateVillaPricing({ villa, nights });
    const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);
    const lock = await tx.villaBookingLock.create({
      data: {
        villaId: villa.id,
        checkIn,
        checkOut,
        adults: input.adults,
        children: input.children,
        guestEmail: input.guestEmail || null,
        guestPhone: input.guestPhone || null,
        lockToken: lockTokenId(),
        sessionId: input.sessionId || sessionId(),
        expiresAt,
        quoteSnapshot: {
          villaSlug: villa.slug,
          villaName: villa.name,
          checkIn: toDateKey(checkIn),
          checkOut: toDateKey(checkOut),
          nights,
          adults: input.adults,
          children: input.children,
          nightlyRateCents: pricing.nightlyRateCents,
          subtotalCents: pricing.subtotalCents,
          cleaningFeeCents: pricing.cleaningFeeCents,
          damageProtectionFeeCents: pricing.damageProtectionFeeCents,
          totalCents: pricing.totalCents,
          currency: pricing.currency,
          promoCode: input.promoCode || null,
        },
      },
      include: {
        villa: true,
      },
    });

    return lock;
  });
}

export async function getActiveLockByToken(
  lockToken: string,
  db: VillaDbClient = prisma,
  now = new Date(),
) {
  return db.villaBookingLock.findFirst({
    where: {
      lockToken,
      status: "ACTIVE",
      expiresAt: { gt: now },
    },
    include: {
      villa: true,
    },
  });
}

export async function assertLockValid(
  lockToken: string,
  db: VillaDbClient = prisma,
  now = new Date(),
) {
  const lock = await getActiveLockByToken(lockToken, db, now);
  if (!lock) {
    throw new VillaLockExpiredError();
  }

  await assertNoAvailabilityConflict(
    {
      villaId: lock.villaId,
      checkIn: lock.checkIn,
      checkOut: lock.checkOut,
      now,
      excludeLockId: lock.id,
    },
    db,
  );

  return lock;
}

export async function releaseLock(lockToken: string, db: VillaDbClient = prisma) {
  await db.villaBookingLock.updateMany({
    where: {
      lockToken,
      status: "ACTIVE",
    },
    data: {
      status: "RELEASED",
    },
  });
}

export async function cleanupExpiredLocks(
  db: VillaDbClient = prisma,
  now = new Date(),
  villaId?: string,
) {
  // TODO(cron): call this from a scheduled cleanup route/background worker.
  // Availability already ignores expired locks, so cleanup timing is not
  // correctness-critical.
  return db.villaBookingLock.deleteMany({
    where: {
      ...(villaId ? { villaId } : {}),
      status: { not: "CONSUMED" },
      expiresAt: { lte: now },
    },
  });
}
