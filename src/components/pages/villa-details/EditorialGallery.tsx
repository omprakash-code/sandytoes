"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";

export type EditorialGalleryItem = {
  src: string;
  alt: string;
  label: string;
  tone: string;
  layout: "feature" | "tall" | "wide" | "standard";
};

type EditorialGalleryProps = {
  items: EditorialGalleryItem[];
};

const layoutClasses = {
  feature: "min-h-[360px] md:col-span-2 md:row-span-2 md:min-h-0",
  tall: "min-h-[360px] md:row-span-2 md:min-h-0",
  wide: "min-h-[260px] md:col-span-2 md:min-h-0",
  standard: "min-h-[260px] md:min-h-0",
};

export default function EditorialGallery({ items }: EditorialGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeItem = activeIndex === null ? null : items[activeIndex];
  const currentIndex = activeIndex ?? 0;

  useEffect(() => {
    if (activeIndex === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") {
        setActiveIndex((current) =>
          current === null ? current : (current + 1) % items.length,
        );
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) =>
          current === null ? current : (current - 1 + items.length) % items.length,
        );
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, items.length]);

  return (
    <>
      <section id="gallery" className="bg-white px-5 py-8 shadow-sm md:px-8">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <span className="h-10 w-1.5 bg-[#ea7e82]" />
              <h2 className="text-2xl font-semibold text-slate-950 md:text-[2rem]">
                Gallery
              </h2>
            </div>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
              A closer look at the villa, pool, bedrooms, beach, and outdoor living spaces.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveIndex(0)}
            className="inline-flex h-11 w-fit items-center gap-2 bg-[#0c7772] px-4 text-sm font-semibold text-white transition hover:bg-[#09615d]"
          >
            <Images className="h-4 w-4" />
            View All Photos
          </button>
        </div>

        <div className="grid gap-3 md:auto-rows-[190px] md:grid-cols-3">
          {items.map((item, index) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`group relative overflow-hidden bg-slate-200 text-left shadow-sm transition duration-500 hover:shadow-[0_18px_42px_rgba(6,30,31,0.12)] ${layoutClasses[item.layout]}`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-80 transition group-hover:opacity-95" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  {item.tone}
                </p>
                <p className="mt-1 text-xl font-semibold">{item.label}</p>
              </div>
              <span className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center bg-white/90 text-slate-950 opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100">
                <Images className="h-4 w-4" />
              </span>
            </button>
          ))}
        </div>
      </section>

      {activeItem ? (
        <div
          className="fixed inset-0 z-[90] bg-slate-950/88 p-4 backdrop-blur-sm"
          onClick={() => setActiveIndex(null)}
        >
          <div className="mx-auto flex h-full max-w-6xl flex-col justify-center">
            <div className="mb-4 flex items-center justify-between gap-4 text-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
                  {activeItem.tone}
                </p>
                <h3 className="mt-1 text-2xl font-semibold">{activeItem.label}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/18"
                aria-label="Close gallery preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              className="relative min-h-[70vh] overflow-hidden rounded-3xl bg-slate-900 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={activeItem.src}
                alt={activeItem.alt}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((currentIndex - 1 + items.length) % items.length)
                }
                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-950 shadow-lg transition hover:bg-white"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((currentIndex + 1) % items.length)}
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-950 shadow-lg transition hover:bg-white"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
