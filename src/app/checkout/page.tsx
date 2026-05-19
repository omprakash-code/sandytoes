import type { Metadata } from "next";
import CheckoutPageClient, {
  type CheckoutSearchParams,
} from "@/components/pages/checkout/CheckoutPageClient";
import { BRAND } from "@/constants/brand";

export const metadata: Metadata = {
  title: `Checkout | ${BRAND.name}`,
  description:
    "Complete your Sandy Toes villa reservation with guest details, payment information, and stay protection options.",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<CheckoutSearchParams>;
}) {
  const params = await searchParams;
  return <CheckoutPageClient params={params} />;
}
