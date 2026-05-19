-- Phase 1 Sandy Toes villa foundation.
-- This migration targets the active villa MVP schema that was previously created via db push.
-- It intentionally preserves propertySlug/propertyName for temporary backward compatibility.

CREATE TABLE IF NOT EXISTS "Villa" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "timezone" TEXT NOT NULL DEFAULT 'America/Nassau',
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "baseNightlyRateCents" INTEGER NOT NULL,
  "cleaningFeeCents" INTEGER NOT NULL DEFAULT 0,
  "maxGuests" INTEGER NOT NULL DEFAULT 14,
  "bedrooms" INTEGER NOT NULL DEFAULT 4,
  "bathrooms" DECIMAL(3,1) NOT NULL DEFAULT 4.5,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Villa_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Villa_slug_key" ON "Villa"("slug");
CREATE INDEX IF NOT EXISTS "Villa_active_idx" ON "Villa"("active");

INSERT INTO "Villa" (
  "id",
  "slug",
  "name",
  "timezone",
  "currency",
  "baseNightlyRateCents",
  "cleaningFeeCents",
  "maxGuests",
  "bedrooms",
  "bathrooms",
  "active",
  "updatedAt"
)
VALUES (
  'villa_sandy_toes',
  'sandy-toes',
  'Sandy Toes at Treasure Cay',
  'America/Nassau',
  'USD',
  87400,
  0,
  14,
  4,
  4.5,
  true,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "timezone" = EXCLUDED."timezone",
  "currency" = EXCLUDED."currency",
  "baseNightlyRateCents" = EXCLUDED."baseNightlyRateCents",
  "cleaningFeeCents" = EXCLUDED."cleaningFeeCents",
  "maxGuests" = EXCLUDED."maxGuests",
  "bedrooms" = EXCLUDED."bedrooms",
  "bathrooms" = EXCLUDED."bathrooms",
  "active" = EXCLUDED."active",
  "updatedAt" = CURRENT_TIMESTAMP;

ALTER TABLE "VillaBooking" ADD COLUMN IF NOT EXISTS "villaId" TEXT;
ALTER TABLE "VillaBlockedDate" ADD COLUMN IF NOT EXISTS "villaId" TEXT;
ALTER TABLE "VillaPayment" ADD COLUMN IF NOT EXISTS "villaId" TEXT;
ALTER TABLE "VillaAdminNote" ADD COLUMN IF NOT EXISTS "villaId" TEXT;
ALTER TABLE "VillaEmailLog" ADD COLUMN IF NOT EXISTS "villaId" TEXT;

UPDATE "VillaBooking"
SET "villaId" = "Villa"."id"
FROM "Villa"
WHERE "VillaBooking"."villaId" IS NULL
  AND "Villa"."slug" = COALESCE(NULLIF("VillaBooking"."propertySlug", ''), 'sandy-toes');

UPDATE "VillaBlockedDate"
SET "villaId" = "Villa"."id"
FROM "Villa"
WHERE "VillaBlockedDate"."villaId" IS NULL
  AND "Villa"."slug" = COALESCE(NULLIF("VillaBlockedDate"."propertySlug", ''), 'sandy-toes');

UPDATE "VillaPayment"
SET "villaId" = "VillaBooking"."villaId"
FROM "VillaBooking"
WHERE "VillaPayment"."villaId" IS NULL
  AND "VillaPayment"."bookingId" = "VillaBooking"."id";

UPDATE "VillaAdminNote"
SET "villaId" = "VillaBooking"."villaId"
FROM "VillaBooking"
WHERE "VillaAdminNote"."villaId" IS NULL
  AND "VillaAdminNote"."bookingId" = "VillaBooking"."id";

UPDATE "VillaEmailLog"
SET "villaId" = "VillaBooking"."villaId"
FROM "VillaBooking"
WHERE "VillaEmailLog"."villaId" IS NULL
  AND "VillaEmailLog"."bookingId" = "VillaBooking"."id";

ALTER TABLE "VillaBooking" ALTER COLUMN "villaId" SET NOT NULL;
ALTER TABLE "VillaBlockedDate" ALTER COLUMN "villaId" SET NOT NULL;
ALTER TABLE "VillaPayment" ALTER COLUMN "villaId" SET NOT NULL;
ALTER TABLE "VillaAdminNote" ALTER COLUMN "villaId" SET NOT NULL;
ALTER TABLE "VillaEmailLog" ALTER COLUMN "villaId" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'VillaBooking_villaId_fkey'
  ) THEN
    ALTER TABLE "VillaBooking"
    ADD CONSTRAINT "VillaBooking_villaId_fkey"
    FOREIGN KEY ("villaId") REFERENCES "Villa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'VillaBlockedDate_villaId_fkey'
  ) THEN
    ALTER TABLE "VillaBlockedDate"
    ADD CONSTRAINT "VillaBlockedDate_villaId_fkey"
    FOREIGN KEY ("villaId") REFERENCES "Villa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'VillaPayment_villaId_fkey'
  ) THEN
    ALTER TABLE "VillaPayment"
    ADD CONSTRAINT "VillaPayment_villaId_fkey"
    FOREIGN KEY ("villaId") REFERENCES "Villa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'VillaAdminNote_villaId_fkey'
  ) THEN
    ALTER TABLE "VillaAdminNote"
    ADD CONSTRAINT "VillaAdminNote_villaId_fkey"
    FOREIGN KEY ("villaId") REFERENCES "Villa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'VillaEmailLog_villaId_fkey'
  ) THEN
    ALTER TABLE "VillaEmailLog"
    ADD CONSTRAINT "VillaEmailLog_villaId_fkey"
    FOREIGN KEY ("villaId") REFERENCES "Villa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "VillaBooking_villaId_checkIn_checkOut_idx"
  ON "VillaBooking"("villaId", "checkIn", "checkOut");
CREATE INDEX IF NOT EXISTS "VillaBlockedDate_villaId_date_idx"
  ON "VillaBlockedDate"("villaId", "date");
CREATE UNIQUE INDEX IF NOT EXISTS "VillaBlockedDate_villaId_date_key"
  ON "VillaBlockedDate"("villaId", "date");
CREATE INDEX IF NOT EXISTS "VillaPayment_villaId_createdAt_idx"
  ON "VillaPayment"("villaId", "createdAt");
CREATE INDEX IF NOT EXISTS "VillaAdminNote_villaId_createdAt_idx"
  ON "VillaAdminNote"("villaId", "createdAt");
CREATE INDEX IF NOT EXISTS "VillaEmailLog_villaId_createdAt_idx"
  ON "VillaEmailLog"("villaId", "createdAt");
