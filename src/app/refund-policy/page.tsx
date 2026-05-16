import type { Metadata } from "next";
import Footer from "@/components/layouts/Footer";
import Header from "@/components/layouts/Header";

export const metadata: Metadata = {
  title: "Refund Policy | Dazzling Screens LLP",
  description:
    "Official refund policy for slot reservations and advance payments at Dazzling Screens LLP.",
  alternates: {
    canonical: "https://dazzlingscreens.com/refund-policy",
  },
  openGraph: {
    title: "Refund Policy | Dazzling Screens LLP",
    description:
      "Official refund policy for slot reservations and advance payments at Dazzling Screens LLP.",
    url: "https://dazzlingscreens.com/refund-policy",
    siteName: "Dazzling Screens",
    type: "website",
  },
};

const LAST_UPDATED = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "long",
  year: "numeric",
}).format(new Date());

export default function RefundPolicyPage() {
  return (
    <>
      <Header />

      <main className="bg-white pt-28 md:pt-29">
        <section className="border-b border-gray-200 bg-gray-50">
          <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-16 lg:py-20">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gray-500">
              Legal
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-gray-900 sm:text-4xl">
              Refund Policy
            </h1>
            <p className="mt-2 text-base font-medium text-gray-700">
              Dazzling Screens LLP
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-gray-600 sm:text-base">
              This policy explains how refunds are processed for advance slot
              reservations made through Dazzling Screens LLP.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12 lg:py-14">
          <article className="space-y-6 text-gray-700 sm:space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                Refund Terms
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-7 sm:text-base">
                <p>
                  We collect an advance amount of <strong>Rs. 750</strong> for
                  reservation of a theater slot.
                </p>
                <p>
                  This advance amount is fully refundable (except convenience
                  charges of the payment gateway, if any) if we are informed
                  about booking cancellation at least <strong>72 hours</strong>{" "}
                  before the booking through WhatsApp chat.
                </p>
                <p>
                  Refunds are usually initiated within <strong>24 hours</strong>{" "}
                  and may take up to <strong>5-7 business days</strong> to
                  reflect, depending on your bank or payment provider.
                </p>
              </div>
            </section>

            <section>
              <p className="text-sm text-gray-500">Last Updated: {LAST_UPDATED}</p>
            </section>
          </article>
        </section>
      </main>

      <Footer />
    </>
  );
}
