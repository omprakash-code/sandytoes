// src/hooks/booking/occasion/useSubmitOccasion.ts

"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useBooking } from "@/context/BookingContext";
import { BOOKING_ROUTES } from "@/constants/routes";
import { handleBookingError } from "@/utils/handleBookingError";

type SubmitOccasionInput = {
  occasionKey: string;                 // "BIRTHDAY"
  occasionData: Record<string, string>; // dynamic form fields
};

type SubmitOccasionOptions = {
  redirectOnSuccess?: boolean;
};

export function useSubmitOccasion() {
  const router = useRouter();
  const { booking, resetBooking } = useBooking();

  const submitOccasion = async ({
    occasionKey,
    occasionData,
  }: SubmitOccasionInput, options: SubmitOccasionOptions = {}) => {
    const { redirectOnSuccess = true } = options;

    /* -----------------------------
       Client-side safety checks
    ------------------------------ */
    if (!booking.bookingId) {
      toast.error("Booking not initialized.");
      router.replace(BOOKING_ROUTES.ROOT);
      return false;
    }

    if (!occasionKey) {
      toast.error("Occasion not selected.");
      return false;
    }

    const res = await fetch("/api/bookings/update/occasion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId: booking.bookingId,
        occasionKey,
        occasionData,
      }),
    });

    const error = await res.json().catch(() => null);
    if (!res.ok || !error?.success) {
      handleBookingError(error, router, {
        resetBooking,
        fallbackMessage: "Failed to update occasion.",
      });
      return false;
    }


    /* -----------------------------
       Redirect to next step
       (Extras flow starts with Cake)
    ------------------------------ */
    if (redirectOnSuccess) {
      router.push(BOOKING_ROUTES.EXTRAS("cake"));
    }

    return true;
  };

  return { submitOccasion };
}
