import Header from "@/components/layouts/Header";
import WaitlistHero from "@/components/pages/waitlist/WaitlistHero";
import WaitlistForm from "@/components/pages/waitlist/WaitlistForm";
import Footer from "@/components/layouts/Footer";

export const metadata = {
  title: "Join Waitlist | Dazzling Screens Private Theatre",
  description:
    "Join the waitlist for Dazzling Screens private theatre bookings or share your special requirements. We’ll reach out as soon as a slot opens.",
};

export default function WaitlistPage() {
  return (
    <>
      <Header />
      <WaitlistHero />
      <WaitlistForm />
      <Footer />
    </>
  );
}
