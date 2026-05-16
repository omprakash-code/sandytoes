"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import BookingHeaderControls from "./BookingHeaderControls";

type BookingHeaderProps = {
  readOnly?: boolean;
};

export default function BookingHeader({ readOnly = false }: BookingHeaderProps) {
  const router = useRouter();

  return (
    <header className="w-full bg-white border-b border-gray-300 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-2 flex items-center justify-between">

        {/* Logo */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Image
            src="/assets/Logo-transparent.png"
            width={58}
            height={50}
            alt="Sandy Toes"
            className="h-12 w-auto object-contain"
          />
        </button>

        <Suspense fallback={null}>
          <BookingHeaderControls readOnly={readOnly} />
        </Suspense>
      </div>
    </header>
  );
}
