import { describe, expect, it } from "vitest";

import { resolveAdminBookingPaymentPayload } from "@/components/admin/bookings/add/admin-payment-payload";

describe("resolveAdminBookingPaymentPayload", () => {
  it("preserves partial payment on no-op admin edit instead of collecting remaining", () => {
    const payload = resolveAdminBookingPaymentPayload({
      isEditMode: true,
      amountPayNow: 0,
      paymentAmountMode: "REMAINING",
      pricingAdvancePaid: 3000,
      pricingRemainingPayable: 0,
      editAdvancePaidAlready: 750,
    });

    expect(payload).toEqual({
      amountMode: "ADVANCE",
      advanceAmount: 750,
    });
  });

  it("collects the full remaining amount when admin explicitly chooses to collect now", () => {
    const payload = resolveAdminBookingPaymentPayload({
      isEditMode: true,
      amountPayNow: 2250,
      paymentAmountMode: "REMAINING",
      pricingAdvancePaid: 3000,
      pricingRemainingPayable: 0,
      editAdvancePaidAlready: 750,
    });

    expect(payload).toEqual({
      amountMode: "FULL",
      advanceAmount: 3000,
    });
  });
});
