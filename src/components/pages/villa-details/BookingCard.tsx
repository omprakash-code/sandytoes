"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, LockKeyhole, MailCheck, ShieldCheck, Tag } from "lucide-react";
import DateRangePicker, {
  daysBetween,
  dateFromKey,
  GuestStepper,
  toDateKey,
  type DateRangeValue,
} from "@/components/booking-engine/DateRangePicker";
import { BRAND } from "@/constants/brand";

const NIGHTLY_RATE = 874;
const SERVICE_FEE = 225;
const TAX_RATE = 0.12;
const CHECKOUT_DRAFT_KEY = "sandy-toes-checkout-draft";
const CHECKOUT_DRAFT_MAX_AGE_MS = 60 * 60 * 1000;

type CheckoutDraft = {
  updatedAt?: number;
  stayInputs?: {
    checkIn?: string;
    checkOut?: string;
    adults?: number;
    children?: number;
    promoCode?: string;
  };
};

function getCheckoutDraft() {
  if (typeof window === "undefined") return null;
  try {
    const rawDraft = window.sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
    if (!rawDraft) return null;
    const draft = JSON.parse(rawDraft) as CheckoutDraft;
    if (!draft.updatedAt || Date.now() - draft.updatedAt > CHECKOUT_DRAFT_MAX_AGE_MS) {
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

function dateFromDraft(value: string | undefined) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? dateFromKey(value) : null;
}

export default function BookingCard({ compact = false }: { compact?: boolean }) {
  const draft = getCheckoutDraft();
  const [dates, setDates] = useState<DateRangeValue>({
    checkIn: dateFromDraft(draft?.stayInputs?.checkIn),
    checkOut: dateFromDraft(draft?.stayInputs?.checkOut),
  });
  const [guests, setGuests] = useState(() =>
    Math.min(14, Math.max(1, draft?.stayInputs?.adults ?? 6)),
  );
  const [children, setChildren] = useState(() =>
    Math.min(8, Math.max(0, draft?.stayInputs?.children ?? 0)),
  );
  const [promoCode, setPromoCode] = useState(draft?.stayInputs?.promoCode ?? "");

  const nights = daysBetween(dates.checkIn, dates.checkOut) || 4;
  const hasValidDates = Boolean(dates.checkIn && dates.checkOut && daysBetween(dates.checkIn, dates.checkOut) > 0);
  const subtotal = nights * NIGHTLY_RATE;
  const promoDiscount = promoCode.trim() ? 150 : 0;
  const taxes = Math.round((subtotal + SERVICE_FEE - promoDiscount) * TAX_RATE);
  const total = subtotal + SERVICE_FEE + taxes - promoDiscount;

  const checkInValue = useMemo(
    () => (dates.checkIn ? toDateKey(dates.checkIn) : ""),
    [dates.checkIn],
  );
  const checkOutValue = useMemo(
    () => (dates.checkOut ? toDateKey(dates.checkOut) : ""),
    [dates.checkOut],
  );

  return (
    <aside
      className={`bg-white p-4 shadow-[0_18px_54px_rgba(6,30,31,0.12)] ring-1 ring-black/5 ${
        compact ? "" : "lg:sticky lg:top-28"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0c7772]">
            Direct Villa Booking
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Reserve your stay</h2>
        </div>
        <span className="flex h-12 w-12 items-center justify-center bg-[#fff0ef] text-[#ea7e82]">
          <CalendarDays className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-4 bg-[#f7f5f2] p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              From
            </p>
            <p className="mt-1 text-3xl font-semibold text-slate-950">
              ${NIGHTLY_RATE.toLocaleString()}
            </p>
          </div>
          <p className="pb-1 text-sm text-slate-500">per night</p>
        </div>
      </div>

      <form action="/checkout" method="get" className="mt-4 space-y-3">
        <input type="hidden" name="checkIn" value={checkInValue} />
        <input type="hidden" name="checkOut" value={checkOutValue} />
        <input type="hidden" name="adults" value={guests} />
        <input type="hidden" name="children" value={children} />

        <DateRangePicker
          value={dates}
          onChange={setDates}
          initialBaseMonth={dates.checkIn ?? new Date()}
        />

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <GuestStepper label="Guests" value={guests} min={1} max={14} onChange={setGuests} />
          <GuestStepper
            label="Children"
            value={children}
            min={0}
            max={8}
            onChange={setChildren}
          />
        </div>

        <label className="relative block">
          <span className="sr-only">Promo code</span>
          <Tag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0c7772]" />
          <input
            name="promoCode"
            value={promoCode}
            onChange={(event) => setPromoCode(event.target.value)}
            placeholder="Promo code"
            className="h-12 w-full border-0 bg-[#f7f5f2] pl-11 pr-4 text-sm outline-none ring-1 ring-transparent transition placeholder:text-slate-400 focus:ring-2 focus:ring-[#0c7772]/20"
          />
        </label>

        <div className="bg-[#fbfaf8] p-4 ring-1 ring-slate-200">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              ${NIGHTLY_RATE.toLocaleString()} x {nights} nights
            </span>
            <span className="font-medium text-slate-950">${subtotal.toLocaleString()}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
            <span>Guest care fee</span>
            <span className="font-medium text-slate-950">${SERVICE_FEE.toLocaleString()}</span>
          </div>
          {promoDiscount > 0 ? (
            <div className="mt-2 flex items-center justify-between text-sm text-[#0c7772]">
              <span>Promo applied</span>
              <span>-${promoDiscount.toLocaleString()}</span>
            </div>
          ) : null}
          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0c7772]">
              Total estimate
            </span>
            <span className="text-2xl font-semibold text-slate-950">${total.toLocaleString()}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!hasValidDates}
          className="h-14 w-full bg-[#ea7e82] px-6 text-base font-semibold text-white shadow-[0_18px_34px_rgba(234,126,130,0.30)] transition hover:-translate-y-0.5 hover:bg-[#d86f73] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          Reserve Now
        </button>
      </form>

      <div className="mt-4 space-y-3 text-sm">
        <p className="flex items-center justify-center gap-2 font-semibold text-slate-700">
          <LockKeyhole className="h-4 w-4 text-[#0c7772]" />
          No payment charged yet
        </p>
        <div className="grid gap-2 text-xs text-slate-600">
          <span className="flex items-center gap-2 bg-[#f7f5f2] px-3 py-2">
            <MailCheck className="h-4 w-4 text-[#ea7e82]" />
            Instant confirmation via email
          </span>
          <span className="flex items-center gap-2 bg-[#f7f5f2] px-3 py-2">
            <ShieldCheck className="h-4 w-4 text-[#0c7772]" />
            Secure booking protected
          </span>
        </div>
      </div>

      <p className="mt-4 text-center text-xs leading-5 text-slate-500">
        Prefer help first?{" "}
        <Link href={`mailto:${BRAND.email}`} className="font-semibold text-[#0c7772]">
          Email Sandy Toes
        </Link>
      </p>
    </aside>
  );
}
