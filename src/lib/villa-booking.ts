import { customAlphabet } from "nanoid";

const bookingRefId = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);
const MS_PER_DAY = 86_400_000;

export function parseDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function daysBetweenDateKeys(checkIn: Date, checkOut: Date) {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / MS_PER_DAY);
}

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export function listNightKeys(checkIn: Date, checkOut: Date) {
  const nights = daysBetweenDateKeys(checkIn, checkOut);
  return Array.from({ length: Math.max(0, nights) }, (_, index) =>
    toDateKey(addDays(checkIn, index))
  );
}

export function buildVillaBookingRef() {
  return `ST-${new Date().getUTCFullYear()}-${bookingRefId()}`;
}

export function normalizeCardLast4(value?: string) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.length >= 4 ? digits.slice(-4) : null;
}

export function formatCents(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}
