"use client";

import { useEffect, useMemo, useState } from "react";

type BookingRow = {
  id: string;
  bookingRef: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  totalCents: number;
  currency: string;
  status: "READY_FOR_PAYMENT" | "CONFIRMED" | "CANCELLED" | "EXPIRED" | "NO_SHOW";
  paymentStatus: string;
  createdAt: string;
  notes: Array<{ id: string; note: string; adminName: string; createdAt: string }>;
};

type BookingsResponse = {
  success: boolean;
  message?: string;
  data?: BookingRow[];
};

function money(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export default function AdminVillaBookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [reschedule, setReschedule] = useState({ checkIn: "", checkOut: "" });

  const selected = useMemo(
    () => bookings.find((booking) => booking.id === selectedId) ?? bookings[0] ?? null,
    [bookings, selectedId]
  );

  async function loadBookings() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/villa-bookings", { cache: "no-store" });
      const json = (await response.json()) as BookingsResponse;
      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.message ?? "Failed to load bookings.");
      }
      setBookings(json.data);
      setSelectedId((current) => current ?? json.data?.[0]?.id ?? null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBookings();
  }, []);

  async function runAction(data:
    | { action: "CONFIRM_BOOKING" | "CANCEL_BOOKING" | "MARK_NO_SHOW" | "MARK_REFUNDED"; reason?: string }
    | { action: "RESCHEDULE_BOOKING"; checkIn: string; checkOut: string; reason?: string }
  ) {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/villa-bookings/${selected.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await response.json()) as { success: boolean; message?: string };
      if (!response.ok || !json.success) {
        throw new Error(json.message ?? "Failed to update booking.");
      }
      setReschedule({ checkIn: "", checkOut: "" });
      await loadBookings();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to update booking.");
    } finally {
      setSaving(false);
    }
  }

  async function addNote() {
    if (!selected || !note.trim()) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/villa-bookings/${selected.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (!response.ok) throw new Error("Failed to save note.");
      setNote("");
      await loadBookings();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to save note.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0c7772]">
          Villa bookings
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Reservations</h1>
      </div>

      {error ? <p className="bg-[#fff0ef] p-3 text-sm font-semibold text-[#b94f56]">{error}</p> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="bg-white ring-1 ring-slate-200">
          <div className="border-b border-slate-200 p-4">
            <p className="text-sm text-slate-500">
              {loading ? "Loading bookings..." : `${bookings.length} booking${bookings.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#f7f5f2] text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Booking</th>
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Stay</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    onClick={() => setSelectedId(booking.id)}
                    className={`cursor-pointer transition hover:bg-[#f7f5f2] ${
                      selected?.id === booking.id ? "bg-[#eef8f6]" : ""
                    }`}
                  >
                    <td className="px-4 py-4 font-semibold text-slate-950">{booking.bookingRef}</td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-950">{booking.guestName}</p>
                      <p className="text-xs text-slate-500">{booking.guestEmail}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {booking.checkIn} to {booking.checkOut}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-950">
                      {money(booking.totalCents, booking.currency)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="bg-[#f7f5f2] px-2 py-1 text-xs font-semibold text-slate-700">
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="bg-white p-5 ring-1 ring-slate-200">
          {selected ? (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0c7772]">
                  {selected.bookingRef}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{selected.guestName}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {selected.guestEmail} · {selected.guestPhone}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-[#f7f5f2] p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Check-in</p>
                  <p className="mt-1 font-semibold">{selected.checkIn}</p>
                </div>
                <div className="bg-[#f7f5f2] p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Check-out</p>
                  <p className="mt-1 font-semibold">{selected.checkOut}</p>
                </div>
                <div className="bg-[#f7f5f2] p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Guests</p>
                  <p className="mt-1 font-semibold">
                    {selected.adults} adults, {selected.children} children
                  </p>
                </div>
                <div className="bg-[#f7f5f2] p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Total</p>
                  <p className="mt-1 font-semibold">{money(selected.totalCents, selected.currency)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-slate-950">Controlled actions</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void runAction({ action: "CONFIRM_BOOKING" })}
                    className="h-10 bg-[#0c7772] px-4 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void runAction({ action: "CANCEL_BOOKING", reason: "Cancelled by admin" })}
                    className="h-10 bg-[#fff0ef] px-4 text-sm font-semibold text-[#b94f56] ring-1 ring-[#ea7e82]/35 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void runAction({ action: "MARK_NO_SHOW" })}
                    className="h-10 bg-[#f7f5f2] px-4 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 disabled:opacity-50"
                  >
                    Mark no-show
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void runAction({ action: "MARK_REFUNDED" })}
                    className="h-10 bg-[#f7f5f2] px-4 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 disabled:opacity-50"
                  >
                    Mark refunded
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Status changes are validated server-side to avoid impossible booking/payment states.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-slate-950">Reschedule</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label>
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      New check-in
                    </span>
                    <input
                      type="date"
                      value={reschedule.checkIn}
                      onChange={(event) =>
                        setReschedule((current) => ({ ...current, checkIn: event.target.value }))
                      }
                      className="mt-2 h-11 w-full bg-[#f7f5f2] px-3 text-sm ring-1 ring-slate-200"
                    />
                  </label>
                  <label>
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      New check-out
                    </span>
                    <input
                      type="date"
                      value={reschedule.checkOut}
                      onChange={(event) =>
                        setReschedule((current) => ({ ...current, checkOut: event.target.value }))
                      }
                      className="mt-2 h-11 w-full bg-[#f7f5f2] px-3 text-sm ring-1 ring-slate-200"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  disabled={saving || !reschedule.checkIn || !reschedule.checkOut}
                  onClick={() =>
                    void runAction({
                      action: "RESCHEDULE_BOOKING",
                      checkIn: reschedule.checkIn,
                      checkOut: reschedule.checkOut,
                      reason: "Rescheduled by admin",
                    })
                  }
                  className="h-10 bg-[#ea7e82] px-4 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Save new dates
                </button>
              </div>

              <div>
                <h3 className="font-semibold text-slate-950">Admin notes</h3>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Add internal note"
                  className="mt-3 min-h-24 w-full bg-[#f7f5f2] p-3 text-sm outline-none ring-1 ring-slate-200 focus:ring-[#0c7772]"
                />
                <button
                  type="button"
                  disabled={saving || !note.trim()}
                  onClick={() => void addNote()}
                  className="mt-3 h-11 bg-[#0c7772] px-5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Add note
                </button>
                <div className="mt-4 space-y-3">
                  {selected.notes.map((item) => (
                    <div key={item.id} className="bg-[#f7f5f2] p-3 text-sm">
                      <p className="text-slate-700">{item.note}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        {item.adminName} · {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Select a booking to view details.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
