-- Phase 2: dedicated temporary date-range holds for villa checkout.
-- Booking rows should represent real reservation/payment lifecycle records;
-- this table represents short-lived checkout holds only.

CREATE TABLE IF NOT EXISTS "VillaBookingLock" (
  "id" TEXT NOT NULL,
  "villaId" TEXT NOT NULL,
  "checkIn" DATE NOT NULL,
  "checkOut" DATE NOT NULL,
  "adults" INTEGER NOT NULL,
  "children" INTEGER NOT NULL DEFAULT 0,
  "guestEmail" TEXT,
  "guestPhone" TEXT,
  "quoteSnapshot" JSONB,
  "lockToken" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "VillaBookingLock_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "VillaBookingLock_lockToken_key"
  ON "VillaBookingLock"("lockToken");

CREATE INDEX IF NOT EXISTS "VillaBookingLock_villaId_idx"
  ON "VillaBookingLock"("villaId");

CREATE INDEX IF NOT EXISTS "VillaBookingLock_villaId_checkIn_checkOut_idx"
  ON "VillaBookingLock"("villaId", "checkIn", "checkOut");

CREATE INDEX IF NOT EXISTS "VillaBookingLock_expiresAt_idx"
  ON "VillaBookingLock"("expiresAt");

CREATE INDEX IF NOT EXISTS "VillaBookingLock_sessionId_idx"
  ON "VillaBookingLock"("sessionId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'VillaBookingLock_villaId_fkey'
  ) THEN
    ALTER TABLE "VillaBookingLock"
      ADD CONSTRAINT "VillaBookingLock_villaId_fkey"
      FOREIGN KEY ("villaId") REFERENCES "Villa"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
