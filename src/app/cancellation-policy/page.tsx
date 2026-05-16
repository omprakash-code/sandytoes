import type { Metadata } from "next";
import Footer from "@/components/layouts/Footer";
import Header from "@/components/layouts/Header";

export const metadata: Metadata = {
  title: "Cancellation Policy | Dazzling Screens LLP",
  description:
    "Official cancellation policy for Dazzling Screens LLP bookings and advance payment refunds.",
  alternates: {
    canonical: "https://dazzlingscreens.com/cancellation-policy",
  },
  openGraph: {
    title: "Cancellation Policy | Dazzling Screens LLP",
    description:
      "Official cancellation policy for Dazzling Screens LLP bookings and advance payment refunds.",
    url: "https://dazzlingscreens.com/cancellation-policy",
    siteName: "Dazzling Screens",
    type: "website",
  },
};

const LAST_UPDATED = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "long",
  year: "numeric",
}).format(new Date());

export default function CancellationPolicyPage() {
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
              Cancellation Policy
            </h1>
            <p className="mt-2 text-base font-medium text-gray-700">
              Dazzling Screens LLP
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-gray-600 sm:text-base">
              This policy explains cancellation eligibility and advance amount
              refund conditions for bookings.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12 lg:py-14">
          <article className="space-y-6 text-gray-700 sm:space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                Cancellation Terms
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-7 sm:text-base">
                <p>
                  The advance amount will be fully refunded if the booking is
                  cancelled at least <strong>72 hours</strong> before the
                  scheduled booking time.
                </p>
                <p>
                  Cancellations requested within 72 hours of the booking time
                  may not be eligible for a full advance refund.
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
