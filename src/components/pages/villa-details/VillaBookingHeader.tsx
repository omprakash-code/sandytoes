"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Phone } from "lucide-react";
import { BRAND } from "@/constants/brand";

const navItems = [
  { label: "Home", href: "/villa-details" },
  { label: "About Us", href: "/villa-details#overview" },
  { label: "Villa Details", href: "/villa-details" },
  { label: "Gallery", href: "/villa-details#gallery" },
  { label: "Contact Us", href: "/villa-details#booking" },
];

type VillaBookingHeaderProps = {
  active?: "villa" | "checkout";
  ctaLabel?: string;
  ctaHref?: string;
};

export default function VillaBookingHeader({
  active = "villa",
  ctaLabel = "Reserve Now",
  ctaHref = "/villa-details#booking",
}: VillaBookingHeaderProps) {
  return (
    <header className="relative z-50 border-b border-slate-100 bg-white px-4 py-3 md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link
          href="/villa-details"
          className="flex h-[92px] w-[156px] shrink-0 items-center justify-center md:h-[104px] md:w-[180px]"
          aria-label={`${BRAND.name} home`}
        >
          <Image
            src={BRAND.logoPath}
            alt={BRAND.name}
            width={180}
            height={110}
            className="h-[86px] w-auto object-contain md:h-[98px]"
            priority
          />
        </Link>

        <nav className="hidden items-center rounded-full border border-slate-200 bg-transparent px-2 py-2 md:flex">
          {navItems.map((item) => {
            const isActive =
              active === "villa" && item.href === "/villa-details";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-5 py-3 font-serif text-lg leading-none transition ${
                  isActive
                    ? "bg-[#0c7772] text-white"
                    : "text-slate-700 hover:bg-[#f7f5f2] hover:text-[#0c7772]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={ctaHref}
            className="hidden h-14 items-center justify-center rounded-full bg-[#ea7e82] px-8 text-base font-semibold text-white transition hover:bg-[#d86f73] md:inline-flex"
          >
            {ctaLabel}
          </Link>
          <a
            href={`tel:${BRAND.phoneHref}`}
            className="hidden h-12 w-12 items-center justify-center rounded-full bg-white text-[#0c7772] ring-1 ring-slate-200 transition hover:text-[#ea7e82] lg:flex"
            aria-label={`Call ${BRAND.name}`}
          >
            <Phone className="h-5 w-5" />
          </a>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-800 ring-1 ring-slate-200 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
