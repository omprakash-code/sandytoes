/**
 * Theatre Seed Script
 * Populates the database with initial theatre data.
 * Safe to run multiple times - uses upsert to prevent duplicates.
 * Last Updated: 01-jan-2026 07:50 PM
 * Last seeded to database: 01-jan-2026 07:50 PM
 *
 * When to use:
 * Historical standalone Pitampura theatre seed. Do not run on live unless you
 * intentionally want to overwrite admin-updated Pitampura theatre data.
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
   Theatre Seed Data
------------------------------ */
const theatresSeed = [
  {
    name: "Theatre 1",
    images: [
      "/media/booking/villa-details/hero-1.jpg",
      "/media/booking/villa-details/hero-1.jpg",
      "/media/booking/villa-details/hero-1.jpg",
    ],
    capacity: 2,
    baseGuests: 2,
    hasFood: true,
    decorationPrice: 750,
    extraPersonPrice: 300,
    menuFile: "",
    mapUrl: "https://maps.app.goo.gl/JS3stLbATdCEjDG96",
  },
  {
    name: "Theatre 2",
    images: [
      "/media/booking/villa-details/hero-1.jpg",
      "/media/booking/villa-details/hero-1.jpg",
      "/media/booking/villa-details/hero-1.jpg",
    ],
    capacity: 6,
    baseGuests: 4,
    hasFood: true,
    decorationPrice: 750,
    extraPersonPrice: 300,
    menuFile: "",
    mapUrl: "https://maps.app.goo.gl/JS3stLbATdCEjDG96",
  },
  {
    name: "Theatre 3",
    images: [
      "/media/booking/villa-details/hero-1.jpg",
      "/media/booking/villa-details/hero-1.jpg",
      "/media/booking/villa-details/hero-1.jpg",
    ],
    capacity: 10,
    baseGuests: 4,
    hasFood: true,
    decorationPrice: 750,
    extraPersonPrice: 300,
    menuFile: "",
    mapUrl: "https://maps.app.goo.gl/JS3stLbATdCEjDG96",
  },
];

/* -----------------------------
   Seed Theatres
------------------------------ */
async function seedTheatres() {
  console.log("Seeding theatres");

  const location = await prisma.location.findUnique({
    where: { name: "Pitampura" },
  });

  if (!location) {
    throw new Error("Pitampura location not found. Seed locations first.");
  }

  for (let i = 0; i < theatresSeed.length; i++) {
    const theatre = theatresSeed[i];

    await prisma.theatre.upsert({
      where: {
        name_locationId: {
          name: theatre.name,
          locationId: location.id,
        },
      },
      update: {
        images: theatre.images,
        capacity: theatre.capacity,
        baseGuests: theatre.baseGuests,
        hasFood: theatre.hasFood,
        decorationPrice: theatre.decorationPrice,
        extraPersonPrice: theatre.extraPersonPrice,
        menuFile: theatre.menuFile,
        mapUrl: theatre.mapUrl,
        sortOrder: i + 1,
        isActive: true,
      },
      create: {
        name: theatre.name,
        images: theatre.images,
        capacity: theatre.capacity,
        baseGuests: theatre.baseGuests,
        hasFood: theatre.hasFood,
        decorationPrice: theatre.decorationPrice,
        extraPersonPrice: theatre.extraPersonPrice,
        menuFile: theatre.menuFile,
        mapUrl: theatre.mapUrl,
        sortOrder: i + 1,
        isActive: true,
        locationId: location.id,
      },
    });
  }

  console.log("Theatres seeded");
}

/* -----------------------------
   Run
------------------------------ */
seedTheatres()
  .catch((e) => {
    console.error("Theatre seeding failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
