import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, Mail, MapPin, Users } from "lucide-react";
import Footer from "@/components/layouts/Footer";
import BookingPaymentClient from "@/components/pages/booking-payment/BookingPaymentClient";
import VillaBookingHeader from "@/components/pages/villa-details/VillaBookingHeader";
import { BRAND } from "@/constants/brand";
import { prisma } from "@/lib/db";
import { formatCents } from "@/lib/villa-booking";

type BookingPaymentSearchParams = Record<string, string | string[] | undefined>;

export const metadata: Metadata = {
  title: `Confirm Reservation | ${BRAND.name}`,
  description: "Confirm your Sandy Toes villa reservation.",
};

function firstParam(params: BookingPaymentSearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function readQuoteSnapshot(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as {
    totalCents?: number;
    currency?: string;
    nights?: number;
  };
}

function formatStayDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function BookingPaymentPage({
  searchParams,
}: {
  searchParams: Promise<BookingPaymentSearchParams>;
}) {
  const params = await searchParams;
  const lockToken = firstParam(params, "lock")?.trim();
  const lock = lockToken
    ? await prisma.villaBookingLock.findFirst({
        where: {
          lockToken,
          status: "ACTIVE",
          expiresAt: { gt: new Date() },
        },
        select: {
          checkIn: true,
          checkOut: true,
          adults: true,
          children: true,
          guestEmail: true,
          expiresAt: true,
          quoteSnapshot: true,
          villa: {
            select: {
              name: true,
              currency: true,
            },
          },
        },
      })
    : null;
  const quote = readQuoteSnapshot(lock?.quoteSnapshot);
  const checkoutHref = lock
    ? `/checkout?${new URLSearchParams({
        checkIn: lock.checkIn.toISOString().slice(0, 10),
        checkOut: lock.checkOut.toISOString().slice(0, 10),
        adults: String(lock.adults),
        children: String(lock.children),
      }).toString()}`
    : "/checkout";

  return (
    <main className="min-h-screen bg-[#f7f5f2] text-slate-950">
      <VillaBookingHeader active="checkout" ctaLabel="View Villa" ctaHref="/villa-details" />

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:py-12">
        <div className="bg-white p-6 ring-1 ring-slate-200 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0c7772]">
            Final confirmation
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
            Complete your Sandy Toes reservation.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
            Review the stay summary and confirm your reservation for Treasure Cay. Your booking
            reference will be issued immediately after confirmation.
          </p>

          {lock ? (
            <div className="mt-8 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-2">
              <p className="flex items-start gap-3 text-sm text-slate-600">
                <CalendarCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0c7772]" />
                <span>
                  {formatStayDate(lock.checkIn)} to {formatStayDate(lock.checkOut)} ·{" "}
                  {quote?.nights ?? "Selected"} night{quote?.nights === 1 ? "" : "s"}
                </span>
              </p>
              <p className="flex items-start gap-3 text-sm text-slate-600">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-[#0c7772]" />
                <span>
                  {lock.adults} adult{lock.adults === 1 ? "" : "s"}
                  {lock.children
                    ? `, ${lock.children} child${lock.children === 1 ? "" : "ren"}`
                    : ""}
                </span>
              </p>
              <p className="flex items-start gap-3 text-sm text-slate-600 sm:col-span-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#0c7772]" />
                <span>{lock.guestEmail}</span>
              </p>
            </div>
          ) : (
            <div className="mt-8 bg-[#fff0ef] p-4 text-sm font-semibold text-[#b94f56]">
              This reservation hold is no longer active. Please return to checkout to refresh
              availability.
            </div>
          )}

          <div className="mt-8">
            <Link
              href={checkoutHref}
              className="text-sm font-semibold text-[#0c7772] transition hover:text-[#ea7e82]"
            >
              Return to checkout
            </Link>
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
                Reservation hold
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {lock ? "Ready to confirm" : "Refresh required"}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <p className="flex items-start gap-3 text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0c7772]" />
                <span>{lock?.villa.name ?? "Sandy Toes at Treasure Cay"}</span>
              </p>
              {lock && quote?.totalCents ? (
                <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-5">
                  <span className="font-semibold text-slate-600">Stay total</span>
                  <span className="text-2xl font-semibold text-slate-950">
                    {formatCents(quote.totalCents, quote.currency ?? lock.villa.currency)}
                  </span>
                </div>
              ) : null}
            </div>

            {lock && lockToken ? (
              <BookingPaymentClient
                lockToken={lockToken}
                expiresAt={lock.expiresAt.toISOString()}
                checkoutHref={checkoutHref}
              />
            ) : (
              <Link
                href={checkoutHref}
                className="flex h-12 items-center justify-center rounded-full bg-[#ea7e82] px-5 text-sm font-semibold text-white transition hover:bg-[#d86f73]"
              >
                Return to checkout
              </Link>
            )}
          </div>
        </aside>
      </section>

      <Footer />
    </main>
  );
}
