"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, LockKeyhole, ShieldCheck } from "lucide-react";

const CHECKOUT_DRAFT_KEY = "sandy-toes-checkout-draft";
const SESSION_BOOKING_KEY = "sandy-toes-checkout-review";

type StoredBookingReview = {
  lockToken: string;
  paymentSessionId: string;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phoneCountry: string;
    phone: string;
  };
  payment: {
    method: "card" | "affirm";
    cardLast4?: string;
  };
  billingAddress: {
    country: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
  };
  damageOption: "protection" | "deposit";
};

function getTimeRemainingLabel(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function BookingPaymentClient({
  lockToken,
  expiresAt,
  checkoutHref,
}: {
  lockToken: string;
  expiresAt: string;
  checkoutHref: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const expiresAtTime = useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  const remainingMs = expiresAtTime - now;
  const expired = remainingMs <= 0;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!expired) return;
    const timeout = window.setTimeout(() => {
      router.replace(checkoutHref);
    }, 3500);
    return () => window.clearTimeout(timeout);
  }, [checkoutHref, expired, router]);

  async function confirmBooking() {
    if (expired) {
      setError("This reservation hold has expired. Please choose your dates again.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const rawReview = window.sessionStorage.getItem(SESSION_BOOKING_KEY);
      const review = rawReview ? (JSON.parse(rawReview) as StoredBookingReview) : null;
      if (!review || review.lockToken !== lockToken) {
        throw new Error("Please return to checkout and review your reservation details.");
      }

      const response = await fetch("/api/villa-payments/mock-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lockToken,
          paymentSessionId: review.paymentSessionId,
          guest: review.guest,
          billingAddress: review.billingAddress,
          payment: review.payment,
          damageOption: review.damageOption,
          consent: true,
        }),
      });
      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
        data?: { bookingRef: string };
      };

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message ?? "Unable to confirm this reservation.");
      }

      try {
        window.sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
        window.sessionStorage.removeItem(SESSION_BOOKING_KEY);
      } catch {
        // Browser storage is optional for this step.
      }

      router.push(`/booking-success?ref=${encodeURIComponent(payload.data.bookingRef)}`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to confirm this reservation.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-[#fbfaf8] p-5 ring-1 ring-slate-200">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <LockKeyhole className="h-4 w-4 text-[#0c7772]" />
          Secure reservation confirmation
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Your dates are being held while you complete this step.
        </p>
        <div
          className={`mt-4 flex items-center justify-between gap-4 px-3 py-2 text-sm font-semibold ${
            expired ? "bg-[#fff0ef] text-[#b94f56]" : "bg-white text-[#0c7772]"
          }`}
        >
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Hold time
          </span>
          <span>{expired ? "Expired" : getTimeRemainingLabel(remainingMs)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={confirmBooking}
        disabled={submitting || expired}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#ea7e82] px-6 text-base font-semibold text-white transition hover:bg-[#d86f73] focus:outline-none focus:ring-4 focus:ring-[#ea7e82]/25 disabled:cursor-not-allowed disabled:opacity-65"
      >
        {submitting ? (
          "Confirming..."
        ) : (
          <>
            <CheckCircle2 className="h-5 w-5" />
            Confirm Reservation
          </>
        )}
      </button>

      {error ? (
        <p className="bg-[#fff0ef] p-3 text-sm font-semibold text-[#b94f56]">{error}</p>
      ) : null}
      {expired ? (
        <p className="bg-[#fff0ef] p-3 text-sm font-semibold text-[#b94f56]">
          This reservation hold has expired. We will take you back to checkout so you can refresh
          availability.
        </p>
      ) : null}

      <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#0c7772]">
        <ShieldCheck className="h-4 w-4" />
        Protected booking
      </p>
    </div>
  );
}
