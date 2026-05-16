/**
 * App Settings Seed Script
 * Seeds global configuration values.
 * Safe to run multiple times (upsert).
 * Last Updated: 24-Jan-2026
 *
 * When to use:
 * Run only when app settings should be restored from code. Keep disabled if
 * live settings are managed through admin or environment-specific operations.
 */

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

/* -----------------------------
   Prisma Setup
------------------------------ */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/* -----------------------------
   Seed App Settings
------------------------------ */
async function seedAppSettings() {
  console.log("Seeding app settings");

  const settings = [
    {
      key: "SPECIAL_SLOT_TEXT",
      value: "Special Price",
    },
    {
      key: "ADVANCE_PAYMENT_AMOUNT",
      value: "750",
    },
    {
      key: "BOOKING_LOCK_MINUTES",
      value: "10",
    },
    {
      key: "SLOT_EXPIRY_MODE",
      value: "START_TIME",
    },
    {
      key: "SLOT_EXPIRY_GRACE_MINUTES",
      value: "30",
    },
  ];

  for (const setting of settings) {
    await prisma.appSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: {
        key: setting.key,
        value: setting.value,
      },
    });
  }

  console.log("App settings seeded");
}

seedAppSettings()
  .catch((e) => {
    console.error("App settings seeding failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
