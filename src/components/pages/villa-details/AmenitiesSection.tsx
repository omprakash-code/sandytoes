"use client";

import { useState } from "react";
import {
  Bath,
  Car,
  ChefHat,
  Check,
  Flame,
  Home,
  Palmtree,
  ShieldCheck,
  ShowerHead,
  Snowflake,
  Sofa,
  Tv,
  Waves,
  Wifi,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

const previewAmenities = [
  { icon: Palmtree, label: "Direct Beach Access" },
  { icon: Waves, label: "Private Pool" },
  { icon: Wifi, label: "Free Wi-Fi" },
  { icon: Zap, label: "Backup Generator" },
  { icon: ChefHat, label: "Full Kitchen" },
  { icon: Flame, label: "BBQ Grill" },
  { icon: Home, label: "Outdoor Kitchen" },
  { icon: Check, label: "Washer & Dryer" },
  { icon: Snowflake, label: "Air Conditioning" },
  { icon: Sofa, label: "Outdoor Lounge" },
  { icon: Waves, label: "Kayaks & Paddle Board" },
];

const modalGroups = [
  {
    title: "Beach & Outdoor Living",
    items: [
      { icon: Palmtree, label: "Direct Beach Access" },
      { icon: Waves, label: "Private Pool" },
      { icon: Waves, label: "Kayaks & Paddle Board" },
      { icon: Sofa, label: "Outdoor Lounge" },
      { icon: Flame, label: "Fire Pit" },
      { icon: Home, label: "Balcony" },
      { icon: Home, label: "Deck / Patio" },
      { icon: Palmtree, label: "Garden" },
    ],
  },
  {
    title: "Kitchen & Dining",
    items: [
      { icon: ChefHat, label: "Full Kitchen" },
      { icon: Home, label: "Outdoor Kitchen" },
      { icon: Flame, label: "BBQ Grill" },
      { icon: Check, label: "Dining Table" },
      { icon: Check, label: "Coffee Maker" },
      { icon: Check, label: "Dishwasher" },
      { icon: Check, label: "Refrigerator & Oven" },
      { icon: Check, label: "Microwave & Toaster" },
    ],
  },
  {
    title: "Comfort & Family",
    items: [
      { icon: Snowflake, label: "Air Conditioning" },
      { icon: Check, label: "Washer & Dryer" },
      { icon: ShowerHead, label: "Towels & Linens" },
      { icon: Bath, label: "Bath Essentials" },
      { icon: Home, label: "Crib" },
      { icon: Tv, label: "Smart TV" },
      { icon: Sofa, label: "Books & Lounge Seating" },
    ],
  },
  {
    title: "Connectivity & Safety",
    items: [
      { icon: Wifi, label: "Free Wi-Fi" },
      { icon: Zap, label: "Backup Generator" },
      { icon: Car, label: "On-site Parking" },
      { icon: ShieldCheck, label: "Smoke Detector" },
      { icon: ShieldCheck, label: "Carbon Monoxide Detector" },
      { icon: ShieldCheck, label: "Fire Extinguisher" },
      { icon: ShieldCheck, label: "First Aid Kit" },
      { icon: ShieldCheck, label: "Deadbolt Lock" },
    ],
  },
];

const hiddenAmenitiesCount =
  new Set(modalGroups.flatMap((group) => group.items.map((item) => item.label))).size -
  new Set(previewAmenities.map((item) => item.label)).size;

function AmenityIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-slate-200 bg-white text-slate-900">
      <Icon className="h-4 w-4 stroke-[1.6]" />
    </span>
  );
}

export default function AmenitiesSection() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section id="amenities" className="bg-white px-5 py-8 md:px-8">
        <div className="flex items-center gap-4">
          <span className="h-10 w-1.5 bg-[#ea7e82]" />
          <h2 className="text-2xl font-semibold text-slate-950 md:text-[2rem]">
            Villa Amenities
          </h2>
        </div>

        <div className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
          {previewAmenities.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <AmenityIcon icon={Icon} />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="self-center text-left text-sm font-semibold text-blue-600 underline underline-offset-4 transition hover:text-blue-700"
          >
            +{hiddenAmenitiesCount} more
          </button>
        </div>
      </section>

      {open ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[86vh] w-full max-w-4xl overflow-y-auto bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <h3 className="text-xl font-semibold text-slate-950">Villa Amenities</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center text-slate-800 transition hover:bg-slate-100"
                aria-label="Close amenities"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-8 px-6 py-6">
              {modalGroups.map((group, index) => (
                <section
                  key={group.title}
                  className={index === 0 ? "" : "border-t border-slate-200 pt-6"}
                >
                  <h4 className="text-base font-semibold text-slate-950">{group.title}</h4>
                  <div className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={`${group.title}-${item.label}`} className="flex items-center gap-3">
                          <AmenityIcon icon={Icon} />
                          <p className="text-sm font-medium text-slate-900">
                            {item.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
