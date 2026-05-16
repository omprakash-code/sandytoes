/**
 * Slot Generation Seed Script
 * Safe to run multiple times - uses upsert to prevent duplicates.
 * Last Updated: 01-jan-2026 07:50 PM
 * Last generated to database: 01-jan-2026 07:50 PM
 * Generates slots based on existing slot templates for a specific date range.
 * Generates slots for the next 90 days.
 *
 * When to use:
 * Historical standalone slot sync for all active templates. Current main seed
 * has a Noida-only slot sync; use this only when every location should be
 * synced from templates.
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
   Config
------------------------------ */
const DAYS_TO_GENERATE = 90;

/* -----------------------------
   Seed Slots
------------------------------ */
async function seedSlots(): Promise<void> {
    console.log("Syncing slots for next 3 months");

    const templates = await prisma.slotTemplate.findMany({
        where: { isActive: true },
        include: {
            theatre: {
                select: {
                    id: true,
                    baseGuests: true,
                },
            },
        },
    });

    if (templates.length === 0) {
        console.log("No active slot templates found");
        return;
    }

    function istMidnight(date = new Date()) {
        const istDateStr = date.toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata",
        }); // YYYY-MM-DD

        return new Date(`${istDateStr}T00:00:00+05:30`);
    }

    const baseDate = istMidnight();

    let createdCount = 0;
    let updatedCount = 0;
    let skippedBookedCount = 0;

    for (let day = 0; day < DAYS_TO_GENERATE; day++) {
        const slotDate = new Date(baseDate);
        slotDate.setDate(baseDate.getDate() + day);

        for (const template of templates) {
            const isSpecial = template.salePrice !== null || template.durationMin === 90;
            const finalPrice = template.salePrice ?? template.regularPrice;
            const slotMatchWhere = {
                theatreId: template.theatreId,
                slotTemplateId: template.id,
                date: slotDate,
            };
            const slotSyncData = {
                startTime: template.startTime,
                endTime: template.endTime,
                durationMin: template.durationMin,
                baseGuests: template.theatre.baseGuests,
                basePrice: finalPrice,
                regularPrice: template.regularPrice,
                salePrice: template.salePrice,
                finalPrice,
                isSpecial,
                decorationMandatory: template.decorationMandatory,
                discountText:
                    template.durationMin === 90
                        ? "₹750 less"
                        : null,
            };

            const existingSlot = await prisma.slot.findFirst({
                where: slotMatchWhere,
                select: { id: true, status: true },
            });

            if (existingSlot) {
                const updateResult = await prisma.slot.updateMany({
                    where: {
                        ...slotMatchWhere,
                        status: { not: "BOOKED" },
                    },
                    data: slotSyncData,
                });

                if (updateResult.count > 0) {
                    updatedCount += updateResult.count;
                } else {
                    skippedBookedCount++;
                }
                continue;
            }

            await prisma.slot.create({
                data: {
                    theatreId: template.theatreId,
                    slotTemplateId: template.id,

                    date: slotDate,
                    ...slotSyncData,
                    status: "AVAILABLE",
                },
            });

            createdCount++;
        }
    }

    console.log(
        `Slots synced: created=${createdCount}, updated=${updatedCount}, booked-skipped=${skippedBookedCount}`
    );
}

/* -----------------------------
   Run
------------------------------ */
seedSlots()
    .catch((e) => {
        console.error("Slot generation failed", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
