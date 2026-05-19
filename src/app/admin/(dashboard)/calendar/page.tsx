"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type CalendarDay = {
  date: string;
  state: "booked" | "blocked" | "pending" | "available";
  bookings: string[];
  locks: string[];
  blocks: string[];
};

type CalendarPayload = {
  villa: { name: string; timezone: string };
  month: { year: number; month: number; startDate: string; endDate: string };
  days: CalendarDay[];
  bookings: Array<{ id: string; bookingRef: string; startDate: string; endDate: string; label: string; status: string }>;
  locks: Array<{ id: string; startDate: string; endDate: string; label: string; expiresAt: string }>;
  blocks: Array<{ id: string; startDate: string; endDate: string; type: string; reason: string | null; source: string }>;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

const stateStyles = {
  booked: "bg-[#083344] text-white",
  blocked: "bg-[#fff0ef] text-[#b94f56] ring-[#ea7e82]/35",
  pending: "bg-[#fff7ed] text-[#9a5a16] ring-[#f4b76a]/45",
  available: "bg-white text-slate-700 ring-slate-200",
};

function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
}

function todayMonth() {
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}

function shiftMonth(year: number, month: number, delta: number) {
  const next = new Date(Date.UTC(year, month - 1 + delta, 1));
  return { year: next.getUTCFullYear(), month: next.getUTCMonth() + 1 };
}

export default function AdminVillaCalendarPage() {
  const initial = useMemo(() => todayMonth(), []);
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [calendar, setCalendar] = useState<CalendarPayload | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("MANUAL_BLOCK");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/villa-calendar?year=${year}&month=${month}`, {
        cache: "no-store",
      });
      const json = (await response.json()) as ApiResponse<CalendarPayload>;
      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.message ?? "Failed to load calendar.");
      }
      setCalendar(json.data);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load calendar.");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    void loadCalendar();
  }, [loadCalendar]);

  async function saveBlock() {
    if (!startDate || !endDate) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/villa-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate, type, reason }),
      });
      const json = (await response.json()) as ApiResponse<unknown>;
      if (!response.ok || !json.success) {
        throw new Error(json.message ?? "Failed to save blocked range.");
      }
      setStartDate("");
      setEndDate("");
      setReason("");
      await loadCalendar();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to save blocked range.");
    } finally {
      setSaving(false);
    }
  }

  async function removeBlock(id: string) {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/villa-blocks?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = (await response.json()) as ApiResponse<unknown>;
      if (!response.ok || !json.success) {
        throw new Error(json.message ?? "Failed to remove blocked range.");
      }
      await loadCalendar();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to remove blocked range.");
    } finally {
      setSaving(false);
    }
  }

  function moveMonth(delta: number) {
    const next = shiftMonth(year, month, delta);
    setYear(next.year);
    setMonth(next.month);
  }

  const leadingBlankDays = calendar
    ? new Date(`${calendar.month.startDate}T00:00:00.000Z`).getUTCDay()
    : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0c7772]">
            Operations calendar
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            {calendar?.villa.name ?? "Villa calendar"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            className="h-10 bg-white px-4 text-sm font-semibold ring-1 ring-slate-200"
          >
            Prev
          </button>
          <p className="min-w-40 text-center text-sm font-semibold text-slate-700">
            {monthLabel(year, month)}
          </p>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            className="h-10 bg-white px-4 text-sm font-semibold ring-1 ring-slate-200"
          >
            Next
          </button>
        </div>
      </div>

      {error ? <p className="bg-[#fff0ef] p-3 text-sm font-semibold text-[#b94f56]">{error}</p> : null}

      <section className="bg-white p-5 ring-1 ring-slate-200">
        <div className="grid gap-3 lg:grid-cols-[160px_160px_180px_minmax(0,1fr)_140px]">
          <label>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Start
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="mt-2 h-11 w-full bg-[#f7f5f2] px-3 text-sm ring-1 ring-slate-200"
            />
          </label>
          <label>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              End
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="mt-2 h-11 w-full bg-[#f7f5f2] px-3 text-sm ring-1 ring-slate-200"
            />
          </label>
          <label>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Type
            </span>
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="mt-2 h-11 w-full bg-[#f7f5f2] px-3 text-sm ring-1 ring-slate-200"
            >
              <option value="MANUAL_BLOCK">Manual block</option>
              <option value="OWNER_STAY">Owner stay</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="PRIVATE_HOLD">Private hold</option>
            </select>
          </label>
          <label>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Reason
            </span>
            <input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Optional internal note"
              className="mt-2 h-11 w-full bg-[#f7f5f2] px-3 text-sm ring-1 ring-slate-200"
            />
          </label>
          <button
            type="button"
            disabled={saving || !startDate || !endDate}
            onClick={() => void saveBlock()}
            className="mt-6 h-11 bg-[#ea7e82] px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Block range
          </button>
        </div>
      </section>

      <section className="bg-white p-5 ring-1 ring-slate-200">
        <div className="mb-4 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.12em]">
          <span className="text-[#083344]">Booked</span>
          <span className="text-[#b94f56]">Blocked</span>
          <span className="text-[#9a5a16]">Pending hold</span>
          <span className="text-slate-500">Available</span>
        </div>
        <div className="grid grid-cols-7 gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <p key={day}>{day}</p>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2">
          {loading
            ? Array.from({ length: 35 }, (_, index) => (
                <div key={index} className="h-24 bg-[#f7f5f2]" />
              ))
            : [
                ...Array.from({ length: leadingBlankDays }, (_, index) => (
                  <div key={`blank-${index}`} className="min-h-24 bg-[#f7f5f2]/50" />
                )),
                ...(calendar?.days.map((day) => (
                  <div
                    key={day.date}
                    className={`min-h-24 p-2 text-sm ring-1 ${stateStyles[day.state]}`}
                  >
                    <p className="font-semibold">{Number(day.date.slice(-2))}</p>
                    <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.08em]">
                      {day.state}
                    </p>
                  </div>
                )) ?? []),
              ]}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-3">
        <section className="bg-white ring-1 ring-slate-200 xl:col-span-2">
          <div className="border-b border-slate-200 p-4">
            <h2 className="font-semibold text-slate-950">Reservations & active holds</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {calendar?.bookings.map((booking) => (
              <div key={booking.id} className="grid gap-2 p-4 text-sm md:grid-cols-[1fr_220px_120px]">
                <p className="font-semibold text-slate-950">{booking.label}</p>
                <p className="text-slate-600">{booking.startDate} to {booking.endDate}</p>
                <p className="font-semibold text-[#0c7772]">{booking.status}</p>
              </div>
            ))}
            {calendar?.locks.map((lock) => (
              <div key={lock.id} className="grid gap-2 p-4 text-sm md:grid-cols-[1fr_220px_120px]">
                <p className="font-semibold text-slate-950">{lock.label}</p>
                <p className="text-slate-600">{lock.startDate} to {lock.endDate}</p>
                <p className="font-semibold text-[#9a5a16]">HOLD</p>
              </div>
            ))}
            {!loading && !calendar?.bookings.length && !calendar?.locks.length ? (
              <p className="p-4 text-sm text-slate-500">No bookings or active holds this month.</p>
            ) : null}
          </div>
        </section>

        <section className="bg-white ring-1 ring-slate-200">
          <div className="border-b border-slate-200 p-4">
            <h2 className="font-semibold text-slate-950">Blocked ranges</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {calendar?.blocks.map((block) => (
              <div key={block.id} className="space-y-2 p-4 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{block.type.replaceAll("_", " ")}</p>
                    <p className="text-slate-600">{block.startDate} to {block.endDate}</p>
                    <p className="text-xs text-slate-500">{block.reason || "No reason added"}</p>
                  </div>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void removeBlock(block.id)}
                    className="font-semibold text-[#b94f56] disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {!loading && !calendar?.blocks.length ? (
              <p className="p-4 text-sm text-slate-500">No blocked ranges this month.</p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
