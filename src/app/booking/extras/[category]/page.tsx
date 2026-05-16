"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import StepsIndicator from "@/components/booking/steps/StepIndicator";
import BookingSummary from "@/components/booking/summary/BookingSummary";
import ProductList from "@/components/booking/products/ProductList";
import { ChevronLeft } from "@/components/icons";

import { useBookingItems } from "@/hooks/booking/useBookingItems";
import TermsModal from "@/components/booking/terms/TermsModal";
import { BOOKING_ROUTES } from "@/constants/routes";
import { handleBookingError } from "@/utils/handleBookingError";
import MobileStickyAction from "@/components/booking/global/MobileStickyAction";
import { ensureRazorpayCheckoutLoaded } from "@/lib/razorpay/checkout-client";

/* --------------------------------
  CATEGORY FLOW CONFIG
--------------------------------- */

const CATEGORY_FLOW = ["cake", "decoration", "gift"] as const;
type Category = (typeof CATEGORY_FLOW)[number];

const STEP_INDEX: Record<Category, number> = {
  cake: 4,
  decoration: 4,
  gift: 4,
};

const CATEGORY_LABEL: Record<Category, string> = {
  cake: "Cake",
  decoration: "Decoration",
  gift: "Gift",
};

const CATEGORY_SUBTEXT: Record<Category, string> = {
  cake: "Choose a cake to make your celebration sweeter.",
  decoration: "Pick decoration add-ons to personalize your setup.",
  gift: "Add gifts to complete your surprise experience.",
};

/* --------------------------------
  Page
--------------------------------- */

export default function ExtrasCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showInlineSummarySubmit, setShowInlineSummarySubmit] = useState(false);


  /* -----------------------------
     Resolve category (SAFE)
  ------------------------------ */
  const rawCategory = params.category as string | undefined;
  const category = rawCategory?.toLowerCase() as Category | undefined;

  /* -----------------------------
     Hooks (ALWAYS CALLED)
  ------------------------------ */
  const {
    fetchItems,
  } = useBookingItems();

  const {
    booking,
    hydrated,
    setBookingItems,
    itemsHydrated,
    setCouponState,
    clearCouponState,
    resetBooking,
  } = useBooking();
  const bookingId = booking.bookingId;

  const fetchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    if (itemsHydrated) return;
    if (fetchedRef.current === bookingId) return;

    fetchedRef.current = bookingId;
    fetchItems();
  }, [bookingId, fetchItems, itemsHydrated]);

  useEffect(() => {
    if (!booking.bookingId || !itemsHydrated) return;
    if ((booking.appliedCoupons?.length ?? 0) === 0) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/bookings/items/commit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: booking.bookingId,
            items: booking.bookingItems,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data?.success) {
          handleBookingError(data, router, {
            resetBooking,
            fallbackMessage: "Unable to refresh booking items.",
          });
          return;
        }

        const discount = Number(data.discountAmount ?? 0);
        const coupons = Array.isArray(data.appliedCoupons)
          ? data.appliedCoupons
          : [];

        if (coupons.length === 0 || discount <= 0) {
          clearCouponState();
          return;
        }

        const nextCoupons = coupons as Array<{
          id: string;
          code: string;
          status: "RESERVED" | "CONFIRMED" | "RELEASED";
          discountAmount: number;
        }>;

        const unchanged =
          discount === (Number(booking.couponDiscount) || 0) &&
          nextCoupons.length === (booking.appliedCoupons?.length ?? 0) &&
          nextCoupons.every((coupon, index) => {
            const current = booking.appliedCoupons?.[index];
            return (
              current?.id === coupon.id &&
              current?.status === coupon.status &&
              Number(current?.discountAmount ?? 0) ===
              Number(coupon.discountAmount ?? 0)
            );
          });

        if (unchanged) return;

        setCouponState({
          discount,
          coupons: nextCoupons,
        });
      } catch {
        // silent in background sync
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [
    booking.bookingId,
    booking.bookingItems,
    booking.appliedCoupons,
    booking.couponDiscount,
    itemsHydrated,
    setCouponState,
    clearCouponState,
    router,
    resetBooking,
  ]);

  useEffect(() => {
    if (!showTerms) return;
    void ensureRazorpayCheckoutLoaded();
  }, [showTerms]);


  /* -----------------------------
     Protect Direct URL Access
  ------------------------------ */

  useEffect(() => {
    if (!hydrated) return;
    if (!booking.bookingId) {
      router.replace(BOOKING_ROUTES.ROOT);
    }
  }, [hydrated, booking.bookingId, router]);

/* -----------------------------
     Redirect invalid category
  ------------------------------ */

  useEffect(() => {
    if (!category || !CATEGORY_FLOW.includes(category)) {
      router.replace(BOOKING_ROUTES.OCCASION);
    }
  }, [category, router]);

  /* -----------------------------
     Navigation helpers
  ------------------------------ */
  const currentIndex = category
    ? CATEGORY_FLOW.indexOf(category)
    : -1;
  const extrasSubProgress =
    currentIndex >= 0
      ? {
          current: currentIndex + 1,
          total: CATEGORY_FLOW.length,
        }
      : undefined;

  const nextCategory = currentIndex >= 0 ? CATEGORY_FLOW[currentIndex + 1] : null;
  const prevCategory = currentIndex > 0 ? CATEGORY_FLOW[currentIndex - 1] : null;

  const isLastCategory = !nextCategory;
  const submitLabelByCategory: Record<Category, string> = {
    cake: "Continue to Decorations",
    decoration: "Continue to Gifts",
    gift: "Continue to Payment",
  };

  const handleContinue = async () => {
    if (!booking.bookingId) return;

    // COMMIT ONLY ON LAST CATEGORY
    if (isLastCategory) {
      const res = await fetch("/api/bookings/items/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.bookingId,
          items: booking.bookingItems,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        handleBookingError(data, router, {
          resetBooking,
          fallbackMessage: "Unable to save add-ons.",
        });
        return;
      }

      setShowTerms(true);
      return;
    }

    // ➡ Move forward without DB write
    router.push(`/booking/extras/${nextCategory}`);
  };



  /* -----------------------------
     Breadcrumbs
  ------------------------------ */
  const breadcrumbs = useMemo(() => {
    return CATEGORY_FLOW.map((c, index) => ({
      label: CATEGORY_LABEL[c],
      active: c === category,
      completed: index < currentIndex,
    }));
  }, [category, currentIndex]);

  /* -----------------------------
     Render guard (visual only)
  ------------------------------ */
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Loading booking…
      </div>
    );
  }

  if (!category || !CATEGORY_FLOW.includes(category)) {
    return null;
  }

  /* -----------------------------
     Render
  ------------------------------ */
  return (
    <div className="w-full bg-[#f8f8f8] min-h-screen flow-root">

      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-0 sm:pt-5 pb-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-4">
          {/* LEFT */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-[#f3f4f7] p-2 md:p-3">
            <StepsIndicator
              currentStep={STEP_INDEX[category]}
              extrasSubProgress={extrasSubProgress}
              className="lg:hidden !px-2 !py-2"
            />
            <div className="mb-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (prevCategory) {
                    router.push(`/booking/extras/${prevCategory}`);
                    return;
                  }
                  router.push(BOOKING_ROUTES.OCCASION);
                }}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <ChevronLeft size={14} />
                Back
              </button>

              <button
                type="button"
                onClick={handleContinue}
                className="inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Skip
              </button>
            </div>

            <h2 className="mb-1 text-xl font-semibold text-black">
              Add {CATEGORY_LABEL[category]}
            </h2>
            <p className="mb-5 text-sm text-gray-500">
              {CATEGORY_SUBTEXT[category]}
            </p>

            <ProductList
              category={category.toUpperCase()}
              selectedProducts={booking.bookingItems}
            />
            {category === "cake" && (
              <p className="mt-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-normal text-black sm:text-sm">
                Disclaimer: Every cake is made fresh to order, so the final
                design may vary slightly from the images shown.
              </p>
            )}

          </div>

          {/* RIGHT */}
          <div className="lg:sticky lg:top-28 h-fit">
            <BookingSummary
              extrasProgress={breadcrumbs}
              products={booking.bookingItems}
              onRemoveItem={(id) =>
                setBookingItems((prev) =>
                  prev.filter((item) => item.id !== id)
                )
              }
              onSubmit={handleContinue}
              hideSubmitOnMobile
              onMobileInlineSubmitVisibilityChange={setShowInlineSummarySubmit}
              submitLabel={submitLabelByCategory[category]}
            />
          </div>
        </div>
      </div>
      <MobileStickyAction
        label={submitLabelByCategory[category]}
        onClick={handleContinue}
        hidden={showInlineSummarySubmit}
        totalPrice={booking.pricing?.total ?? booking.slot?.basePrice ?? null}
        advancePay={booking.pricing?.advancePay ?? null}
      />

      {/* TERMS POPUP */}
      <TermsModal
        open={showTerms}
        onClose={() => setShowTerms(false)}
        checked={termsAccepted}
        setChecked={setTermsAccepted}
        advancePay={booking.pricing?.advancePay ?? null}
        onConfirm={async () => {
          if (!termsAccepted || !booking.bookingId) return;

          const res = await fetch("/api/bookings/accept-terms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId: booking.bookingId,
            }),
          });

          const json = await res.json().catch(() => null);
          if (!res.ok || !json?.success) {
            handleBookingError(json, router, {
              resetBooking,
              fallbackMessage: "Unable to continue to payment.",
            });
            return;
          }

          void ensureRazorpayCheckoutLoaded();
          router.push(BOOKING_ROUTES.PAYMENT);
        }}
      />
    </div>
  );
}
