/**
 * Slot Template Seed Script
 * Populates the database with initial slot template data.
 * Safe to run multiple times - uses upsert to prevent duplicates.
 * Last Updated: 01-jan-2026 07:50 PM
 * Last seeded to database: 01-jan-2026 07:50 PM
 *
 * When to use:
 * Historical standalone Pitampura slot-template seed. Do not run on live unless
 * Pitampura slot templates should be reset from this file.
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
   Types
------------------------------ */
type SlotSeed = {
  startTime: string;
  endTime: string;
};

/* -----------------------------
   Slot Template Seed Data
------------------------------ */
const slotTemplateSeed: Record<string, SlotSeed[]> = {
  "Theatre 1": [
    { startTime: "09:00", endTime: "12:00" },
    { startTime: "12:30", endTime: "15:30" },
    { startTime: "16:00", endTime: "17:30" },
    { startTime: "18:00", endTime: "21:00" },
    { startTime: "21:30", endTime: "00:30" },
  ],
  "Theatre 2": [
    { startTime: "09:30", endTime: "12:30" },
    { startTime: "13:00", endTime: "16:00" },
    { startTime: "16:30", endTime: "18:00" },
    { startTime: "18:30", endTime: "21:30" },
    { startTime: "22:00", endTime: "01:00" },
  ],
  "Theatre 3": [
    { startTime: "10:00", endTime: "13:00" },
    { startTime: "13:30", endTime: "16:30" },
    { startTime: "17:00", endTime: "20:00" },
    { startTime: "20:30", endTime: "23:30" },
  ],
};

const THEATRE_BASE_REGULAR_PRICE: Record<string, number> = {
  "Theatre 1": 1399,
  "Theatre 2": 1599,
  "Theatre 3": 1799,
};

const SHORT_SLOT_DISCOUNT = 750;

/* -----------------------------
   Helpers
------------------------------ */
function calculateDuration(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);

  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;

  return endMin > startMin
    ? endMin - startMin
    : endMin + 1440 - startMin;
}

/* -----------------------------
   Seed Slot Templates
------------------------------ */
async function seedSlotTemplates(): Promise<void> {
  console.log("Seeding slot templates");

  const theatres = await prisma.theatre.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });

  for (const theatre of theatres) {
    const slots = slotTemplateSeed[theatre.name];
    if (!slots) continue;

    for (const slot of slots) {
      const durationMin = calculateDuration(
        slot.startTime,
        slot.endTime
      );
      const isShortSlot = durationMin === 90;
      const decorationMandatory =
        theatre.name === "Theatre 1" || theatre.name === "Theatre 3"
          ? true
          : isShortSlot;
      const baseRegularPrice =
        THEATRE_BASE_REGULAR_PRICE[theatre.name] ?? 1399;
      const discount = isShortSlot ? SHORT_SLOT_DISCOUNT : 0;
      const finalRegular = Math.max(baseRegularPrice - discount, 0);

      await prisma.slotTemplate.upsert({
        where: {
          theatreId_startTime_endTime: {
            theatreId: theatre.id,
            startTime: slot.startTime,
            endTime: slot.endTime,
          },
        },
        update: {
          regularPrice: finalRegular,
          salePrice: null,
          durationMin,
          bufferMin: 30,
          decorationMandatory,
          isActive: true,
        },
        create: {
          theatreId: theatre.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          durationMin,
          bufferMin: 30,
          regularPrice: finalRegular,
          salePrice: null,
          decorationMandatory,
          isActive: true,
        },
      });
    }
  }

  console.log("Slot templates seeded");
}

/* -----------------------------
   Run
------------------------------ */
seedSlotTemplates()
  .catch((e) => {
    console.error("Slot template seeding failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
