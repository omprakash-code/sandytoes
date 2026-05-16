import Header from "@/components/layouts/Header";
import ContactHero from "@/components/pages/contact/ContactHero";
import ContactMethods from "@/components/pages/contact/ContactMethods";
import ContactForm from "@/components/pages/contact/ContactForm";
import ContactMap from "@/components/pages/contact/ContactMap";
import Footer from "@/components/layouts/Footer";

export const metadata = {
  title: "Contact Dazzling Screens | Private Theatre Bookings & Support",
  description:
    "Get in touch with Dazzling Screens for private theatre bookings, celebrations, proposals, and support. We respond quickly via WhatsApp, call, or email.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <ContactHero />
      <ContactMethods />
      <ContactForm />
      <ContactMap/>
      <Footer />
    </>
  );
}
