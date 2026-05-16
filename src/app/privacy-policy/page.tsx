import type { Metadata } from "next";
import Footer from "@/components/layouts/Footer";
import Header from "@/components/layouts/Header";

export const metadata: Metadata = {
  title: "Privacy Policy | Dazzling Screens LLP",
  description:
    "Privacy Policy page for Dazzling Screens LLP with information on data collection and usage.",
  alternates: {
    canonical: "https://dazzlingscreens.com/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | Dazzling Screens LLP",
    description:
      "Privacy Policy page for Dazzling Screens LLP with information on data collection and usage.",
    url: "https://dazzlingscreens.com/privacy-policy",
    siteName: "Dazzling Screens",
    type: "website",
  },
};

const LAST_UPDATED = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "long",
  year: "numeric",
}).format(new Date());

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="mt-2 text-base font-medium text-gray-700">
              Dazzling Screens LLP
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-gray-600 sm:text-base">
              This is a Privacy Policy page that explains how user data may
              be collected, used, and protected while using our website.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12 lg:py-14">
          <article className="space-y-7 text-gray-700 sm:space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                Privacy and Policy -Dazzling screens LLP
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-7 sm:text-base">
                <p>
                  At The Dazzling screens , accessible from Dazzlingscreen.com,
                  one of our main priorities is the privacy of our visitors.
                  This Privacy Policy document contains types of information
                  that is collected and recorded by The Dazzling Screen and how
                  we use it.
                </p>
                <p>
                  If you have additional questions or require more information
                  about our Privacy Policy, do not hesitate to contact us
                  at 9289289696
                </p>
                <p>
                  This Privacy Policy applies only to our online activites and
                  is valid for visitors to our website with regards to the
                  information that they shared and/or collect in The Dazzling
                  screens. This policy is not applicable to any information
                  collected offline or via channels other than this website.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                Consent
              </h2>
              <p className="mt-3 text-sm leading-7 sm:text-base">
               By using our website, you hereby consent to our Privacy Policy and agree to its terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                Information we collect
              </h2>
              <p className="mt-3 text-sm leading-7 sm:text-base">
               The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
              </p>
               <p className="mt-3 text-sm leading-7 sm:text-base">
               If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.              </p>
               <p className="mt-3 text-sm leading-7 sm:text-base">
               When you register for an Account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                How we use your information
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-7 sm:text-base">
                <p>
                  We use the information we collect in various ways, including to:
                </p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Provide, operate, and maintain our website</li>
                  <li>Improve, personalize, and expand our website</li>
                  <li>Understand and analyze how you use our website</li>
                  <li>Develop new products, services, features, and functionality</li>
                  <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</li>
                  <li>Send you emails</li>
                  <li>Find and prevent fraud</li>
                </ol>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                Log Files
              </h2>
              <p className="mt-3 text-sm leading-7 sm:text-base">
                The Dazzling Screens follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services&apos; analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users&apos; movement on the website, and gathering demographic information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                Google DoubleClick DART Cookie
              </h2>
              <p className="mt-3 text-sm leading-7 sm:text-base">
                Google is one of the a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.website.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL - <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://policies.google.com/technologies/ads</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                Our Advertising Partners
              </h2>
              <p className="mt-3 text-sm leading-7 sm:text-base">
                Some of advertisers on our site may use cookies and web beacons. Our advertising partners are listed below. Each of our advertising partners has their own Privacy Policy for their policies on user data. For easier access, we hyperlinked to their Privacy Policies below.
              </p>
              <ol className="list-decimal pl-5 mt-2 space-y-1 text-sm leading-7 sm:text-base">
                <li>Google</li>
                <li>Meta</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                Advertising Partners Privacy Policies
              </h2>
              <p className="mt-3 text-sm leading-7 sm:text-base">
                You may consult this list to find the Privacy Policy for each of the advertising partners of The Dazzling Screens. Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on The Dazzling Screens, which are sent directly to users&apos; browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit. Note that The Dazzling Screens has no access to or control over these cookies that are used by third-party advertisers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                Third Party Privacy Policies
              </h2>
              <p className="mt-3 text-sm leading-7 sm:text-base">
                The Dazzling Screen&apos;s Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options. You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers&apos; respective websites.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                CCPA Privacy Rights
              </h2>
              <p className="mt-3 text-sm leading-7 sm:text-base">
                Under the CCPA, among other rights, California consumers have the right to:
              </p>
              <ol className="list-decimal pl-5 mt-2 space-y-2 text-sm leading-7 sm:text-base">
                <li>Request that a business that collects a consumer&apos;s personal data disclose the categories and specific pieces of personal data that a business has collected about consumers.</li>
                <li>Request that a business delete any personal data about the consumer that a business has collected.</li>
                <li>Request that a business that sells a consumer&apos;s personal data, not sell the consumer&apos;s personal data.</li>
              </ol>
              <p className="mt-3 text-sm leading-7 sm:text-base">
                If you make a request, we have one month to respond to you. If you would like to exercise any these rights, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                GDPR Data Protection Rights
              </h2>
              <p className="mt-3 text-sm leading-7 sm:text-base">
                We would like to make sure you are fully aware of all your data protection rights. Every user is entitled to the following:
              </p>
              <ol className="list-decimal pl-5 mt-2 space-y-2 text-sm leading-7 sm:text-base">
                <li><strong>The right to access</strong> - You have the right to request copies of your personal data. We may charge you a small fee for this service.</li>
                <li><strong>The right to rectification</strong> - You have the right to request that we correct any information you believe is inaccurate. You also have the right to request that we complete the information you believe is incomplete.</li>
                <li><strong>The right to erasure</strong> - You have the right to request that we erase your personal data, under certain conditions.</li>
                <li><strong>The right to restrict processing</strong> - You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
                <li><strong>The right to object to processing</strong> - You have the right to object to our processing of your personal data, under certain conditions.</li>
                <li><strong>The right to data portability</strong> - You have the right to request that we transfer the data we have collected to another organization, or directly to you, under certain conditions.</li>
              </ol>
              <p className="mt-3 text-sm leading-7 sm:text-base">
                If you make a request, we have one month to respond to you. If you would like to exercise any these rights, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                Children&apos;s Information
              </h2>
              <p className="mt-3 text-sm leading-7 sm:text-base">
                Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity. The Dazzling Screen does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                Changes to This Privacy Policy
              </h2>
              <p className="mt-3 text-sm leading-7 sm:text-base">
                We may update our Privacy Policy from time to time. Thus, we advise you to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately, after they are posted on this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                Contact Us
              </h2>
              <p className="mt-3 text-sm leading-7 sm:text-base">
                If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at 9289289696
              </p>
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
