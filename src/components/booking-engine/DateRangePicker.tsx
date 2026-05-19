"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";
import { formatISTDateShort, formatISTMonthYear } from "@/lib/formatters";

const DESKTOP_CALENDAR_WIDTH = 760;
const DESKTOP_CALENDAR_HEIGHT = 570;
const MS_PER_DAY = 86_400_000;

export type DateRangeValue = {
  checkIn: Date | null;
  checkOut: Date | null;
};

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dateFromKey(value: string) {
  return new Date(`${value}T00:00:00`);
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysBetween(start: Date | null, end: Date | null) {
  if (!start || !end) return 0;
  const diff = startOfDay(end).getTime() - startOfDay(start).getTime();
  return Math.max(0, Math.ceil(diff / MS_PER_DAY));
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

function isBeforeDay(date: Date, compareDate: Date) {
  return startOfDay(date).getTime() < startOfDay(compareDate).getTime();
}

function isAfterDay(date: Date, compareDate: Date) {
  return startOfDay(date).getTime() > startOfDay(compareDate).getTime();
}

function getUnavailableNightInRange(
  checkIn: Date,
  checkOut: Date,
  unavailableDates: Set<string>,
) {
  let cursor = startOfDay(checkIn);
  const endTime = startOfDay(checkOut).getTime();

  while (cursor.getTime() < endTime) {
    const dateKey = toDateKey(cursor);
    if (unavailableDates.has(dateKey)) return dateKey;
    cursor = addDays(cursor, 1);
  }

  return null;
}

function isValidCheckoutDate(
  checkIn: Date | null,
  checkOut: Date,
  unavailableDates: Set<string>,
) {
  if (!checkIn) return false;
  if (!isAfterDay(checkOut, checkIn)) return false;
  return !getUnavailableNightInRange(checkIn, checkOut, unavailableDates);
}

type CalendarPanelProps = {
  baseMonth: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  hoverDate: Date | null;
  unavailableDates: Set<string>;
  today: Date;
  errorMessage?: string;
  monthCount?: 1 | 2;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (date: Date) => void;
  onInvalidSelect: (message: string) => void;
  onClear: () => void;
  onHover: (date: Date | null) => void;
  allowClear: boolean;
};

function CalendarPanel({
  baseMonth,
  checkIn,
  checkOut,
  hoverDate,
  unavailableDates,
  today,
  errorMessage,
  monthCount = 1,
  onPrev,
  onNext,
  onSelect,
  onInvalidSelect,
  onClear,
  onHover,
  allowClear,
}: CalendarPanelProps) {
  const previewEnd =
    checkIn &&
    !checkOut &&
    hoverDate &&
    isValidCheckoutDate(checkIn, hoverDate, unavailableDates)
      ? hoverDate
      : null;
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
      {checkIn && checkOut ? (
        <div className="mb-4 bg-[#eef8f6] px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-[#0c7772]">
          {daysBetween(checkIn, checkOut)} night{daysBetween(checkIn, checkOut) === 1 ? "" : "s"} selected
        </div>
      ) : checkIn ? (
        <div className="mb-4 bg-[#fbfaf8] px-3 py-2 text-center text-xs font-medium text-slate-600">
          Now choose your check-out date.
        </div>
      ) : null}

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
                const past = isBeforeDay(date, today);
                const unavailable = unavailableDates.has(dateKey);
                const selectingCheckout = Boolean(checkIn && !checkOut);
                const selectedStart = isSameDay(date, checkIn);
                const selectedEnd = isSameDay(date, checkOut);
                const unavailableNightInRange =
                  selectingCheckout && checkIn && !selectedStart
                    ? getUnavailableNightInRange(checkIn, date, unavailableDates)
                    : null;
                const invalidCheckout =
                  selectingCheckout &&
                  checkIn &&
                  !selectedStart &&
                  (!isAfterDay(date, checkIn) || Boolean(unavailableNightInRange));
                const blockedForSelection =
                  outsideMonth || past || (!selectingCheckout && unavailable);
                const selectedRange = isBetween(date, checkIn, checkOut);
                const previewRange = isBetween(date, checkIn, previewEnd);
                const invalidCheckoutMessage = unavailableNightInRange
                  ? `This stay crosses an unavailable night (${formatISTDateShort(new Date(`${unavailableNightInRange}T00:00:00`))}). Please choose dates before that night or start after it.`
                  : "Check-out must be after check-in.";

                return (
                  <button
                    key={dateKey}
                    type="button"
                    disabled={blockedForSelection}
                    aria-disabled={invalidCheckout ? true : undefined}
                    title={invalidCheckout ? invalidCheckoutMessage : undefined}
                    onClick={() => {
                      if (invalidCheckout) {
                        onInvalidSelect(invalidCheckoutMessage);
                        return;
                      }
                      onSelect(date);
                    }}
                    onMouseEnter={() => {
                      if (!blockedForSelection && !invalidCheckout) onHover(date);
                    }}
                    onMouseLeave={() => onHover(null)}
                    className={`relative flex h-10 items-center justify-center text-sm transition md:h-11 ${
                      outsideMonth
                        ? "text-transparent"
                        : selectedStart || selectedEnd
                          ? "bg-[#0c7772] font-semibold text-white shadow-[0_10px_24px_rgba(12,119,114,0.22)]"
                          : past
                            ? "cursor-not-allowed bg-slate-50 text-slate-300"
                            : unavailable && !selectingCheckout
                              ? "cursor-not-allowed bg-[#fff0ef] text-[#c35b62] ring-1 ring-[#efc0c2]"
                              : invalidCheckout
                                ? "cursor-not-allowed bg-[#f7f5f2] text-slate-300"
                                : selectedRange || previewRange
                                  ? "bg-[#e7f4f2] font-semibold text-[#0c7772]"
                                  : "text-slate-700 hover:bg-[#0c7772] hover:font-semibold hover:text-white"
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

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 bg-[#0c7772]" />
            Selected
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 bg-[#e7f4f2]" />
            Range preview
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 bg-[#fff0ef] ring-1 ring-[#efc0c2]" />
            Booked
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 bg-[#f7f5f2]" />
            Not selectable
          </span>
        </div>
        {allowClear && (checkIn || checkOut) ? (
          <button
            type="button"
            onClick={onClear}
            className="ml-auto text-xs font-semibold uppercase tracking-[0.12em] text-[#0c7772] transition hover:text-[#ea7e82]"
          >
            Clear
          </button>
        ) : null}
      </div>
      {errorMessage ? (
        <p className="mt-3 bg-[#fff0ef] px-3 py-2 text-xs font-medium leading-5 text-[#b94f56]">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

export function GuestStepper({
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
    <div className="flex min-h-11 items-center justify-between gap-1.5 bg-[#f7f5f2] px-2.5 py-2.5">
      <div className="min-w-[68px]">
        <p className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
          {label}
        </p>
      </div>
      <div className="grid shrink-0 grid-cols-[22px_20px_22px] items-center">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-[22px] w-[22px] items-center justify-center bg-white text-slate-700 shadow-sm transition hover:text-[#0c7772]"
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
          className="flex h-[22px] w-[22px] items-center justify-center bg-white text-slate-700 shadow-sm transition hover:text-[#0c7772]"
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export default function DateRangePicker({
  value,
  onChange,
  initialBaseMonth,
  showStatus = true,
  allowClear = true,
  className = "",
}: {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  initialBaseMonth?: Date;
  showStatus?: boolean;
  allowClear?: boolean;
  className?: string;
}) {
  const calendarAreaRef = useRef<HTMLDivElement>(null);
  const dateTriggerRef = useRef<HTMLDivElement>(null);
  const [baseMonth, setBaseMonth] = useState(
    () => initialBaseMonth ?? value.checkIn ?? new Date(),
  );
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [dateError, setDateError] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(() => new Set());
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({
    left: 16,
    top: 96,
    width: DESKTOP_CALENDAR_WIDTH,
  });

  const today = useMemo(() => startOfDay(new Date()), []);

  useEffect(() => {
    const controller = new AbortController();
    const rangeStart = new Date(baseMonth.getFullYear(), baseMonth.getMonth(), 1);
    const rangeEnd = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 2, 1);

    async function loadAvailability() {
      setAvailabilityLoading(true);
      try {
        const params = new URLSearchParams({
          checkIn: toDateKey(rangeStart),
          checkOut: toDateKey(rangeEnd),
        });
        const response = await fetch(`/api/villa-bookings/availability?${params.toString()}`, {
          signal: controller.signal,
        });
        const payload = (await response.json()) as {
          success: boolean;
          data?: { unavailableDates?: string[] };
        };
        if (response.ok && payload.success) {
          setUnavailableDates(new Set(payload.data?.unavailableDates ?? []));
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      } finally {
        if (!controller.signal.aborted) setAvailabilityLoading(false);
      }
    }

    loadAvailability();
    return () => controller.abort();
  }, [baseMonth]);

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
    setDateError("");
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
    const checkIn = value.checkIn;
    const checkOut = value.checkOut;

    if (!checkIn || checkOut || startOfDay(date).getTime() <= startOfDay(checkIn).getTime()) {
      onChange({ checkIn: date, checkOut: null });
      setDateError("");
      return;
    }

    const unavailableNight = getUnavailableNightInRange(checkIn, date, unavailableDates);
    if (unavailableNight) {
      setDateError(
        `Selected dates include an unavailable night (${formatISTDateShort(new Date(`${unavailableNight}T00:00:00`))}). Please choose another range.`,
      );
      return;
    }

    onChange({ checkIn, checkOut: date });
    setDateError("");
    setCalendarOpen(false);
  }

  function clearDates() {
    onChange({ checkIn: null, checkOut: null });
    setHoverDate(null);
    setDateError("");
  }

  const mobileCalendar = (
    <CalendarPanel
      baseMonth={baseMonth}
      checkIn={value.checkIn}
      checkOut={value.checkOut}
      hoverDate={hoverDate}
      unavailableDates={unavailableDates}
      onPrev={() => setBaseMonth(new Date(baseMonth.getFullYear(), baseMonth.getMonth() - 1, 1))}
      onNext={() => setBaseMonth(new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1))}
      onSelect={selectDate}
      onInvalidSelect={setDateError}
      onClear={clearDates}
      onHover={setHoverDate}
      allowClear={allowClear}
      today={today}
      errorMessage={dateError}
    />
  );

  const desktopCalendar = (
    <CalendarPanel
      baseMonth={baseMonth}
      checkIn={value.checkIn}
      checkOut={value.checkOut}
      hoverDate={hoverDate}
      unavailableDates={unavailableDates}
      onPrev={() => setBaseMonth(new Date(baseMonth.getFullYear(), baseMonth.getMonth() - 1, 1))}
      onNext={() => setBaseMonth(new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1))}
      onSelect={selectDate}
      onInvalidSelect={setDateError}
      onClear={clearDates}
      onHover={setHoverDate}
      allowClear={allowClear}
      today={today}
      errorMessage={dateError}
      monthCount={2}
    />
  );

  return (
    <div ref={calendarAreaRef} className={`relative ${className}`}>
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
            {displayDate(value.checkIn)}
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
            {displayDate(value.checkOut)}
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
      {showStatus && dateError && !calendarOpen ? (
        <p className="mt-2 bg-[#fff0ef] px-3 py-2 text-xs font-medium leading-5 text-[#b94f56]">
          {dateError}
        </p>
      ) : null}
      {showStatus && availabilityLoading ? (
        <p className="mt-2 bg-[#fbfaf8] px-3 py-2 text-xs font-medium text-slate-500">
          Checking latest availability...
        </p>
      ) : null}

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
                  {displayDate(value.checkIn)} - {displayDate(value.checkOut)}
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
    </div>
  );
}
