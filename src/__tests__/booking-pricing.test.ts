import { describe, expect, it } from "vitest";

import { calculateBookingPricing } from "@/lib/booking-pricing";

describe("calculateBookingPricing", () => {
  it("includes kids pricing separately from adult extra guests", () => {
    const pricing = calculateBookingPricing({
      slotBasePrice: 2000,
      slotFinalPrice: 2250,
      guestCount: 4,
      kidCount: 2,
      theatreBaseGuests: 2,
      theatreExtraPersonPrice: 300,
      theatreKidPrice: 200,
      theatreDecorationPrice: 750,
      slotDecorationMandatory: false,
      decorationRequired: true,
      productsAmount: 500,
      discountAmount: 250,
      advancePaid: 1000,
    });

    expect(pricing).toEqual({
      baseAmount: 2250,
      extrasAmount: 600,
      kidsAmount: 400,
      productsAmount: 500,
      decorationAmount: 750,
      discountAmount: 250,
      totalAmount: 4250,
      advancePaid: 1000,
      remainingPayable: 3250,
    });
  });
});
