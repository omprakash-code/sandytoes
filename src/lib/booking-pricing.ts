type CalculateBookingPricingInput = {
  slotBasePrice: number;
  slotFinalPrice?: number | null;
  guestCount: number;
  kidCount?: number;
  theatreBaseGuests: number;
  theatreExtraPersonPrice: number;
  theatreKidPrice?: number;
  theatreDecorationPrice: number;
  slotDecorationMandatory: boolean;
  decorationRequired: boolean;
  productsAmount?: number;
  discountAmount?: number;
  advancePaid?: number;
};

export type BookingPricingBreakdown = {
  baseAmount: number;
  extrasAmount: number;
  kidsAmount: number;
  productsAmount: number;
  decorationAmount: number;
  discountAmount: number;
  totalAmount: number;
  advancePaid: number;
  remainingPayable: number;
};

function toMoney(value: number | null | undefined) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.trunc(value as number));
}

export function calculateBookingPricing(
  input: CalculateBookingPricingInput
): BookingPricingBreakdown {
  const baseAmount = toMoney(input.slotFinalPrice ?? input.slotBasePrice);
  const guestCount = Math.max(0, Math.trunc(input.guestCount));
  const kidCount = Math.max(0, Math.trunc(input.kidCount ?? 0));
  const baseGuests = Math.max(0, Math.trunc(input.theatreBaseGuests));
  const extraGuestCount = Math.max(guestCount - baseGuests, 0);
  const extrasAmount = extraGuestCount * toMoney(input.theatreExtraPersonPrice);
  const kidsAmount = kidCount * toMoney(input.theatreKidPrice ?? 0);

  const decorationAmount =
    input.decorationRequired || input.slotDecorationMandatory
      ? toMoney(input.theatreDecorationPrice)
      : 0;

  const productsAmount = toMoney(input.productsAmount ?? 0);
  const grossAmount =
    baseAmount + extrasAmount + kidsAmount + decorationAmount + productsAmount;
  const discountAmount = Math.min(toMoney(input.discountAmount ?? 0), grossAmount);
  const totalAmount = Math.max(grossAmount - discountAmount, 0);
  const advancePaid = Math.min(toMoney(input.advancePaid ?? 0), totalAmount);
  const remainingPayable = Math.max(totalAmount - advancePaid, 0);

  return {
    baseAmount,
    extrasAmount,
    kidsAmount,
    productsAmount,
    decorationAmount,
    discountAmount,
    totalAmount,
    advancePaid,
    remainingPayable,
  };
}
