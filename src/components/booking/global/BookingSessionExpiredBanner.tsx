"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useBooking } from "@/context/BookingContext";
import {
  BOOKING_SESSION_EXPIRED_MODAL_TITLE,
  BOOKING_SESSION_EXPIRED_MODAL_MESSAGE,
  BOOKING_SESSION_EXPIRED_EVENT,
  clearPaymentPageBlockedNotice,
  consumeBookingSessionExpiredNotice,
} from "@/lib/booking-session-expiry";
import { PAYMENT_CAPTURED_FAILURE_MODAL_TITLE } from "@/lib/payment-capture-failure";
import { BOOKING_ROUTES } from "@/constants/routes";

type SessionExpiredState = {
  title: string;
  message: string;
};

type SessionExpiredEvent = CustomEvent<{ title?: string; message?: string }>;

export default function BookingSessionExpiredBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const { resetBooking } = useBooking();
  const [notice, setNotice] = useState<SessionExpiredState | null>(null);
  const isSessionModalSuppressedPage =
    pathname === BOOKING_ROUTES.ROOT ||
    pathname === BOOKING_ROUTES.THEATRE ||
    pathname.startsWith("/booking/success");

  useEffect(() => {
    let cachedMessageRafId: number | null = null;
    const cachedMessage = consumeBookingSessionExpiredNotice();
    if (cachedMessage && !isSessionModalSuppressedPage) {
      cachedMessageRafId = window.requestAnimationFrame(() => {
        setNotice(cachedMessage);
      });
    }

    const onSessionExpired = (event: Event) => {
      const customEvent = event as SessionExpiredEvent;
      if (isSessionModalSuppressedPage) {
        setNotice(null);
        return;
      }
      setNotice({
        title:
          customEvent.detail?.title ?? BOOKING_SESSION_EXPIRED_MODAL_TITLE,
        message:
          customEvent.detail?.message ?? BOOKING_SESSION_EXPIRED_MODAL_MESSAGE,
      });
    };

    window.addEventListener(BOOKING_SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => {
      if (cachedMessageRafId != null) {
        window.cancelAnimationFrame(cachedMessageRafId);
      }
      window.removeEventListener(
        BOOKING_SESSION_EXPIRED_EVENT,
        onSessionExpired
      );
    };
  }, [isSessionModalSuppressedPage]);

  useEffect(() => {
    if (isSessionModalSuppressedPage && notice) {
      const rafId = window.requestAnimationFrame(() => {
        setNotice(null);
      });
      return () => window.cancelAnimationFrame(rafId);
    }
  }, [isSessionModalSuppressedPage, notice]);

  if (!notice || isSessionModalSuppressedPage) return null;

  const showContactSupportAction =
    notice.title === PAYMENT_CAPTURED_FAILURE_MODAL_TITLE;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
      aria-describedby="session-expired-message"
    >
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-4 shadow-2xl">
        <h3
          id="session-expired-title"
          className="text-base font-semibold text-slate-900"
        >
          {notice.title}
        </h3>
        <p
          id="session-expired-message"
          className="mt-2 whitespace-pre-line text-sm text-slate-600"
        >
          {notice.message}
        </p>

        <div className="mt-5 flex justify-end gap-2">
          {showContactSupportAction ? (
            <button
              type="button"
              onClick={() => {
                toast.dismiss("verify");
                toast.dismiss("pay");
                clearPaymentPageBlockedNotice();
                resetBooking();
                setNotice(null);
                router.replace(BOOKING_ROUTES.ROOT);
                window.setTimeout(() => {
                  router.push("/contact");
                }, 0);
              }}
              className="rounded-full border border-black/20 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black/10 cursor-pointer"
            >
              Contact Support
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              toast.dismiss("verify");
              toast.dismiss("pay");
              clearPaymentPageBlockedNotice();
              resetBooking();
              setNotice(null);
              router.push(BOOKING_ROUTES.THEATRE);
            }}
            className="rounded-full bg-white border border-black/20 px-4 py-2 text-sm font-medium text-black transition hover:bg-black/10 cursor-pointer"
          >
            Restart Booking
          </button>
        </div>
      </div>
    </div>
  );
}
