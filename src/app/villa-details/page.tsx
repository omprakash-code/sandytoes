import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Anchor,
  Bath,
  BedDouble,
  Car,
  ChefHat,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Fish,
  Flag,
  Flame,
  Heart,
  Images,
  MapPin,
  Palmtree,
  Plane,
  PlayCircle,
  ShieldCheck,
  Share2,
  Star,
  Users,
  Waves,
} from "lucide-react";
import Footer from "@/components/layouts/Footer";
import AmenitiesSection from "@/components/pages/villa-details/AmenitiesSection";
import BookingCard from "@/components/pages/villa-details/BookingCard";
import EditorialGallery, {
  type EditorialGalleryItem,
} from "@/components/pages/villa-details/EditorialGallery";
import VillaBookingHeader from "@/components/pages/villa-details/VillaBookingHeader";
import { BRAND } from "@/constants/brand";

export const metadata: Metadata = {
  title: `${BRAND.propertyName} | ${BRAND.name}`,
  description:
    "Explore the Sandy Toes Treasure Cay villa with 4 ensuite bedrooms, private pool, beach access, family amenities, and a direct reservation form.",
};

const images = {
  hero: "/media/booking/villa-details/hero-1.jpg",
  hero2: "/media/booking/villa-details/hero-2.jpg",
  hero3: "/media/booking/villa-details/hero-3.jpg",
  hero4: "/media/booking/villa-details/hero-4.avif",
  villa:
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1100&q=86",
  dining:
    "https://images.unsplash.com/photo-1615529162924-f8605388461d?auto=format&fit=crop&w=1000&q=86",
  pool:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=86",
  bedroom:
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=86",
  bath:
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=86",
  beach:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=88",
};

const heroStats = [
  { icon: Users, value: "14", label: "Guest Capacity" },
  { icon: BedDouble, value: "4", label: "Bedrooms" },
  { icon: Bath, value: "4+", label: "Bathrooms" },
  { icon: Waves, value: "Direct", label: "Beach Access" },
];

const editorialGallery: EditorialGalleryItem[] = [
  {
    src: images.hero,
    alt: "Exterior view of Sandy Toes villa",
    label: "Exterior arrival",
    tone: "Exterior",
    layout: "feature",
  },
  {
    src: "/media/booking/villa-details/private-pool.avif",
    alt: "Private pool at Sandy Toes",
    label: "Private pool",
    tone: "Pool",
    layout: "tall",
  },
  {
    src: "/media/booking/villa-details/bedroom-suites.avif",
    alt: "Bedroom suite at Sandy Toes",
    label: "Bedroom suites",
    tone: "Bedrooms",
    layout: "standard",
  },
  {
    src: "/media/booking/villa-details/beach-moments.avif",
    alt: "Treasure Cay beach near the villa",
    label: "Beach moments",
    tone: "Beach",
    layout: "wide",
  },
  {
    src: "/media/booking/villa-details/indoor-dining.avif",
    alt: "Indoor dining and gathering space",
    label: "Indoor dining",
    tone: "Dining",
    layout: "standard",
  },
  {
    src: "/media/booking/villa-details/Interior-lifestyle.avif",
    alt: "Interior lifestyle space at the villa",
    label: "Interior lifestyle",
    tone: "Living",
    layout: "wide",
  },
];

const policies = [
  { label: "Check-in", value: "4:00 PM" },
  { label: "Check-out", value: "10:00 AM" },
  { label: "Pets", value: "Not allowed" },
  { label: "Smoking", value: "Not allowed" },
  { label: "Events", value: "Allowed with prior notice" },
  { label: "Children", value: "Welcome" },
];

const bedrooms = [
  {
    name: "Guest Suite",
    bedding: "1 King Bed",
    image: "/media/booking/villa-details/guest-suite.avif",
    features: ["Private suite", "Attached bathroom", "Shower only"],
  },
  {
    name: "Junior (Family) Suite",
    bedding: "1 King Bed, 1 Twin Bed and 1 Crib",
    image: "/media/booking/villa-details/junior-family-suite.avif",
    features: ["Family-friendly setup", "Attached bathroom", "Bathtub"],
  },
  {
    name: "Kid's Bunk Suite",
    bedding: "2 Queen Beds and 2 Double Beds",
    image: "/media/booking/villa-details/Kid's-bunk-suite.avif",
    features: ["Bunk-style sleeping", "Attached bathroom", "Shower only"],
  },
  {
    name: "Master Bedroom Suite",
    bedding: "1 King Bed",
    image: "/media/booking/villa-details/master-bedroom-suite.avif",
    features: ["Private suite", "Attached bathroom", "Shower only"],
  },
];

const bathrooms = [
  {
    name: "Guest Suite Bathroom",
    features: ["Soap", "Towels provided", "Toilet", "Shower only", "Shampoo", "Hair dryer"],
  },
  {
    name: "Junior Suite Bathroom",
    features: ["Soap", "Towels provided", "Bathtub", "Toilet", "Shampoo", "Hair dryer"],
  },
  {
    name: "Kid's Suite Bathroom",
    features: ["Soap", "Towels provided", "Toilet", "Shower only", "Shampoo", "Hair dryer"],
  },
  {
    name: "Master Suite Bathroom",
    features: ["Soap", "Towels provided", "Toilet", "Shower only", "Shampoo", "Hair dryer"],
  },
  {
    name: "Powder Bathroom",
    features: ["Soap", "Towels provided", "Toilet"],
  },
];

const guestTestimonials = [
  {
    name: "Danielle R.",
    role: "Family stay",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
    quote:
      "The house felt private and effortless. Pool mornings, beach afternoons, and dinners outside made the whole trip feel special.",
  },
  {
    name: "Laura M.",
    role: "Group getaway",
    image:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=160&q=80",
    quote:
      "Everyone had space to unwind, but the villa still brought us together. It felt calm, polished, and beautifully easy.",
  },
  {
    name: "Michael T.",
    role: "Island escape",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
    quote:
      "Direct beach access changed everything. We barely needed to plan; the best parts of the stay were right there.",
  },
];

const nearbyAttractions = [
  { icon: MapPin, place: "Treasure Cay Beach", distance: "4 min walk" },
  { icon: Flag, place: "Treasure Cay Golf Course", distance: "13 min walk" },
  { icon: Anchor, place: "Treasure Cay Marina", distance: "3 min drive" },
  { icon: Plane, place: "Treasure Cay (TCB)", distance: "16 min drive" },
];

const nearbyActivities = [
  { icon: Waves, label: "Snorkeling" },
  { icon: Anchor, label: "Boating" },
  { icon: Palmtree, label: "Kayaking" },
  { icon: Fish, label: "Fishing" },
  { icon: Flag, label: "Golf" },
];

const gettingAround = [
  { icon: Plane, place: "Treasure Cay (TCB)", distance: "16 min drive" },
  { icon: Plane, place: "Marsh Harbour (MHH)", distance: "51 min drive" },
];

const nearbyRestaurants = [
  { place: "Conch Man", distance: "14 min walk" },
  { place: "Cafe La Florence", distance: "3 min drive" },
  { place: "Junkanoo", distance: "3 min drive" },
  { place: "Sunset Pizza", distance: "3 min drive" },
  { place: "Treasure Sands Club", distance: "4 min drive" },
];

const googleMapEmbedUrl =
  "https://www.google.com/maps?q=Luxury%204%20bedroom%20home%20on%20Ocean%20Blvd%20with%20private%20access%20to%20the%20beach%20Sleeps%2014%20Treasure%20Cay%20Abaco%20Bahamas&output=embed";

const googleDirectionsUrl =
  "https://www.google.com/maps/search/?api=1&query=Luxury%204%20bedroom%20home%20on%20Ocean%20Blvd%20with%20private%20access%20to%20the%20beach%20Sleeps%2014%20Treasure%20Cay%20Abaco%20Bahamas";

const faqs = [
  ["Is beach access private?", "Yes. Guests have private road access to Treasure Cay beach, making beach days simple and relaxed."],
  ["Is the pool heated?", "The villa includes a private pool. Heating availability can be confirmed with Sandy Toes before booking."],
  ["Is backup power available?", "Yes. A full backup generator is available for added comfort and continuity during your stay."],
  ["Is WiFi fast enough for work?", "Yes. High-speed Starlink WiFi is available for remote work, streaming, and staying connected."],
  ["Are kayaks included?", "Kayaks and paddle boards are available for guest use, subject to local conditions and safety guidance."],
  ["Is housekeeping available?", "Housekeeping can be arranged on request. Share your preferred schedule before arrival."],
];

function HeroGallery() {
  return (
    <section className="px-4 pb-5 pt-5 md:px-8 md:pt-6 lg:pb-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link href="/" className="font-medium text-[#0c7772] hover:underline">
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
              <Image
                src={images.hero}
                alt="Sandy Toes villa and beach setting"
                fill
                priority
                sizes="(min-width: 1024px) 62vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/45 to-transparent" />

              <div className="absolute left-5 top-5 bg-white/92 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur">
                Best Rated Villa
              </div>
              <div className="absolute right-5 top-5 flex gap-3">
                <button
                  type="button"
                  aria-label="Share property"
                  className="flex h-11 w-11 items-center justify-center bg-white/92 text-slate-900 shadow-md backdrop-blur transition hover:bg-white"
                >
                  <Share2 className="h-5 w-5" />
                </button>
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
                className="absolute left-5 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center bg-white/86 text-slate-950 shadow-md backdrop-blur transition hover:bg-white md:flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next image"
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
                {[0, 1, 2, 3].map((item) => (
                  <span
                    key={item}
                    className={`h-1.5 rounded-full ${
                      item === 0 ? "w-6 bg-white" : "w-1.5 bg-white/55"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 md:grid-cols-1 md:grid-rows-3">
              {[
                [images.hero2, "Private pool and lounge area"],
                [images.hero3, "Open dining and gathering space"],
                [images.hero4, "Luxury bedroom suite"],
              ].map(([src, alt], index) => (
                <button
                  key={alt}
                  type="button"
                  className="group relative min-h-[110px] overflow-hidden bg-slate-200 shadow-sm md:min-h-0"
                  aria-label={`Preview ${alt}`}
                >
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes="(min-width: 768px) 168px, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  {index === 2 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/42 text-center text-white">
                      <div>
                        <p className="text-2xl font-semibold">+17</p>
                        <p className="text-sm font-semibold">More Photos</p>
                      </div>
                    </div>
                  ) : null}
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

export default function VillaDetailsPage() {
  return (
    <>
      <VillaBookingHeader />
      <main className="bg-[#f7f5f2] text-slate-950">
        <HeroGallery />

        <section className="px-4 pb-12 md:px-8 lg:pb-16">
          <div className="mx-auto grid max-w-7xl items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0 space-y-10">
              <section id="overview">
                <div className="bg-white px-5 py-7 shadow-sm md:px-8">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0c7772]">
                          Villa Overview
                        </p>
                        <span className="hidden h-1 w-1 bg-slate-300 sm:block" />
                        <p className="flex items-center gap-2 text-sm font-medium text-slate-600">
                          <MapPin className="h-4 w-4 text-[#ea7e82]" />
                          Treasure Cay, Abaco, Bahamas
                        </p>
                      </div>
                      <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-slate-950 md:text-4xl">
                        Luxury 4 bedroom home on Ocean Blvd with private beach access.
                      </h1>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700 md:text-base">
                        A private Treasure Cay stay with a pool, full kitchen, outdoor gathering
                        spaces, and easy access to one of Abaco&apos;s most loved beaches.
                      </p>
                    </div>
                    <div className="flex w-fit shrink-0 items-center gap-2 border-l border-slate-300 bg-[#f7f5f2] px-4 py-2">
                      <Star className="h-4 w-4 fill-[#ea7e82] text-[#ea7e82]" />
                      <span className="text-sm font-semibold text-slate-950">10/10</span>
                      <span className="text-xs text-slate-500">Exceptional</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-slate-200 pt-5 text-sm sm:grid-cols-4">
                    {heroStats.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-slate-200 text-[#ea7e82]">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-lg font-semibold leading-none text-slate-950">
                              {item.value}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">{item.label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-100 pt-5">
                    {[
                      { icon: Waves, label: "Private Pool" },
                      { icon: ChefHat, label: "Full Kitchen" },
                      { icon: Check, label: "Washer & Dryer" },
                      { icon: Flame, label: "BBQ Grill" },
                      { icon: Car, label: "On-site Parking" },
                    ].map((fact) => {
                      const Icon = fact.icon;
                      return (
                        <div key={fact.label} className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-[#0c7772]" />
                          <span className="text-sm font-semibold text-slate-800">
                            {fact.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

        <AmenitiesSection />

        <section id="rooms" className="bg-white px-5 py-8 md:px-8">
          <div>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-md">
                <div className="flex items-center gap-4">
                  <span className="h-10 w-1.5 bg-[#ea7e82]" />
                  <h2 className="text-2xl font-semibold text-slate-950 md:text-[2rem]">
                    Bedrooms & Sleeping Arrangement
                  </h2>
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  4 bedrooms with flexible sleeping for up to 14 guests.
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              {bedrooms.map((room) => (
                <article
                  key={room.name}
                  className="group bg-white shadow-sm ring-1 ring-slate-100 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(6,30,31,0.10)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-200">
                    <Image
                      src={room.image}
                      alt={room.name}
                      fill
                      sizes="(min-width: 768px) 45vw, 100vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-4 text-white">
                      <h3 className="text-xl font-semibold leading-tight">
                        {room.name}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-white/88">
                        {room.bedding}
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      {room.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2 text-sm leading-5 text-slate-700">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ea7e82]" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 border-t border-slate-200 pt-7">
              <h3 className="text-xl font-semibold text-slate-950">
                4 bathrooms, 1 half bathroom
              </h3>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {bathrooms.map((bathroom) => (
                  <div key={bathroom.name} className="border-l-2 border-[#0c7772]/35 bg-[#f7f5f2] px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                      <Bath className="h-4 w-4 text-[#0c7772]" />
                      {bathroom.name}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {bathroom.features.join(" · ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <EditorialGallery items={editorialGallery} />

        <section id="reviews" className="bg-[#04283c] px-5 py-9 text-white shadow-sm md:px-8">
          <div>
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex items-center gap-4">
                  <span className="h-10 w-1.5 bg-[#ea7e82]" />
                  <h2 className="text-2xl font-semibold text-white md:text-[2rem]">
                    Why Guests Love Staying Here
                  </h2>
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72">
                  Short guest notes that capture the stay: private, relaxed, and easy to enjoy.
                </p>
              </div>
              <div className="inline-flex w-fit items-center gap-2 bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15">
                <ShieldCheck className="h-4 w-4 text-[#89d6d0]" />
                VRBO verified style reviews
              </div>
            </div>

            <div className="-mx-5 mt-7 flex snap-x gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
              {guestTestimonials.map((review) => (
                <article
                  key={review.name}
                  className="min-w-[82%] snap-start border-l-2 border-[#ea7e82] bg-white/10 p-5 ring-1 ring-white/10 transition duration-300 hover:bg-white/14 sm:min-w-[58%] md:min-w-0"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={review.image}
                      alt={review.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-white/20"
                    />
                    <div>
                      <p className="font-semibold text-white">{review.name}</p>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                        {review.role}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 flex gap-1 text-[#ea7e82]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-white/82">
                    &ldquo;{review.quote}&rdquo;
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="location" className="bg-[#f4eadc] px-5 py-9 shadow-sm md:px-8">
          <div className="flex items-center gap-4">
            <span className="h-10 w-1.5 bg-[#ea7e82]" />
            <h2 className="text-2xl font-semibold text-slate-950 md:text-[2rem]">
              Explore The Area
            </h2>
          </div>

          <div className="mt-7">
            <div className="overflow-hidden bg-white shadow-sm ring-1 ring-black/5">
              <iframe
                title="Sandy Toes location on Google Maps"
                src={googleMapEmbedUrl}
                className="h-[320px] w-full border-0 md:h-[440px]"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="border-t border-slate-200 px-5 py-4">
                <p className="text-lg font-semibold text-slate-950">
                  Treasure Cay, Abaco
                </p>
                <Link
                  href={googleDirectionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 underline underline-offset-4"
                >
                  View in a map
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-300/70 pt-7">
            <h3 className="text-xl font-semibold text-slate-950">About the area</h3>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Located in Treasure Cay, this vacation home is near the beach.
              Treasure Cay Golf Course and Treasure Cay Marina are close by for
              easy island days, while Treasure Cay Beach and nearby bays offer
              natural beauty, boating, kayaking, fishing, and snorkeling.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {nearbyActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <span
                    key={activity.label}
                    className="inline-flex items-center gap-2 bg-white/78 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm"
                  >
                    <Icon className="h-4 w-4 text-[#0c7772]" />
                    {activity.label}
                  </span>
                );
              })}
            </div>

            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <div className="bg-white px-5 py-5 shadow-sm">
                <div className="flex items-center gap-3 text-base font-semibold text-slate-950">
                  <MapPin className="h-5 w-5 text-[#0c7772]" />
                  What&apos;s nearby
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    ...nearbyAttractions,
                    { icon: Waves, place: "Marsh Harbour", distance: "46 min drive" },
                    { icon: Waves, place: "Abaco Beach", distance: "49 min drive" },
                  ].map((item) => (
                    <div key={item.place} className="flex justify-between gap-4 text-sm text-slate-700">
                      <span>{item.place}</span>
                      <span className="shrink-0 font-semibold text-slate-500">{item.distance}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white px-5 py-5 shadow-sm">
                  <div className="flex items-center gap-3 text-base font-semibold text-slate-950">
                    <Plane className="h-5 w-5 text-[#0c7772]" />
                    Getting around
                  </div>
                  <div className="mt-4 space-y-3">
                    {gettingAround.map((item) => (
                      <div key={item.place} className="flex justify-between gap-4 text-sm text-slate-700">
                        <span>{item.place}</span>
                        <span className="shrink-0 font-semibold text-slate-500">{item.distance}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white px-5 py-5 shadow-sm">
                  <div className="flex items-center gap-3 text-base font-semibold text-slate-950">
                    <ChefHat className="h-5 w-5 text-[#0c7772]" />
                    Restaurants
                  </div>
                  <div className="mt-4 space-y-3">
                    {nearbyRestaurants.map((item) => (
                      <div key={item.place} className="flex justify-between gap-4 text-sm text-slate-700">
                        <span>{item.place}</span>
                        <span className="shrink-0 font-semibold text-slate-500">{item.distance}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="rules" className="bg-white px-5 py-9 shadow-sm md:px-8">
          <div>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex items-center gap-4">
                  <span className="h-10 w-1.5 bg-[#ea7e82]" />
                  <h2 className="text-2xl font-semibold text-slate-950 md:text-[2rem]">
                    FAQ
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Quick answers to the practical details guests usually confirm before booking.
                </p>
              </div>

              <div className="grid w-full gap-2 text-sm sm:w-[400px] sm:shrink-0 sm:grid-cols-2">
                {policies.slice(0, 2).map((policy) => (
                  <div
                    key={policy.label}
                    className="flex justify-between gap-5 bg-[#f7f5f2] px-4 py-3"
                  >
                    <span className="font-medium text-slate-600">{policy.label}</span>
                    <span className="font-semibold text-slate-950">{policy.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7 divide-y divide-slate-200 border-y border-slate-200">
              {faqs.map(([question, answer]) => (
                <details key={question} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-base font-semibold text-slate-950 transition hover:text-[#0c7772]">
                    <span>{question}</span>
                    <span className="relative h-8 w-8 shrink-0 bg-[#f7f5f2] text-[#0c7772]">
                      <span className="absolute left-2 top-1/2 h-px w-4 bg-current transition" />
                      <span className="absolute left-1/2 top-2 h-4 w-px bg-current transition group-open:rotate-90 group-open:opacity-0" />
                    </span>
                  </summary>
                  <div className="grid grid-rows-[0fr] transition-all duration-300 ease-out group-open:grid-rows-[1fr]">
                    <div className="overflow-hidden">
                      <p className="max-w-3xl pb-5 text-sm leading-7 text-slate-600">
                        {answer}
                      </p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

            </div>

            <aside id="booking" className="order-first self-start lg:sticky lg:top-7 lg:order-none">
              <BookingCard compact />
            </aside>
          </div>
        </section>

        <section
          id="reserve"
          className="relative min-h-[520px] overflow-hidden bg-slate-950 bg-cover bg-center bg-fixed px-4 py-20 text-white md:px-8"
          style={{ backgroundImage: `url(${images.hero})` }}
        >
          <div className="absolute inset-0 bg-slate-950/62" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-slate-950/35" />
          <div className="relative mx-auto flex min-h-[360px] max-w-7xl flex-col justify-end">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#89d6d0]">
              Ready To Reserve
            </p>
            <h2 className="mt-4 max-w-4xl text-5xl font-semibold leading-[0.98] md:text-7xl">
              Your Private Escape In Treasure Cay Awaits
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 md:text-lg">
              Step into quiet mornings by the pool, beach days just moments
              away, and evenings made for gathering under the island sky.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#booking"
                className="inline-flex h-14 items-center justify-center rounded-full bg-[#ea7e82] px-8 text-sm font-semibold text-white shadow-[0_20px_42px_rgba(234,126,130,0.34)] transition hover:-translate-y-0.5 hover:bg-[#d86f73]"
              >
                Reserve Your Stay
              </Link>
              <Link
                href="#gallery"
                className="inline-flex h-14 items-center justify-center rounded-full bg-white/12 px-8 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/18"
              >
                View Full Gallery
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
