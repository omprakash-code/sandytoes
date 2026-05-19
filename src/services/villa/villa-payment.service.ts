import { customAlphabet } from "nanoid";
import { assertLockValid } from "@/services/villa/villa-lock.service";

const paymentSessionId = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 18);

type LockQuoteSnapshot = {
  totalCents?: number;
  currency?: string;
  nights?: number;
  nightlyRateCents?: number;
  subtotalCents?: number;
};

export class VillaPaymentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VillaPaymentValidationError";
  }
}

function requireQuoteSnapshot(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new VillaPaymentValidationError("This reservation quote is no longer valid.");
  }

  const quote = value as LockQuoteSnapshot;
  if (
    typeof quote.totalCents !== "number" ||
    typeof quote.currency !== "string" ||
    typeof quote.nights !== "number" ||
    typeof quote.nightlyRateCents !== "number" ||
    typeof quote.subtotalCents !== "number"
  ) {
    throw new VillaPaymentValidationError("This reservation quote is no longer valid.");
  }

  return quote as Required<LockQuoteSnapshot>;
}

export async function createVillaPaymentIntent({
  lockToken,
  sessionId,
}: {
  lockToken: string;
  sessionId?: string;
}) {
  const lock = await assertLockValid(lockToken);
  if (sessionId && lock.sessionId !== sessionId) {
    throw new VillaPaymentValidationError("This payment session does not match the reservation hold.");
  }

  const quote = requireQuoteSnapshot(lock.quoteSnapshot);
  const mockPaymentSessionId = `mock_pi_${paymentSessionId()}`;

  // TODO(Stripe): replace this return shape with a real Stripe PaymentIntent:
  // - create PaymentIntent using amount/currency from quoteSnapshot
  // - attach lockToken in metadata
  // - use lockToken as part of the idempotency key
  // - confirm booking only from Stripe webhook after assertLockValid()
  return {
    provider: "MOCK" as const,
    paymentSessionId: mockPaymentSessionId,
    clientSecret: `${mockPaymentSessionId}_secret_mock`,
    lockToken: lock.lockToken,
    sessionId: lock.sessionId,
    expiresAt: lock.expiresAt.toISOString(),
    amountCents: quote.totalCents,
    currency: quote.currency,
    quote,
  };
}
