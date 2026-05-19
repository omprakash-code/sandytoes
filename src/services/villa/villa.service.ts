import { Prisma, type PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";

export const DEFAULT_VILLA_SLUG = "sandy-toes";

export type VillaDbClient = PrismaClient | Prisma.TransactionClient;

export type ActiveVilla = NonNullable<Awaited<ReturnType<typeof getVillaBySlug>>>;

export class VillaNotFoundError extends Error {
  constructor(slug: string) {
    super(`Villa not found: ${slug}`);
    this.name = "VillaNotFoundError";
  }
}

export async function getVillaBySlug(
  slug = DEFAULT_VILLA_SLUG,
  db: VillaDbClient = prisma,
) {
  return db.villa.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      timezone: true,
      currency: true,
      baseNightlyRateCents: true,
      cleaningFeeCents: true,
      maxGuests: true,
      bedrooms: true,
      bathrooms: true,
      active: true,
    },
  });
}

export async function getRequiredVillaBySlug(
  slug = DEFAULT_VILLA_SLUG,
  db: VillaDbClient = prisma,
) {
  const villa = await getVillaBySlug(slug, db);
  if (!villa || !villa.active) {
    throw new VillaNotFoundError(slug);
  }

  return villa;
}
