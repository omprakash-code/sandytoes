/**
 * Noida Booking Seed Script
 *
 * Purpose:
 * Seeds only the Noida Sector 144 booking setup: location, theatres,
 * theatre card content, slot templates, and missing future slots.
 *
 * When to use:
 * Use this as a targeted repair/deploy script if Noida data needs to be
 * refreshed without running the main seed. The normal live path is still
 * `npx prisma db seed`, which currently runs a Noida-only seed.
 *
 * Images:
 * Theatre image URLs point to admin upload routes. Upload matching files on
 * live when needed; this script does not copy media files.
 *
 * Optional:
 *   NOIDA_SETUP_DAYS_AHEAD=1 node --loader ts-node/esm --experimental-specifier-resolution=node prisma/seedBackup/08-seed.noida-booking.ts
 */

import "dotenv/config";
import { addDays } from "date-fns";
import { formatInTimeZone, toDate } from "date-fns-tz";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  LOCATION_SEED_CONFIGS,
  type TheatreSeedConfig,
} from "./location-theatre-config";

const IST_TIMEZONE = "Asia/Kolkata";
const DEFAULT_DAYS_AHEAD = 90;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function calculateDuration(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  return endMin > startMin ? endMin - startMin : endMin + 1440 - startMin;
}

function getIstDateKey(date: Date) {
  return formatInTimeZone(date, IST_TIMEZONE, "yyyy-MM-dd");
}

function getIstMidnightFromDateKey(dateKey: string) {
  return toDate(`${dateKey}T00:00:00+05:30`, { timeZone: IST_TIMEZONE });
}

function resolveDaysAhead() {
  const parsed = Number(process.env.NOIDA_SETUP_DAYS_AHEAD ?? DEFAULT_DAYS_AHEAD);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_DAYS_AHEAD;
  return Math.trunc(parsed);
}

async function upsertTheatreWithTemplates(
  locationId: string,
  theatre: TheatreSeedConfig
) {
  const upsertedTheatre = await prisma.theatre.upsert({
    where: {
      name_locationId: {
        name: theatre.name,
        locationId,
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
      footerMessage: theatre.footerMessage ?? null,
      cardContent: theatre.cardContent ?? undefined,
      sortOrder: theatre.sortOrder,
      isActive: true,
    },
    create: {
      locationId,
      name: theatre.name,
      images: theatre.images,
      capacity: theatre.capacity,
      baseGuests: theatre.baseGuests,
      hasFood: theatre.hasFood,
      decorationPrice: theatre.decorationPrice,
      extraPersonPrice: theatre.extraPersonPrice,
      menuFile: theatre.menuFile,
      mapUrl: theatre.mapUrl,
      footerMessage: theatre.footerMessage ?? null,
      cardContent: theatre.cardContent ?? undefined,
      sortOrder: theatre.sortOrder,
      isActive: true,
    },
    select: {
      id: true,
      baseGuests: true,
    },
  });

  for (const template of theatre.slotTemplates) {
    await prisma.slotTemplate.upsert({
      where: {
        theatreId_startTime_endTime: {
          theatreId: upsertedTheatre.id,
          startTime: template.startTime,
          endTime: template.endTime,
        },
      },
      update: {
        durationMin: calculateDuration(template.startTime, template.endTime),
        bufferMin: template.bufferMin ?? 30,
        regularPrice: template.regularPrice,
        salePrice: template.salePrice ?? null,
        decorationMandatory: template.decorationMandatory ?? false,
        isActive: true,
      },
      create: {
        theatreId: upsertedTheatre.id,
        startTime: template.startTime,
        endTime: template.endTime,
        durationMin: calculateDuration(template.startTime, template.endTime),
        bufferMin: template.bufferMin ?? 30,
        regularPrice: template.regularPrice,
        salePrice: template.salePrice ?? null,
        decorationMandatory: template.decorationMandatory ?? false,
        isActive: true,
      },
    });
  }

  return upsertedTheatre;
}

async function syncFutureSlotsForLocation(locationName: string, daysAhead: number) {
  const location = await prisma.location.findUnique({
    where: { name: locationName },
    select: {
      id: true,
      theatres: {
        where: { isActive: true },
        select: {
          id: true,
          baseGuests: true,
          slotTemplates: {
            where: { isActive: true },
            select: {
              id: true,
              startTime: true,
              endTime: true,
              durationMin: true,
              regularPrice: true,
              salePrice: true,
              decorationMandatory: true,
            },
          },
        },
      },
    },
  });

  if (!location) {
    throw new Error(`Location ${locationName} not found`);
  }

  const todayKey = getIstDateKey(new Date());
  const windowStart = getIstMidnightFromDateKey(todayKey);

  let createdCount = 0;
  let updatedCount = 0;
  let skippedBookedCount = 0;

  for (const theatre of location.theatres) {
    for (const template of theatre.slotTemplates) {
      const finalPrice = template.salePrice ?? template.regularPrice;
      const slotSyncData = {
        startTime: template.startTime,
        endTime: template.endTime,
        durationMin: template.durationMin,
        basePrice: finalPrice,
        baseGuests: theatre.baseGuests,
        regularPrice: template.regularPrice,
        salePrice: template.salePrice,
        finalPrice,
        isSpecial: template.salePrice !== null,
        decorationMandatory: template.decorationMandatory,
        discountText: null,
      };

      for (let offset = 0; offset < daysAhead; offset += 1) {
        const slotDate = addDays(windowStart, offset);
        const slotMatchWhere = {
          theatreId: theatre.id,
          slotTemplateId: template.id,
          date: slotDate,
        };

        const existingSlot = await prisma.slot.findFirst({
          where: slotMatchWhere,
          select: { id: true, status: true },
        });

        if (existingSlot) {
          const result = await prisma.slot.updateMany({
            where: {
              ...slotMatchWhere,
              status: { not: "BOOKED" },
            },
            data: slotSyncData,
          });

          if (result.count > 0) {
            updatedCount += result.count;
          } else {
            skippedBookedCount += 1;
          }
          continue;
        }

        await prisma.slot.create({
          data: {
          theatreId: theatre.id,
          slotTemplateId: template.id,
          date: slotDate,
          ...slotSyncData,
          status: "AVAILABLE" as const,
          },
        });
        createdCount += 1;
      }
    }
  }

  return { createdCount, updatedCount, skippedBookedCount };
}

async function main() {
  const config = LOCATION_SEED_CONFIGS.find(
    (location) => location.name === "Noida Sector 144"
  );

  if (!config) {
    throw new Error("Noida Sector 144 config is missing");
  }

  const location = await prisma.location.upsert({
    where: { name: config.name },
    update: {
      city: config.city,
      sortOrder: config.sortOrder,
      isActive: true,
    },
    create: {
      name: config.name,
      city: config.city,
      sortOrder: config.sortOrder,
      isActive: true,
    },
    select: { id: true },
  });

  for (const theatre of config.theatres) {
    await upsertTheatreWithTemplates(location.id, theatre);
  }

  const { createdCount, updatedCount, skippedBookedCount } = await syncFutureSlotsForLocation(
    config.name,
    resolveDaysAhead()
  );

  console.log(
    `Noida booking setup complete. Created ${createdCount} slots, updated ${updatedCount} slots, skipped ${skippedBookedCount} booked slots.`
  );
}

main()
  .catch((error) => {
    console.error("Noida booking setup failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
