import type { Metadata } from "next";
import Footer from "@/components/layouts/Footer";
import Header from "@/components/layouts/Header";

export const metadata: Metadata = {
  title: "Terms & Conditions | Dazzling Screens LLP",
  description:
    "Official Terms & Conditions governing the use of Dazzling Screens LLP website and services.",
  alternates: {
    canonical: "https://dazzlingscreens.com/terms-and-conditions",
  },
  openGraph: {
    title: "Terms & Conditions | Dazzling Screens LLP",
    description:
      "Official Terms & Conditions governing the use of Dazzling Screens LLP website and services.",
    url: "https://dazzlingscreens.com/terms-and-conditions",
    siteName: "Dazzling Screens",
    type: "website",
  },
};

export default function TermsAndConditionsPage() {
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
              TERMS & CONDITIONS
            </h1>
            <p className="mt-2 text-base font-medium text-gray-700">
              Dazzling Screens LLP
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12 lg:py-14">
          <article className="space-y-8 text-gray-700 sm:space-y-10">
            <section>
              <ul className="list-disc pl-5 space-y-3 text-sm leading-7 sm:text-base">
                <li>Outside food beverages not allowed</li>
                <li>Smoking/Drinking is NOT allowed inside the theater. If found, a fine of up to ₹2,000 will be charged.</li>
                <li>Any damage caused to the theater, including decorative materials like balloons, lights, etc., must be reimbursed.</li>
                <li>Guests are requested to maintain cleanliness inside the theater to avoid cleaning charges.</li>
                <li>Party poppers, snow sprays, cold fire, and any other similar items are strictly prohibited inside the theater.</li>
                <li>Pets are strictly not allowed inside the theater.</li>
                <li>In case of an electricity cut lasting more than 15 minutes, your booking amount will be refunded.</li>
                <li>Couples under 18 years of age are not allowed to book the theater.</li>
                <li>Aadhaar card is mandatory. In case of couples, both individuals must present their ID, which will be scanned at reception.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                REFUND POLICY
              </h2>
              <ul className="mt-4 list-disc pl-5 space-y-3 text-sm leading-7 sm:text-base">
                <li>The advance amount is fully refundable if the slot is canceled at least 72 hours before the slot time.</li>
                <li>If your slot is less than 72 hours away from the time of payment, no refund or slot rescheduling will be possible under any circumstances.</li>
              </ul>
            </section>
          </article>
        </section>
      </main>

      <Footer />
    </>
  );
}
