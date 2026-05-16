import Link from "next/link";
import { Home, Search } from "lucide-react";
import { BRAND } from "@/constants/brand";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#f8fbf9] px-4 py-8 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center justify-center">
        <section className="w-full rounded-lg border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:px-10 md:py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#0c7772]">
            Page Not Found
          </p>
          <h1 className="mt-5 font-[var(--font-playfair)] text-5xl leading-none text-slate-950 md:text-7xl">
            404
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600">
            This page is not available, but your {BRAND.propertyName} stay is
            still just a few clicks away.
          </p>

          <div className="mx-auto mt-8 grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/villa-details"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#ea7e82] px-5 text-sm font-semibold text-white transition hover:bg-[#d86f73]"
            >
              <Search className="h-4 w-4" />
              Villa Details
            </Link>

            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
            >
              <Home className="h-4 w-4" />
              Back Home
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
