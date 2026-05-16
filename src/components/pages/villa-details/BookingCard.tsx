"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LockKeyhole,
  MailCheck,
  Minus,
  Plus,
  ShieldCheck,
  Tag,
  X,
} from "lucide-react";
import { BRAND } from "@/constants/brand";
import { formatISTDateShort, formatISTMonthYear } from "@/lib/formatters";

const NIGHTLY_RATE = 874;
const SERVICE_FEE = 225;
const TAX_RATE = 0.12;
const DESKTOP_CALENDAR_WIDTH = 760;
const DESKTOP_CALENDAR_HEIGHT = 570;

const unavailableDates = new Set(["2026-05-20", "2026-05-21", "2026-05-29"]);

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(start: Date | null, end: Date | null) {
  if (!start || !end) return 0;
  const diff = startOfDay(end).getTime() - startOfDay(start).getTime();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function buildMonth(anchor: Date) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const gridStart = addDays(first, -first.getDay());
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

function displayDate(date: Date | null) {
  return date ? formatISTDateShort(date) : "Select date";
}

function isSameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  return toDateKey(a) === toDateKey(b);
}

function isBetween(date: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false;
  const time = startOfDay(date).getTime();
  return time > startOfDay(start).getTime() && time < startOfDay(end).getTime();
}

type CalendarPanelProps = {
  baseMonth: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  hoverDate: Date | null;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (date: Date) => void;
  onHover: (date: Date | null) => void;
  monthCount?: 1 | 2;
};

function CalendarPanel({
  baseMonth,
  checkIn,
  checkOut,
  hoverDate,
  onPrev,
  onNext,
  onSelect,
  onHover,
  monthCount = 1,
}: CalendarPanelProps) {
  const previewEnd = checkIn && !checkOut ? hoverDate : null;
  const months = Array.from(
    { length: monthCount },
    (_, index) => new Date(baseMonth.getFullYear(), baseMonth.getMonth() + index, 1),
  );

  return (
    <div className="bg-white p-4 shadow-[0_28px_80px_rgba(6,30,31,0.18)] ring-1 ring-black/5 md:p-5">
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="flex h-9 w-9 items-center justify-center bg-[#f7f5f2] text-slate-800 transition hover:bg-[#ece7df]"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0c7772] md:text-base">
          Select your stay
        </p>
        <button
          type="button"
          onClick={onNext}
          className="flex h-9 w-9 items-center justify-center bg-[#f7f5f2] text-slate-800 transition hover:bg-[#ece7df]"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className={`grid gap-5 ${monthCount === 2 ? "lg:grid-cols-2" : ""}`}>
        {months.map((month) => (
          <div key={month.toISOString()}>
            <p className="mb-3 text-center text-base font-semibold text-slate-950">
              {formatISTMonthYear(month)}
            </p>
            <div className="grid grid-cols-7 border border-slate-100 bg-[#fbfaf8] text-center text-[11px] font-semibold uppercase text-slate-400">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <span
                  key={`${day}-${index}`}
                  className={`py-2 ${index === 0 || index === 6 ? "text-[#ea7e82]" : ""}`}
                >
                  {day}
                </span>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1">
              {buildMonth(month).map((date) => {
                const dateKey = toDateKey(date);
                const outsideMonth = date.getMonth() !== month.getMonth();
                const unavailable = unavailableDates.has(dateKey);
                const selectedStart = isSameDay(date, checkIn);
                const selectedEnd = isSameDay(date, checkOut);
                const selectedRange = isBetween(date, checkIn, checkOut);
                const previewRange = isBetween(date, checkIn, previewEnd);

                return (
                  <button
                    key={dateKey}
                    type="button"
                    disabled={outsideMonth || unavailable}
                    onClick={() => onSelect(date)}
                    onMouseEnter={() => onHover(date)}
                    onMouseLeave={() => onHover(null)}
                    className={`relative flex h-10 items-center justify-center text-sm transition md:h-11 ${
                      outsideMonth
                        ? "text-transparent"
                        : unavailable
                          ? "cursor-not-allowed bg-slate-100 text-slate-300 line-through"
                          : selectedStart || selectedEnd
                            ? "bg-[#0c7772] font-semibold text-white shadow-[0_10px_24px_rgba(12,119,114,0.22)]"
                            : selectedRange || previewRange
                              ? "bg-[#e7f4f2] font-semibold text-[#0c7772]"
                              : "text-slate-700 hover:bg-[#f7f5f2]"
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 bg-[#0c7772]" />
          Selected
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 bg-[#e7f4f2]" />
          Range preview
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 bg-slate-100" />
          Unavailable
        </span>
      </div>
    </div>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 bg-[#f7f5f2] px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          {label}
        </p>
      </div>
      <div className="grid shrink-0 grid-cols-[24px_26px_24px] items-center">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-6 w-6 items-center justify-center bg-white text-slate-700 shadow-sm transition hover:text-[#0c7772]"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="text-center text-sm font-semibold leading-none text-slate-950 tabular-nums">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="flex h-6 w-6 items-center justify-center bg-white text-slate-700 shadow-sm transition hover:text-[#0c7772]"
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export default function BookingCard({ compact = false }: { compact?: boolean }) {
  const calendarAreaRef = useRef<HTMLDivElement>(null);
  const dateTriggerRef = useRef<HTMLDivElement>(null);
  const [baseMonth, setBaseMonth] = useState(() => new Date(2026, 4, 1));
  const [checkIn, setCheckIn] = useState<Date | null>(new Date(2026, 4, 15));
  const [checkOut, setCheckOut] = useState<Date | null>(new Date(2026, 4, 19));
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState(6);
  const [children, setChildren] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({
    left: 16,
    top: 96,
    width: DESKTOP_CALENDAR_WIDTH,
  });

  const nights = daysBetween(checkIn, checkOut) || 4;
  const subtotal = nights * NIGHTLY_RATE;
  const promoDiscount = promoCode.trim() ? 150 : 0;
  const taxes = Math.round((subtotal + SERVICE_FEE - promoDiscount) * TAX_RATE);
  const total = subtotal + SERVICE_FEE + taxes - promoDiscount;

  const checkInValue = useMemo(() => (checkIn ? toDateKey(checkIn) : ""), [checkIn]);
  const checkOutValue = useMemo(() => (checkOut ? toDateKey(checkOut) : ""), [checkOut]);

  function positionDesktopCalendar() {
    if (typeof window === "undefined" || window.innerWidth < 1024) return;

    const triggerRect = dateTriggerRef.current?.getBoundingClientRect();
    if (!triggerRect) return;

    const width = Math.min(DESKTOP_CALENDAR_WIDTH, window.innerWidth - 32);
    const preferredTop = triggerRect.bottom + 12;
    const maxTop = window.innerHeight - DESKTOP_CALENDAR_HEIGHT - 16;
    const top = Math.max(16, Math.min(preferredTop, maxTop));
    const left = Math.max(16, Math.min(triggerRect.right - width, window.innerWidth - width - 16));

    setCalendarPosition({ left, top, width });
  }

  function openCalendar() {
    positionDesktopCalendar();
    setCalendarOpen(true);
  }

  useEffect(() => {
    if (!calendarOpen) return;

    function handleOutsideClick(event: MouseEvent | TouchEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (calendarAreaRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest("[data-calendar-panel='true']")) return;
      setCalendarOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    window.addEventListener("resize", positionDesktopCalendar);
    window.addEventListener("scroll", positionDesktopCalendar, true);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      window.removeEventListener("resize", positionDesktopCalendar);
      window.removeEventListener("scroll", positionDesktopCalendar, true);
    };
  }, [calendarOpen]);

  function selectDate(date: Date) {
    if (!checkIn || checkOut || startOfDay(date).getTime() <= startOfDay(checkIn).getTime()) {
      setCheckIn(date);
      setCheckOut(null);
      return;
    }

    setCheckOut(date);
    setCalendarOpen(false);
  }

  const mobileCalendar = (
    <CalendarPanel
      baseMonth={baseMonth}
      checkIn={checkIn}
      checkOut={checkOut}
      hoverDate={hoverDate}
      onPrev={() => setBaseMonth(new Date(baseMonth.getFullYear(), baseMonth.getMonth() - 1, 1))}
      onNext={() => setBaseMonth(new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1))}
      onSelect={selectDate}
      onHover={setHoverDate}
    />
  );

  const desktopCalendar = (
    <CalendarPanel
      baseMonth={baseMonth}
      checkIn={checkIn}
      checkOut={checkOut}
      hoverDate={hoverDate}
      onPrev={() => setBaseMonth(new Date(baseMonth.getFullYear(), baseMonth.getMonth() - 1, 1))}
      onNext={() => setBaseMonth(new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1))}
      onSelect={selectDate}
      onHover={setHoverDate}
      monthCount={2}
    />
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
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            Reserve your stay
          </h2>
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

      <form action="/booking" method="get" className="mt-4 space-y-3">
        <input type="hidden" name="checkIn" value={checkInValue} />
        <input type="hidden" name="checkOut" value={checkOutValue} />
        <input type="hidden" name="adults" value={guests} />
        <input type="hidden" name="children" value={children} />

        <div ref={calendarAreaRef} className="relative">
          <div ref={dateTriggerRef} className="grid grid-cols-2 overflow-hidden bg-[#f7f5f2]">
            <button
              type="button"
              onClick={openCalendar}
              aria-expanded={calendarOpen}
              className="px-4 py-3 text-left transition hover:bg-[#f0ebe4]"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Check-in
              </span>
              <span className="mt-1 block text-sm font-semibold text-slate-950">
                {displayDate(checkIn)}
              </span>
            </button>
            <button
              type="button"
              onClick={openCalendar}
              aria-expanded={calendarOpen}
              className="border-l border-slate-300/70 px-4 py-3 text-left transition hover:bg-[#f0ebe4]"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Check-out
              </span>
              <span className="mt-1 block text-sm font-semibold text-slate-950">
                {displayDate(checkOut)}
              </span>
            </button>
          </div>

          {calendarOpen ? (
            <div
              className="fixed z-50 hidden lg:block"
              data-calendar-panel="true"
              style={{
                left: calendarPosition.left,
                top: calendarPosition.top,
                width: calendarPosition.width,
              }}
            >
              {desktopCalendar}
            </div>
          ) : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Stepper label="Guests" value={guests} min={1} max={14} onChange={setGuests} />
          <Stepper label="Children" value={children} min={0} max={8} onChange={setChildren} />
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

        <div className="bg-[#04283c] p-4 text-white">
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>
              ${NIGHTLY_RATE.toLocaleString()} x {nights} nights
            </span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-white/70">
            <span>Service & care fee</span>
            <span>${SERVICE_FEE.toLocaleString()}</span>
          </div>
          {promoDiscount > 0 ? (
            <div className="mt-2 flex items-center justify-between text-sm text-[#89d6d0]">
              <span>Promo applied</span>
              <span>-${promoDiscount.toLocaleString()}</span>
            </div>
          ) : null}
          <div className="mt-3 flex items-center justify-between border-t border-white/12 pt-3">
            <span className="font-semibold">Total estimate</span>
            <span className="text-2xl font-semibold">${total.toLocaleString()}</span>
          </div>
        </div>

        <button
          type="submit"
          className="h-14 w-full bg-[#ea7e82] px-6 text-base font-semibold text-white shadow-[0_18px_34px_rgba(234,126,130,0.30)] transition hover:-translate-y-0.5 hover:bg-[#d86f73]"
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

      {calendarOpen ? (
        <div
          className="fixed inset-0 z-[80] bg-slate-950/45 p-3 backdrop-blur-sm lg:hidden"
          onClick={() => setCalendarOpen(false)}
        >
          <div
            className="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto bg-[#f7f5f2] p-4 shadow-2xl"
            data-calendar-panel="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0c7772]">
                  Dates
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {displayDate(checkIn)} - {displayDate(checkOut)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCalendarOpen(false)}
                className="flex h-10 w-10 items-center justify-center bg-white text-slate-800 shadow-sm"
                aria-label="Close calendar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {mobileCalendar}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
