"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export default function BookingFooter() {
  const pathname = usePathname();
  const isTheatrePage = pathname === "/booking/theatre";

  return (
    <footer
      className={`border-t border-white/10 bg-[#0f1115] px-6 pt-4 ${
        isTheatrePage ? "pb-24 lg:pb-4" : "pb-4"
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm">

        {/* Brand */}
        <div className="flex items-center">
          <Image
            src="/assets/Logo-transparent.png"
            width={54}
            height={46}
            alt="Sandy Toes"
            className="h-11 w-auto object-contain"
          />
        </div>

        {/* Copyright */}
        <p className="text-center text-white/75 md:text-right">
          © 2026 Sandy Toes. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
