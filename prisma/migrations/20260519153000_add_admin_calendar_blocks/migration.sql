-- Phase 4: operational admin calendar, range blocks, and booking activity log.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VillaBlockType') THEN
    CREATE TYPE "VillaBlockType" AS ENUM (
      'OWNER_STAY',
      'MAINTENANCE',
      'MANUAL_BLOCK',
      'PRIVATE_HOLD'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VillaBlockSource') THEN
    CREATE TYPE "VillaBlockSource" AS ENUM (
      'ADMIN',
      'OWNER',
      'OTA',
      'SYSTEM'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BookingActivityType') THEN
    CREATE TYPE "BookingActivityType" AS ENUM (
      'BOOKING_CREATED',
      'BOOKING_CONFIRMED',
      'BOOKING_CANCELLED',
      'DATES_RESCHEDULED',
      'BLOCK_CREATED',
      'BLOCK_REMOVED',
      'LOCK_RELEASED',
      'ADMIN_NOTE_ADDED',
      'NO_SHOW_MARKED',
      'REFUND_MARKED'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'VillaBookingStatus' AND e.enumlabel = 'NO_SHOW'
  ) THEN
    ALTER TYPE "VillaBookingStatus" ADD VALUE 'NO_SHOW';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "VillaBlock" (
  "id" TEXT NOT NULL,
  "villaId" TEXT NOT NULL,
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  "type" "VillaBlockType" NOT NULL,
  "reason" TEXT,
  "source" "VillaBlockSource" NOT NULL DEFAULT 'ADMIN',
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "VillaBlock_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BookingActivityLog" (
  "id" TEXT NOT NULL,
  "villaId" TEXT NOT NULL,
  "bookingId" TEXT,
  "actorId" TEXT,
  "type" "BookingActivityType" NOT NULL,
  "message" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BookingActivityLog_pkey" PRIMARY KEY ("id")
);

INSERT INTO "VillaBlock" (
  "id",
  "villaId",
  "startDate",
  "endDate",
  "type",
  "reason",
  "source",
  "createdById",
  "createdAt",
  "updatedAt"
)
SELECT
  'legacy_block_' || bd."id",
  bd."villaId",
  bd."date",
  bd."date" + INTERVAL '1 day',
  'MANUAL_BLOCK',
  bd."reason",
  'ADMIN',
  bd."createdById",
  bd."createdAt",
  bd."updatedAt"
FROM "VillaBlockedDate" bd
WHERE NOT EXISTS (
  SELECT 1
  FROM "VillaBlock" vb
  WHERE vb."id" = 'legacy_block_' || bd."id"
);

CREATE INDEX IF NOT EXISTS "VillaBlock_villaId_startDate_endDate_idx"
  ON "VillaBlock"("villaId", "startDate", "endDate");

CREATE INDEX IF NOT EXISTS "VillaBlock_type_createdAt_idx"
  ON "VillaBlock"("type", "createdAt");

CREATE INDEX IF NOT EXISTS "VillaBlock_source_createdAt_idx"
  ON "VillaBlock"("source", "createdAt");

CREATE INDEX IF NOT EXISTS "VillaBlock_createdById_idx"
  ON "VillaBlock"("createdById");

CREATE INDEX IF NOT EXISTS "BookingActivityLog_villaId_createdAt_idx"
  ON "BookingActivityLog"("villaId", "createdAt");

CREATE INDEX IF NOT EXISTS "BookingActivityLog_bookingId_createdAt_idx"
  ON "BookingActivityLog"("bookingId", "createdAt");

CREATE INDEX IF NOT EXISTS "BookingActivityLog_actorId_createdAt_idx"
  ON "BookingActivityLog"("actorId", "createdAt");

CREATE INDEX IF NOT EXISTS "BookingActivityLog_type_createdAt_idx"
  ON "BookingActivityLog"("type", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'VillaBlock_villaId_fkey'
  ) THEN
    ALTER TABLE "VillaBlock"
      ADD CONSTRAINT "VillaBlock_villaId_fkey"
      FOREIGN KEY ("villaId") REFERENCES "Villa"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'VillaBlock_createdById_fkey'
  ) THEN
    ALTER TABLE "VillaBlock"
      ADD CONSTRAINT "VillaBlock_createdById_fkey"
      FOREIGN KEY ("createdById") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'BookingActivityLog_villaId_fkey'
  ) THEN
    ALTER TABLE "BookingActivityLog"
      ADD CONSTRAINT "BookingActivityLog_villaId_fkey"
      FOREIGN KEY ("villaId") REFERENCES "Villa"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'BookingActivityLog_bookingId_fkey'
  ) THEN
    ALTER TABLE "BookingActivityLog"
      ADD CONSTRAINT "BookingActivityLog_bookingId_fkey"
      FOREIGN KEY ("bookingId") REFERENCES "VillaBooking"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'BookingActivityLog_actorId_fkey'
  ) THEN
    ALTER TABLE "BookingActivityLog"
      ADD CONSTRAINT "BookingActivityLog_actorId_fkey"
      FOREIGN KEY ("actorId") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
