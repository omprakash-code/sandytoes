import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, Mail, MapPin, Phone, ShieldCheck, Users } from "lucide-react";
import Footer from "@/components/layouts/Footer";
import VillaBookingHeader from "@/components/pages/villa-details/VillaBookingHeader";
import { BRAND } from "@/constants/brand";
import { prisma } from "@/lib/db";
import { formatISTDate } from "@/lib/formatters";
import { formatCents } from "@/lib/villa-booking";

type BookingSuccessSearchParams = Record<string, string | string[] | undefined>;

export const metadata: Metadata = {
  title: `Reservation Received | ${BRAND.name}`,
  description: "Your Sandy Toes villa reservation has been received.",
};

function firstParam(params: BookingSuccessSearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<BookingSuccessSearchParams>;
}) {
  const params = await searchParams;
  const bookingRef = firstParam(params, "ref")?.trim();
  const booking = bookingRef
    ? await prisma.villaBooking.findUnique({
        where: { bookingRef },
        select: {
          bookingRef: true,
          propertyName: true,
          checkIn: true,
          checkOut: true,
          nights: true,
          adults: true,
          children: true,
          guestFirstName: true,
          guestLastName: true,
          guestEmail: true,
          totalCents: true,
          currency: true,
          createdAt: true,
        },
      })
    : null;

  return (
    <main className="min-h-screen bg-[#f7f5f2] text-slate-950">
      <VillaBookingHeader active="checkout" ctaLabel="View Villa" ctaHref="/villa-details" />

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:py-12">
        <div className="bg-white p-6 ring-1 ring-slate-200 md:p-10">
          <div className="flex h-14 w-14 items-center justify-center bg-[#eef8f6] text-[#0c7772]">
            <CalendarCheck className="h-7 w-7" />
          </div>
          {booking ? (
            <>
              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-[#0c7772]">
                Reservation received
              </p>
              <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
                Your private escape in Treasure Cay is one step closer.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                Thank you for choosing Sandy Toes. We have received your reservation details and
                will follow up with the next arrival details at {booking.guestEmail}.
              </p>
            </>
          ) : (
            <>
              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-[#b94f56]">
                Reservation not found
              </p>
              <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
                Let&apos;s get you back to a fresh booking.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                We could not find an active reservation for this link. Please return to the villa
                page or contact Sandy Toes for help.
              </p>
            </>
          )}

          {booking ? (
            <div className="mt-8 grid gap-3 bg-[#fbfaf8] p-5 ring-1 ring-slate-200 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Guest
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  {booking.guestFirstName} {booking.guestLastName}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Stay
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  {booking.nights} night{booking.nights === 1 ? "" : "s"} ·{" "}
                  {booking.adults + booking.children} guest
                  {booking.adults + booking.children === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              href={booking ? "/villa-details" : "/checkout"}
              className="inline-flex h-13 items-center justify-center rounded-full bg-[#ea7e82] px-6 text-sm font-semibold text-white transition hover:bg-[#d86f73]"
            >
              {booking ? "View villa details" : "Start again"}
            </Link>
            <Link
              href={`mailto:${BRAND.email}`}
              className="inline-flex h-13 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#0c7772] ring-1 ring-[#0c7772]/25 transition hover:bg-[#eef8f6]"
            >
              Contact Sandy Toes
            </Link>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-6">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <ShieldCheck className="h-4 w-4 text-[#0c7772]" />
              {booking
                ? "A confirmation summary has been prepared for this stay."
                : "For privacy, booking details are only shown when the reservation link is valid."}
            </p>
          </div>
        </div>

        <aside className="bg-white ring-1 ring-slate-200">
          <div className="relative h-64 bg-slate-200">
            <Image
              src="/media/booking/villa-details/hero-1.jpg"
              alt="Sandy Toes villa exterior"
              fill
              priority
              sizes="(min-width: 1024px) 420px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="space-y-5 p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0c7772]">
                Booking reference
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {booking?.bookingRef ?? bookingRef ?? "Sandy Toes"}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <p className="flex items-start gap-3 text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0c7772]" />
                <span>{booking?.propertyName ?? "Sandy Toes at Treasure Cay"}</span>
              </p>
              {booking ? (
                <>
                  <p className="flex items-start gap-3 text-slate-600">
                    <CalendarCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0c7772]" />
                    <span>
                      {formatISTDate(booking.checkIn)} to {formatISTDate(booking.checkOut)} ·{" "}
                      {booking.nights} night{booking.nights === 1 ? "" : "s"}
                    </span>
                  </p>
                  <p className="flex items-start gap-3 text-slate-600">
                    <Users className="mt-0.5 h-4 w-4 shrink-0 text-[#0c7772]" />
                    <span>
                      {booking.adults} adult{booking.adults === 1 ? "" : "s"}
                      {booking.children
                        ? `, ${booking.children} child${booking.children === 1 ? "" : "ren"}`
                        : ""}
                    </span>
                  </p>
                  <p className="flex items-start gap-3 text-slate-600">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#0c7772]" />
                    <span>{booking.guestEmail}</span>
                  </p>
                </>
              ) : null}
            </div>

            {booking ? (
              <div className="border-t border-slate-200 pt-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-slate-600">Stay total</span>
                  <span className="text-2xl font-semibold text-slate-950">
                    {formatCents(booking.totalCents, booking.currency)}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="grid gap-2 border-t border-slate-200 pt-5 text-sm text-slate-600">
              <Link
                href={`mailto:${BRAND.email}`}
                className="flex items-center gap-2 font-semibold text-[#0c7772]"
              >
                <Mail className="h-4 w-4" />
                {BRAND.email}
              </Link>
              <Link
                href={`tel:${BRAND.phoneHref}`}
                className="flex items-center gap-2 font-semibold text-[#0c7772]"
              >
                <Phone className="h-4 w-4" />
                {BRAND.phoneDisplay}
              </Link>
            </div>
          </div>
        </aside>
      </section>

      <Footer />
    </main>
  );
}
