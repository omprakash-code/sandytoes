/**
 * Location Seed Script
 * Populates the database with initial location data.
 * Safe to run multiple times - uses upsert to prevent duplicates.
 * Last Updated: 01-jan-2026 07:50 PM
 * Last seeded to database: 01-jan-2026 07:50 PM
 *
 * When to use:
 * Historical standalone seed for base locations. Use carefully on live because
 * current location data may be admin-managed.
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
   Seed Locations
------------------------------ */
async function seedLocations() {
  console.log("Seeding locations");

  const locations = [
    { name: "Pitampura", city: "Delhi", sortOrder: 1 },
    { name: "Noida Sector 144", city: "Noida", sortOrder: 2 },
  ];

  for (const loc of locations) {
    await prisma.location.upsert({
      where: { name: loc.name },
      update: {
        city: loc.city,
        sortOrder: loc.sortOrder,
        isActive: true,
      },
      create: {
        name: loc.name,
        city: loc.city,
        sortOrder: loc.sortOrder,
        isActive: true,
      },
    });
  }

  console.log("Locations seeded");
}

/* -----------------------------
   Run
------------------------------ */
seedLocations()
  .catch((e) => {
    console.error("Location seeding failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
