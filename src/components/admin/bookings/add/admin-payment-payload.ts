type PaymentAmountMode = "ADVANCE" | "FULL" | "REMAINING";

type ResolveAdminBookingPaymentPayloadInput = {
  isEditMode: boolean;
  amountPayNow: number;
  paymentAmountMode: PaymentAmountMode;
  pricingAdvancePaid: number | null | undefined;
  pricingRemainingPayable: number | null | undefined;
  editAdvancePaidAlready: number;
};

export function resolveAdminBookingPaymentPayload(
  input: ResolveAdminBookingPaymentPayloadInput
) {
  if (!input.isEditMode) {
    return {
      amountMode:
        input.paymentAmountMode === "REMAINING"
          ? "FULL"
          : input.paymentAmountMode,
      advanceAmount: input.amountPayNow,
    };
  }

  const isCollectingNow = input.amountPayNow > 0;

  if (!isCollectingNow) {
    return {
      amountMode: "ADVANCE" as const,
      advanceAmount: input.editAdvancePaidAlready,
    };
  }

  return {
    amountMode:
      input.paymentAmountMode === "REMAINING" ||
      (input.pricingRemainingPayable ?? 0) <= 0
        ? "FULL"
        : input.paymentAmountMode,
    advanceAmount: input.pricingAdvancePaid ?? input.editAdvancePaidAlready,
  };
}
