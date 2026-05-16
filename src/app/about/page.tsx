import Footer from "@/components/layouts/Footer";
import Header from "@/components/layouts/Header";
import AboutCTA from "@/components/pages/about/AboutCTA";
import AboutHero from "@/components/pages/about/AboutHero";
import FoundersMessage from "@/components/pages/about/FoundersMessage";
import OurImpact from "@/components/pages/about/OurImpact";
import OurStory from "@/components/pages/about/OurStory";
import WhyChooseUs from "@/components/pages/about/WhyChooseUs";

export const metadata = {
  title: "About Dazzling Screens | Premium Private Theatre Experiences",
  description:
    "Discover Dazzling Screens — a premium private theatre brand creating unforgettable celebrations, proposals, birthdays, and intimate movie experiences with personalized setups.",
  keywords: [
    "Dazzling Screens",
    "private theatre",
    "private cinema",
    "birthday celebration theatre",
    "proposal private theatre",
    "anniversary celebration venue",
    "luxury private theatre",
  ],
  openGraph: {
    title: "About Dazzling Screens",
    description:
      "A premium private theatre experience designed for celebrations, proposals, and unforgettable moments.",
    url: "https://dazzlingscreens.com/about",
    siteName: "Dazzling Screens",
    type: "website",
  },
};


export default function AboutPage() {
  return (
    <>
      <Header/>
      <main className="overflow-x-hidden">
        <AboutHero />
        <OurStory/>
        <WhyChooseUs/>
        <OurImpact/>
        <FoundersMessage/>
        <AboutCTA/>
      </main>
      <Footer/>
    </>
  );
}
