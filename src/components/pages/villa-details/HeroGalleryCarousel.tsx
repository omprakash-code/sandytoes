"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  Images,
  PlayCircle,
  Share2,
} from "lucide-react";
import { useState } from "react";
import { BRAND } from "@/constants/brand";

const heroSlides = [
  {
    src: "/media/booking/villa-details/hero-1.jpg",
    alt: "Sandy Toes villa exterior and beach setting",
  },
  {
    src: "/media/booking/villa-details/hero-2.jpg",
    alt: "Sandy Toes villa pool and outdoor lounge",
  },
  {
    src: "/media/booking/villa-details/hero-3.jpg",
    alt: "Sandy Toes villa dining and gathering space",
  },
];

export default function HeroGalleryCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);

  function showPrevious() {
    setActiveIndex((current) =>
      current === 0 ? heroSlides.length - 1 : current - 1,
    );
  }

  function showNext() {
    setActiveIndex((current) =>
      current === heroSlides.length - 1 ? 0 : current + 1,
    );
  }

  async function handleShare() {
    const shareUrl =
      typeof window === "undefined"
        ? "https://sandytoesbooking.buildom.in/villa-details"
        : `${window.location.origin}/villa-details`;
    const shareData = {
      title: BRAND.propertyName,
      text: "Explore Sandy Toes at Treasure Cay.",
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1800);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareCopied(true);
        window.setTimeout(() => setShareCopied(false), 1800);
      } catch {
        setShareCopied(false);
      }
    }
  }

  return (
    <section className="px-4 pb-5 pt-5 md:px-8 md:pt-6 lg:pb-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link href="/villa-details" className="font-medium text-[#0c7772] hover:underline">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <Link href="/villa-details" className="font-medium text-[#0c7772] hover:underline">
              Villas in Treasure Cay
            </Link>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <span className="text-slate-700">{BRAND.propertyName}</span>
          </nav>

          <button
            type="button"
            className="inline-flex h-11 w-fit items-center gap-2 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-[#f3a2a5] transition hover:bg-[#fff7f7]"
          >
            <FileText className="h-4 w-4 text-[#ea7e82]" />
            View Brochure
          </button>
        </div>

        <div className="mt-5">
          <div className="grid gap-2 md:h-[560px] md:grid-cols-[minmax(0,1fr)_168px]">
            <div className="relative min-h-[420px] overflow-hidden bg-slate-200 shadow-[0_18px_54px_rgba(6,30,31,0.12)] md:min-h-0">
              {heroSlides.map((slide, index) => (
                <Image
                  key={slide.src}
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1024px) 62vw, 100vw"
                  className={`object-cover transition-opacity duration-700 ease-out ${
                    index === activeIndex ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/45 to-transparent" />

              <div className="absolute left-5 top-5 bg-white/92 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur">
                Best Rated Villa
              </div>
              <div className="absolute right-5 top-5 flex gap-3">
                <button
                  type="button"
                  aria-label="Share property"
                  onClick={handleShare}
                  className="flex h-11 w-11 items-center justify-center bg-white/92 text-slate-900 shadow-md backdrop-blur transition hover:bg-white"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                {shareCopied ? (
                  <span className="absolute right-14 top-2 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white shadow-md">
                    Link copied
                  </span>
                ) : null}
                <button
                  type="button"
                  aria-label="Save property"
                  className="flex h-11 w-11 items-center justify-center bg-white/92 text-slate-900 shadow-md backdrop-blur transition hover:bg-white"
                >
                  <Heart className="h-5 w-5" />
                </button>
              </div>

              <button
                type="button"
                aria-label="Previous image"
                onClick={showPrevious}
                className="absolute left-5 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center bg-white/86 text-slate-950 shadow-md backdrop-blur transition hover:bg-white md:flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={showNext}
                className="absolute right-5 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center bg-white/86 text-slate-950 shadow-md backdrop-blur transition hover:bg-white md:flex"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute bottom-5 left-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex h-12 items-center gap-2 bg-white px-5 text-sm font-semibold text-slate-950 shadow-lg transition hover:bg-[#f7f5f2]"
                >
                  <Images className="h-5 w-5 text-[#0c7772]" />
                  View All Photos
                </button>
                <button
                  type="button"
                  className="inline-flex h-12 items-center gap-2 bg-black/35 px-5 text-sm font-semibold text-white ring-1 ring-white/45 backdrop-blur transition hover:bg-black/45"
                >
                  <PlayCircle className="h-5 w-5" />
                  Watch Video
                </button>
              </div>

              <div className="absolute bottom-6 right-6 hidden items-center gap-2 bg-black/30 px-3 py-2 backdrop-blur md:flex">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.src}
                    type="button"
                    aria-label={`Show image ${index + 1}`}
                    onClick={() => setActiveIndex(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === activeIndex ? "w-6 bg-white" : "w-1.5 bg-white/55"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 md:grid-cols-1 md:grid-rows-3">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.src}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`group relative min-h-[110px] overflow-hidden bg-slate-200 shadow-sm ring-offset-2 transition md:min-h-0 ${
                    index === activeIndex
                      ? "ring-2 ring-[#0c7772]"
                      : "ring-0 hover:ring-2 hover:ring-[#0c7772]/30"
                  }`}
                  aria-label={`Preview ${slide.alt}`}
                >
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    sizes="(min-width: 768px) 168px, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute bottom-2 right-2 bg-black/45 px-2 py-1 text-xs font-semibold text-white">
                    {index + 1}/{heroSlides.length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <nav className="mt-0 overflow-x-auto border-b border-slate-200 bg-white px-5 shadow-sm">
          <div className="flex min-w-max items-center gap-9 text-sm font-semibold text-slate-600 md:text-base">
            {[
              ["Overview", "#overview"],
              ["Highlights", "#overview"],
              ["Refund Policy", "#rules"],
              ["Spaces", "#rooms"],
              ["Reviews", "#reviews"],
              ["Amenities", "#amenities"],
              ["Meals", "#amenities"],
              ["Location", "#location"],
              ["Experiences", "#overview"],
              ["FAQ's", "#reserve"],
            ].map(([label, href], index) => (
              <Link
                key={label}
                href={href}
                className={`border-b-2 py-5 transition ${
                  index === 0
                    ? "border-[#0c7772] text-[#0c7772]"
                    : "border-transparent text-slate-700 hover:border-[#0c7772] hover:text-slate-950"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </section>
  );
}
