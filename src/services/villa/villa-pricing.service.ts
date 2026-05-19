import type { ActiveVilla } from "@/services/villa/villa.service";

type CalculateVillaPricingInput = {
  villa: ActiveVilla;
  nights: number;
};

export type VillaPricingSnapshot = {
  nightlyRateCents: number;
  subtotalCents: number;
  cleaningFeeCents: number;
  damageProtectionFeeCents: number;
  totalCents: number;
  currency: string;
};

export function calculateVillaPricing({
  villa,
  nights,
}: CalculateVillaPricingInput): VillaPricingSnapshot {
  const normalizedNights = Math.max(1, Math.trunc(nights));
  const nightlyRateCents = villa.baseNightlyRateCents;
  const subtotalCents = normalizedNights * nightlyRateCents;
  const cleaningFeeCents = villa.cleaningFeeCents;
  const damageProtectionFeeCents = 0;

  return {
    nightlyRateCents,
    subtotalCents,
    cleaningFeeCents,
    damageProtectionFeeCents,
    totalCents: subtotalCents + cleaningFeeCents + damageProtectionFeeCents,
    currency: villa.currency,
  };
}
