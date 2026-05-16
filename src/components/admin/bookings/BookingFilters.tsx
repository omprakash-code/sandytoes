"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronDown } from "@/components/icons";
import AdminCompactFilters from "@/components/admin/shared/AdminCompactFilters";
import { formatSlotTime } from "@/lib/formatters";
import type { DatePreset } from "@/types/admin/filters";

interface Props {
  search: string;
  setSearch: (v: string) => void;

  preset: DatePreset | null;
  setPreset: (p: DatePreset | null) => void;

  location?: string;
  setLocation?: (v: string) => void;

  theatre: string;
  setTheatre: (v: string) => void;

  slot: string;
  setSlot: (v: string) => void;

  status: string;
  setStatus: (v: string) => void;

  theatres: string[];
  locations?: string[];
  slots: string[];
  showPreset?: boolean;
  showStatus?: boolean;
  statusOptions?: Array<{
    value: string;
    label: string;
  }>;
  customDate?: string;
  setCustomDate?: (v: string) => void;
  showCustomDate?: boolean;
  onClearFilters?: () => void;
  dateLabel?: string;
  allDateLabel?: string;
}

const PRESET_LABEL: Record<string, string> = {
  ALL: "All dates",
  TODAY: "Today",
  YESTERDAY: "Yesterday",
  LAST_3: "Last 3 days",
  LAST_7: "Last 7 days",
  LAST_15: "Last 15 days",
  LAST_30: "Last 30 days",
};

const FILTER_ITEM_CLASS = "w-full";

function getPresetDisplayLabel(
  preset: DatePreset | null,
  allDateLabel: string
) {
  if (!preset) return allDateLabel;
  return PRESET_LABEL[preset] ?? allDateLabel;
}



export default function BookingsFilters({
  search,
  setSearch,
  preset,
  setPreset,
  location = "",
  setLocation = () => {},
  theatre,
  setTheatre,
  slot,
  setSlot,
  status,
  setStatus,
  theatres,
  locations = [],
  slots,
  showPreset = true,
  showStatus = true,
  statusOptions = [
    { value: "PAID", label: "Paid" },
    { value: "PENDING", label: "Pending" },
    { value: "FAILED", label: "Failed" },
  ],
  customDate = "",
  setCustomDate,
  showCustomDate = false,
  onClearFilters,
  dateLabel = "Date",
  allDateLabel = "All dates",
}: Props) {
  const filterGridClassName = showStatus
    ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
    : "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";
  const customDateInputRef = useRef<HTMLInputElement | null>(null);
  const presetSelectRef = useRef<HTMLSelectElement | null>(null);
  const [allSlotWindows, setAllSlotWindows] = useState<string[]>([]);
  const openCustomDatePicker = () => {
    const input = customDateInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
        return;
      } catch {
        // Fallback for browsers that block showPicker.
      }
    }
    input.focus();
  };
  const openPresetPicker = () => {
    const select = presetSelectRef.current;
    if (!select) return;
    select.focus();
    select.click();
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchAllSlotWindows() {
      try {
        const res = await fetch("/api/admin/slots");
        const json = (await res.json().catch(() => null)) as
          | {
              success?: boolean;
              data?: Array<{
                startTime?: string;
                endTime?: string;
              }>;
            }
          | null;

        if (!json?.success || !Array.isArray(json.data) || cancelled) return;

        const windows = json.data
          .map((entry) => {
            const start = String(entry.startTime ?? "").trim();
            const end = String(entry.endTime ?? "").trim();
            return start && end ? `${start} - ${end}` : "";
          })
          .filter((window): window is string => window.length > 0);

        setAllSlotWindows(Array.from(new Set(windows)));
      } catch {
        if (!cancelled) {
          setAllSlotWindows([]);
        }
      }
    }

    void fetchAllSlotWindows();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortSlotWindows = (input: string[]) => {
    const toMinutes = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      if (!Number.isFinite(h) || !Number.isFinite(m)) return Number.MAX_SAFE_INTEGER;
      return h * 60 + m;
    };

    const parseWindow = (window: string) => {
      const [start = "", end = ""] = window.split(" - ");
      return { start, end };
    };

    return [...new Set(input)].sort((a, b) => {
      const left = parseWindow(a);
      const right = parseWindow(b);
      const startDiff = toMinutes(left.start) - toMinutes(right.start);
      if (startDiff !== 0) return startDiff;
      return toMinutes(left.end) - toMinutes(right.end);
    });
  };

  const sortedAllSlotWindows = useMemo(
    () => sortSlotWindows(allSlotWindows),
    [allSlotWindows]
  );

  const sortedPageSlotWindows = useMemo(
    () => sortSlotWindows(slots),
    [slots]
  );

  // Prefer global slot windows fetched once from API to avoid re-sorting a large merged list
  // on every parent refresh (e.g. live bookings polling).
  const slotOptions =
    sortedAllSlotWindows.length > 0 ? sortedAllSlotWindows : sortedPageSlotWindows;

  const formatSlotLabel = (window: string) => {
    const [start = "", end = ""] = window.split(" - ");
    if (!start || !end) return window;
    return formatSlotTime(start, end);
  };

  const formattedCustomDate = useMemo(() => {
    if (!customDate) return dateLabel;
    const date = new Date(`${customDate}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "Custom date";
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }, [customDate, dateLabel]);

  const hasActiveFilters =
    search.trim().length > 0 ||
    location.length > 0 ||
    theatre.length > 0 ||
    slot.length > 0 ||
    status.length > 0 ||
    customDate.length > 0 ||
    preset !== null;
  const activeFilterCount = [
    theatre.length > 0,
    location.length > 0,
    slot.length > 0,
    status.length > 0,
    customDate.length > 0,
    preset !== null,
  ].filter(Boolean).length;

  return (
    <AdminCompactFilters
      hasActiveFilters={hasActiveFilters}
      activeFilterCount={activeFilterCount}
      onClearFilters={onClearFilters}
      filterGridClassName={filterGridClassName}
      searchSlot={
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ID, name, phone, villa..."
          className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm"
        />
      }
      filterSlot={
        <>
          {/* Date Preset */}
          {showPreset ? (
            <div className={FILTER_ITEM_CLASS}>
              <div
                className="relative"
                onClick={openPresetPicker}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openPresetPicker();
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <select
                  ref={presetSelectRef}
                  value={preset ?? "ALL"}
                  onChange={(e) =>
                    setPreset(
                      e.target.value === "ALL"
                        ? null
                        : (e.target.value as DatePreset)
                    )
                  }
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  aria-label="Select booking date range"
                >
                  {Object.entries(PRESET_LABEL).map(([key, label]) => (
                    <option key={key} value={key}>
                      {key === "ALL" ? allDateLabel : label}
                    </option>
                  ))}
                </select>

                <div className="inline-flex h-10 w-full items-center justify-between gap-2 rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-700">
                  <span className="inline-flex items-center gap-2 truncate">
                    <Calendar size={14} className="text-neutral-500" />
                    <span className="truncate">
                      {getPresetDisplayLabel(preset, allDateLabel)}
                    </span>
                  </span>
                  <ChevronDown size={14} className="text-neutral-500" />
                </div>
              </div>
            </div>
          ) : null}

          {showCustomDate && setCustomDate ? (
            <div className={FILTER_ITEM_CLASS}>
              <div
                className="relative"
                onClick={openCustomDatePicker}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openCustomDatePicker();
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <input
                  ref={customDateInputRef}
                  type="date"
                  value={customDate}
                  onChange={(event) => setCustomDate(event.target.value)}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  aria-label="Select custom date"
                />
                <div className="inline-flex h-10 w-full items-center justify-between gap-2 rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-700">
                  <span className="inline-flex items-center gap-2 truncate">
                    <Calendar size={14} className="text-neutral-500" />
                    <span className="truncate">{formattedCustomDate}</span>
                  </span>
                  <ChevronDown size={14} className="text-neutral-500" />
                </div>
              </div>
            </div>
          ) : null}

          <div className={FILTER_ITEM_CLASS}>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm"
            >
              <option value="">All locations</option>
              {locations.map((locationName) => (
                <option key={locationName} value={locationName}>
                  {locationName}
                </option>
              ))}
            </select>
          </div>

          {/* Villa */}
          <div className={FILTER_ITEM_CLASS}>
            <select
              value={theatre}
              onChange={(e) => setTheatre(e.target.value)}
              className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm"
            >
              <option value="">All Villas</option>
              {theatres.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Slot */}
          <div className="w-full">
            <select
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm"
            >
              <option value="">All Slots</option>
              {slotOptions.map((s) => (
                <option key={s} value={s}>
                  {formatSlotLabel(s)}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          {showStatus ? (
            <div className={FILTER_ITEM_CLASS}>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm"
              >
                <option value="">All Status</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </>
      }
    />
  );
}
