-- Phase 3: make villa locks consumable so one lock can produce at most one booking.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VillaBookingLockStatus') THEN
    CREATE TYPE "VillaBookingLockStatus" AS ENUM ('ACTIVE', 'CONSUMED', 'RELEASED');
  END IF;
END $$;

ALTER TABLE "VillaBookingLock"
  ADD COLUMN IF NOT EXISTS "status" "VillaBookingLockStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS "consumedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "consumedBookingRef" TEXT;

CREATE INDEX IF NOT EXISTS "VillaBookingLock_status_expiresAt_idx"
  ON "VillaBookingLock"("status", "expiresAt");

CREATE INDEX IF NOT EXISTS "VillaBookingLock_consumedBookingRef_idx"
  ON "VillaBookingLock"("consumedBookingRef");
