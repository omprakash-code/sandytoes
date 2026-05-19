import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatCents } from "@/lib/villa-booking";

export default async function AdminDashboardPage() {
  const [totalBookings, pendingBookings, confirmedBookings, blockedDates, recentBookings] =
    await Promise.all([
      prisma.villaBooking.count(),
      prisma.villaBooking.count({ where: { status: "READY_FOR_PAYMENT" } }),
      prisma.villaBooking.count({ where: { status: "CONFIRMED" } }),
      prisma.villaBlock.count(),
      prisma.villaBooking.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

  const confirmedRevenue = await prisma.villaBooking.aggregate({
    where: { status: "CONFIRMED" },
    _sum: { totalCents: true },
  });

  const cards = [
    { label: "Total bookings", value: totalBookings },
    { label: "Pending requests", value: pendingBookings },
    { label: "Confirmed stays", value: confirmedBookings },
    { label: "Blocked ranges", value: blockedDates },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0c7772]">
            Sandy Toes Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Villa booking dashboard</h1>
        </div>
        <Link
          href="/admin/bookings"
          className="inline-flex h-11 items-center justify-center bg-[#ea7e82] px-5 text-sm font-semibold text-white"
        >
          View bookings
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white p-5 ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-5 ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">Confirmed revenue</p>
        <p className="mt-3 text-3xl font-semibold text-slate-950">
          {formatCents(confirmedRevenue._sum.totalCents ?? 0)}
        </p>
      </div>

      <section className="bg-white ring-1 ring-slate-200">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-semibold text-slate-950">Recent bookings</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {recentBookings.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">No villa bookings yet.</p>
          ) : (
            recentBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/admin/bookings?booking=${booking.id}`}
                className="grid gap-2 p-5 transition hover:bg-[#f7f5f2] md:grid-cols-[1fr_180px_130px]"
              >
                <div>
                  <p className="font-semibold text-slate-950">{booking.bookingRef}</p>
                  <p className="text-sm text-slate-600">
                    {booking.guestFirstName} {booking.guestLastName} · {booking.guestEmail}
                  </p>
                </div>
                <p className="text-sm text-slate-600">
                  {booking.checkIn.toISOString().slice(0, 10)} to{" "}
                  {booking.checkOut.toISOString().slice(0, 10)}
                </p>
                <p className="text-sm font-semibold text-slate-950">
                  {formatCents(booking.totalCents)}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
