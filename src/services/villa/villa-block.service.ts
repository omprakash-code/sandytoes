import { Prisma, type VillaBlockSource, type VillaBlockType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { parseDateKey } from "@/lib/villa-booking";
import {
  assertNoAvailabilityConflict,
  VillaDateRangeUnavailableError,
} from "@/services/villa/villa-availability.service";
import { logBookingActivity } from "@/services/villa/villa-activity.service";
import {
  DEFAULT_VILLA_SLUG,
  getRequiredVillaBySlug,
} from "@/services/villa/villa.service";

export { VillaDateRangeUnavailableError };

export class VillaBlockValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VillaBlockValidationError";
  }
}

export type CreateVillaBlockInput = {
  villaSlug?: string;
  startDate: string;
  endDate: string;
  type: VillaBlockType;
  reason?: string;
  source?: VillaBlockSource;
  actorId?: string | null;
};

function parseBlockRange(startDateValue: string, endDateValue: string) {
  const startDate = parseDateKey(startDateValue);
  const endDate = parseDateKey(endDateValue);
  if (!startDate || !endDate || endDate <= startDate) {
    throw new VillaBlockValidationError("Choose a valid blocked date range.");
  }

  return { startDate, endDate };
}

export async function createVillaBlock(input: CreateVillaBlockInput) {
  const { startDate, endDate } = parseBlockRange(input.startDate, input.endDate);

  return prisma.$transaction(async (tx) => {
    const villa = await getRequiredVillaBySlug(input.villaSlug || DEFAULT_VILLA_SLUG, tx);

    await tx.$executeRaw(
      Prisma.sql`SELECT pg_advisory_xact_lock(hashtext(${villa.id}))`,
    );

    await assertNoAvailabilityConflict({ villaId: villa.id, checkIn: startDate, checkOut: endDate }, tx);

    const block = await tx.villaBlock.create({
      data: {
        villaId: villa.id,
        startDate,
        endDate,
        type: input.type,
        reason: input.reason?.trim() || null,
        source: input.source ?? "ADMIN",
        createdById: input.actorId ?? null,
      },
    });

    await logBookingActivity(
      {
        villaId: villa.id,
        actorId: input.actorId ?? null,
        type: "BLOCK_CREATED",
        message: `Blocked ${input.startDate} to ${input.endDate}`,
        metadata: {
          blockId: block.id,
          startDate: input.startDate,
          endDate: input.endDate,
          type: input.type,
          source: input.source ?? "ADMIN",
        },
      },
      tx,
    );

    return block;
  });
}

export async function removeVillaBlock({
  id,
  actorId,
}: {
  id: string;
  actorId?: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const block = await tx.villaBlock.findUnique({ where: { id } });
    if (!block) {
      throw new VillaBlockValidationError("Blocked range was not found.");
    }

    await tx.villaBlock.delete({ where: { id } });
    await logBookingActivity(
      {
        villaId: block.villaId,
        actorId: actorId ?? null,
        type: "BLOCK_REMOVED",
        message: `Removed blocked range ${block.startDate.toISOString().slice(0, 10)} to ${block.endDate.toISOString().slice(0, 10)}`,
        metadata: {
          blockId: block.id,
          startDate: block.startDate.toISOString().slice(0, 10),
          endDate: block.endDate.toISOString().slice(0, 10),
          type: block.type,
          source: block.source,
        },
      },
      tx,
    );

    return block;
  });
}

export async function listVillaBlocks(villaSlug = DEFAULT_VILLA_SLUG) {
  const villa = await getRequiredVillaBySlug(villaSlug);
  return prisma.villaBlock.findMany({
    where: { villaId: villa.id },
    orderBy: [{ startDate: "asc" }, { createdAt: "desc" }],
    take: 250,
  });
}
