"use client";

import { useState } from "react";
import { galleryItems } from "@/components/pages/gallary/galleryData";
import { Occasion } from "@/components/pages/gallary/types";
import GalleryHero from "@/components/pages/gallary/GalleryHero";
import OccasionFilter from "@/components/pages/gallary/OccasionFilter";
import GalleryGrid from "@/components/pages/gallary/GalleryGrid";
import StoryViewer from "@/components/pages/gallary/StoryViewer";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import CtaSection from "@/components/pages/home/CtaSection";

export default function GalleryPage() {
  const [activeOccasion, setActiveOccasion] =
    useState<Occasion>("All Moments");
  const [storyIndex, setStoryIndex] = useState<number | null>(null);

  const filtered =
    activeOccasion === "All Moments"
      ? galleryItems
      : galleryItems.filter((g) => g.occasion === activeOccasion);

  return (
    <>
      <Header />
      <GalleryHero />

      <section className="bg-gradient-to-b from-[#f8f8f6] to-[#eef2f7] px-[10px] pb-12 pt-8 sm:px-0 sm:pb-14 sm:pt-10 md:pt-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <OccasionFilter
            active={activeOccasion}
            onChange={(occasion) => {
              setActiveOccasion(occasion);
              setStoryIndex(null);
            }}
          />

          <GalleryGrid
            items={filtered}
            animationSeed={activeOccasion}
            onSelect={(i) => setStoryIndex(i)}
          />
        </div>

        {storyIndex !== null && (
          <StoryViewer
            items={filtered}
            index={storyIndex}
            onClose={() => setStoryIndex(null)}
          />
        )}
      </section>
      <CtaSection />
      <Footer />
    </>
  );
}
