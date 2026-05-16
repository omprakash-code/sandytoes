"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  MapPin,
  Users,
  User,
  Utensils,
  Gift,
  Cake,
  Heart,
  Monitor,
  Wand2,
  ShieldCheck,
  Balloon,
  Play,
} from "@/components/icons";
import SlotList from "./SlotList";
import { useBooking } from "@/context/BookingContext";
import type { Theatre } from "@/types/theatre";
import { formatSlotTime } from "@/lib/formatters";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import { toast } from "sonner";
import PremiumActionButton from "@/components/ui/PremiumActionButton";
import MobileStickyAction from "@/components/booking/global/MobileStickyAction";
import { resolveTheatreCardContent } from "@/lib/theatre-card-content";
import { trackMetaCtaClick } from "@/lib/meta/browser";


/* -----------------------------
 UI Types
------------------------------ */

type UISlot = {
  id: string;
  time: string;
  date?: string;
  isBooked: boolean;   // BOOKED / DISABLED
  isLocked: boolean;   // LOCKED but not expired
  isLockedByMe?: boolean;
  lockRemainingSec?: number;
  isSpecial?: boolean;
  specialText?: string;
  basePrice: number;
  decorationMandatory: boolean;

};


/* -----------------------------
 Props
------------------------------ */

type Props = {
  theatre: Theatre;
  onNextDayClick?: () => void;
  nextDayCount?: number;
  hasNextDay?: boolean;
  changingDate?: boolean;
};

/* -----------------------------
 Component
------------------------------ */

export default function TheatreCard({
  theatre,
  onNextDayClick,
  nextDayCount = 0,
  hasNextDay = false,
  changingDate = false,
}: Props) {
  const { booking, setTheatreAndSlot, setBookingId, setSlotLockExpiresAt } = useBooking();
  const router = useRouter();
  const [locking, setLocking] = useState(false);
  const [isReserveShaking, setIsReserveShaking] = useState(false);


  const media = theatre.images ?? [];

  const selectedSlotId =
    booking.theatre?.id === theatre.id
      ? booking.slot?.id ?? null
      : null;

  const canContinue = Boolean(selectedSlotId);
  const locationName = booking.location?.name ?? "Selected location";

  function triggerSlotSelectionFeedback() {
    toast.warning("Please select an available time to continue.", {
      id: "slot-selection-required",
    });
    setIsReserveShaking(false);
    window.requestAnimationFrame(() => {
      setIsReserveShaking(true);
    });
  }

  useEffect(() => {
    if (canContinue) {
      setIsReserveShaking(false);
    }
  }, [canContinue]);

  useEffect(() => {
    if (!isReserveShaking) return;
    const timeoutId = window.setTimeout(() => {
      setIsReserveShaking(false);
    }, 360);
    return () => window.clearTimeout(timeoutId);
  }, [isReserveShaking]);

  /* -----------------------------
    Lock slot + continue
  ------------------------------ */

  async function handleContinue() {
    if (locking) return;
    if (!canContinue || !booking.slot || !booking.date) {
      triggerSlotSelectionFeedback();
      return;
    }

    setLocking(true);
    trackMetaCtaClick({
      ctaName: "Reserve This Stay",
      ctaLocation: "Villa Card",
      destination: "/booking/contact",
    });

    try {
      const res = await fetch("/api/bookings/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: booking.slot.id,
          theatreId: theatre.id,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success || !json.data?.bookingId) {
        const code = json?.code as string | undefined;

        if (code === "LOCK_IN_USE") {
          toast.error("This time is currently reserved.");
        } else if (
          code === "RESERVATION_EXPIRED" ||
          code === "SLOT_NOT_AVAILABLE"
        ) {
          toast.error("Reservation expired, please try again.");
        } else {
          toast.error(json.message || "Time not available");
        }

        router.refresh();
        return;
      }

      setBookingId(json.data.bookingId);
      setSlotLockExpiresAt(
        typeof json.data.lockExpiresAt === "string"
          ? json.data.lockExpiresAt
          : null
      );
      router.push("/booking/contact");

    } catch (error) {
      toast.error((error as Error)?.message || "Something went wrong. Please try again.");
    } finally {
      setLocking(false);
    }
  }

//   console.log("Booking slot on theatre page:", booking.slot);
//   console.log("Selection Debug:", {
//   bookingTheatre: booking.theatre?.id,
//   cardTheatre: theatre.id,
//   bookingSlot: booking.slot?.id,
// });

  /* -----------------------------
    Slots → UI mapping
  ------------------------------ */

  const uiSlots: UISlot[] = theatre.slots.map((slot) => {
    const isExpired = slot.isExpired === true;

    const isBooked =
      slot.status === "BOOKED" ||
      slot.status === "DISABLED" ||
      isExpired; // past slots look BOOKED

    const isLocked =
      slot.status === "LOCKED" && !isExpired;

    const isLockedByMe =
      isLocked && slot.isLockedByMe === true;

    return {
      id: slot.id,
      time: formatSlotTime(slot.startTime, slot.endTime),

      isBooked,          // includes expired
      isLocked,
      isLockedByMe,

      lockRemainingSec:
        isLocked && typeof slot.lockRemainingSec === "number"
          ? slot.lockRemainingSec
          : undefined,

      isSpecial: slot.isSpecial,
      specialText: slot.discountText ?? undefined,
      basePrice: slot.finalPrice ?? slot.basePrice,
      decorationMandatory: Boolean(slot.decorationMandatory),
    };
  });

  /* -----------------------------
    Price display (CRITICAL FIX)
  ------------------------------ */

  const isSelectableSlot = (slot: UISlot) =>
    !slot.isBooked && (!slot.isLocked || slot.isLockedByMe);

  const hasAvailableSlot = uiSlots.some(isSelectableSlot);
  const availableSlotCount = uiSlots.filter(isSelectableSlot).length;
  const slotBadgeTone =
    availableSlotCount === 0
      ? "none"
      : availableSlotCount <= 2
        ? "low"
        : "good";
  const slotBadgeClass =
    slotBadgeTone === "good"
      ? "border-green-200 bg-green-50 text-green-700"
      : slotBadgeTone === "low"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-gray-200 bg-gray-100 text-gray-500";
  const slotBadgeText =
    slotBadgeTone === "none"
      ? "No Time Available"
      : `${availableSlotCount} Times Available`;
  const cardContent = resolveTheatreCardContent(theatre.cardContent, {
    capacity: theatre.capacity,
    decorationPrice: theatre.decorationPrice,
    baseGuests: theatre.baseGuests,
    extraPersonPrice: theatre.extraPersonPrice,
    location: locationName,
  });
  const nextStepItems = [
    {
      key: "details",
      icon: <User size={12} />,
      text: cardContent.nextStep.addDetails.text,
    },
    {
      key: "cake",
      icon: <Cake size={12} />,
      text: cardContent.nextStep.addCake.text,
    },
    {
      key: "fog",
      icon: <Wand2 size={12} />,
      text: cardContent.nextStep.fogEntry.text,
    },
    {
      key: "gifts",
      icon: <Gift size={12} />,
      text: cardContent.nextStep.gifts.text,
    },
  ].filter((step) => step.text.trim().length > 0);
  const idealForTitle = cardContent.idealFor.title.trim();
  const idealForLinePrimary = cardContent.idealFor.linePrimary.trim();
  const idealForLineSecondary = cardContent.idealFor.lineSecondary.trim();
  const hasIdealFor =
    cardContent.idealFor.enabled &&
    (idealForTitle.length > 0 ||
      idealForLinePrimary.length > 0 ||
      idealForLineSecondary.length > 0);
  const idealForTooltip = [
    idealForTitle,
    idealForLinePrimary,
    idealForLineSecondary,
  ]
    .filter((item) => item.length > 0)
    .join(" ");

  const displayPrice = (() => {
    // If selected slot belongs to THIS theatre → show it
    if (
      booking.theatre?.id === theatre.id &&
      booking.slot?.basePrice
    ) {
      return booking.slot.basePrice;
    }

    // Otherwise → show this theatre's first available slot price
    const firstAvailableSlot = uiSlots.find(isSelectableSlot);

    return firstAvailableSlot?.basePrice ?? null;
  })();

  const capacityMessage =
    theatre.footerMessage?.trim() ||
    `For up to ${theatre.baseGuests} Person`;



  /* -----------------------------
    Render
  ------------------------------ */

  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-lg sm:rounded-2xl sm:shadow-xl">
      {/* Image / Video Slider */}
      {media.length > 0 ? (
        <div className="booking-theatre-carousel relative h-[200px] sm:h-[230px] lg:h-[260px]">
          <div className="pointer-events-none absolute left-2 top-2 z-10 flex gap-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
              <Monitor size={11} />
              150&quot; HD
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
              <SpeakerIcon className="h-3 w-3" />
              600W Sony
            </span>
          </div>

          {theatre.youtubeVideoUrl && (
            <a
              href={theatre.youtubeVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Watch ${theatre.name} video on YouTube`}
              className="group absolute bottom-2 left-2 z-10 inline-flex items-center overflow-hidden rounded-full border border-white/25 bg-black/42 shadow-[0_8px_18px_rgba(0,0,0,0.2)] backdrop-blur-sm transition duration-200 hover:border-white/45 hover:bg-black/56 focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16),rgba(255,255,255,0.02)_45%,rgba(239,68,68,0.14))] opacity-85 transition duration-200 group-hover:opacity-100" />
              <span className="relative flex items-center gap-1.5 px-1.5 py-1.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-black-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                  <Play size={12} className="ml-0.5 fill-current" />
                </span>
                <span className="flex flex-col pr-0.5 text-white">
                  <span className="text-[10px] font-semibold leading-none">
                    Watch Video
                  </span>
                </span>
              </span>
            </a>
          )}

          <Splide
            options={{
              type: "loop",
              perPage: 1,
              arrows: media.length > 1,
              pagination: media.length > 1,
              drag: media.length > 1,
              autoplay: media.length > 1,
              interval: 3200,
              pauseOnHover: true,
              pauseOnFocus: true,
              height: "100%",
            }}
          >
            {media
              .filter(
                (item): item is { url: string; type: "image" | "video" } =>
                  typeof item?.url === "string" &&
                  typeof item?.type === "string" &&
                  item.url.trim().length > 0
              )
              .map((item, index) => (
                <SplideSlide
                  key={`${item.url}-${index}`}
                  className="h-full"
                >
                  <div className="relative w-full h-full">
                    {item.type === "video" ? (
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        controls
                        playsInline
                        muted
                      />
                    ) : (
                      <Image
                        src={item.url}
                        alt={`${theatre.name} media ${index + 1}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 820px"
                        className="object-cover"
                        priority={index === 0}
                      />
                    )}
                  </div>
                </SplideSlide>
              ))}
          </Splide>
        </div>
      ) : (
        <div className="flex h-[200px] items-center justify-center bg-slate-100 text-sm text-slate-400 sm:h-[230px] lg:h-[260px]">
          No images available
        </div>
      )}


      {/* Content */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-3.5 lg:p-4">
        {/* Title */}
        <div className="mb-0.5 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-xl font-bold text-black sm:text-2xl">
                {theatre.name}
              </h3>
              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[12px] font-semibold sm:px-2 sm:text-[11px] ${slotBadgeClass}`}
              >
                {slotBadgeTone !== "none" && (
                  <span className="relative flex h-2 w-2">
                    <span
                      className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${slotBadgeTone === "good" ? "bg-green-400" : "bg-red-400"
                        }`}
                    />
                    <span
                      className={`relative inline-flex h-2 w-2 rounded-full ${slotBadgeTone === "good" ? "bg-green-500" : "bg-red-500"
                        }`}
                    />
                  </span>
                )}
                <span className="truncate">{slotBadgeText}</span>
              </span>
            </div>
            <div className="mt-0.5 text-[10px] text-gray-500 sm:text-[12px]">
              <span className="inline-flex items-center gap-1">
                <MapPin size={13} />
                {locationName}
              </span>
            </div>
          </div>

          <div className="flex gap-1.5 sm:gap-2">
            {/* Map Button */}
            {theatre.mapUrl && (
              <a
                href={theatre.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-0.5 text-gray-700 transition-colors hover:text-black"
              >
                <div className="flex h-7 w-7 items-center justify-center transition-all duration-200 group-hover:scale-105 sm:h-8 sm:w-8">
                  <Image
                    src="/assets/location.png"
                    alt="Map"
                    width={24}
                    height={24}
                  />
                </div>
                <span className="text-[9px] font-medium sm:text-[10px]">Map</span>
              </a>
            )}

            {/* Menu Button */}
            {theatre.menuFile && (
              <a
                href={theatre.menuFile}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-0.5 text-gray-700 transition-colors hover:text-black"
              >
                <div className="flex h-7 w-7 items-center justify-center transition-all duration-200 group-hover:scale-105 sm:h-8 sm:w-8">
                  <Image
                    src="/assets/svg/Menu.svg"
                    alt="Menu"
                    width={24}
                    height={24}
                  />
                </div>
                <span className="text-[9px] font-medium sm:text-[10px]">Menu</span>
              </a>
            )}
          </div>
        </div>

        {/* Compact Info */}
        <div className="mb-2 mt-2 space-y-1 text-[10px] text-gray-600 sm:mb-1 sm:text-[12px]">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {cardContent.capacity.enabled && cardContent.capacity.text.trim().length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Users size={13} />
                {cardContent.capacity.text}
              </span>
            )}
            {cardContent.food.enabled &&
              cardContent.food.text.trim().length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Utensils size={13} />
                {cardContent.food.text}
              </span>
            )}
            {cardContent.decor.enabled && cardContent.decor.text.trim().length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Balloon size={13} />
                {cardContent.decor.text}
              </span>
            )}
            {cardContent.freeCancellation.enabled &&
              cardContent.freeCancellation.text.trim().length > 0 && (
              <span className="inline-flex items-center gap-1">
                <ShieldCheck size={13} />
                {cardContent.freeCancellation.text}
              </span>
            )}
            {hasIdealFor && (
              <div
                aria-label={idealForTooltip || "Ideal for"}
                className="group relative inline-flex min-w-0 cursor-help items-center gap-1"
              >
                {idealForTitle.length > 0 && <span className="truncate">{idealForTitle}</span>}
                {idealForLinePrimary.length > 0 && (
                  <>
                    <Heart size={12} className="shrink-0 text-gray-500" />
                    <span className="truncate">{idealForLinePrimary}</span>
                  </>
                )}
                {idealForLineSecondary.length > 0 && (
                  <>
                    <Users size={12} className="shrink-0 text-gray-500" />
                    <span className="truncate">{idealForLineSecondary}</span>
                  </>
                )}
                {idealForTooltip.length > 0 && (
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-0.5 text-[9px] text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                    {idealForTooltip}
                  </span>
                )}
              </div>
            )}
          </div>

          {cardContent.nextStep.enabled && nextStepItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-gray-500">
              {cardContent.nextStep.title.trim().length > 0 && (
                <span className="font-medium text-gray-600">{cardContent.nextStep.title}</span>
              )}
              {nextStepItems.map((step, index) => (
                <div key={step.key} className="contents">
                  {index > 0 && <span aria-hidden="true">&gt;</span>}
                  <span className="inline-flex items-center gap-1">
                    {step.icon}
                    {step.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Slots */}
        <div className="mb-3 mt-1.5 border-t border-gray-200 pt-2 sm:mb-4 sm:mt-1 sm:pt-2 lg:mb-3">
          <div className="mb-1.5">
            <p className="text-[12px] text-gray-500 sm:text-[14px] font-semibold">
              Choose Your Stay Time
            </p>
          </div>

          <SlotList
            slots={uiSlots}
            selectedSlotId={selectedSlotId}
            onNextDayClick={onNextDayClick}
            nextDayCount={nextDayCount}
            hasNextDay={hasNextDay}
            changingDate={changingDate}
            onSelect={(slot) => {
              setTheatreAndSlot({
                id: theatre.id,
                name: theatre.name,
                capacity: theatre.capacity,
                basePrice: slot.basePrice,
                baseGuests: theatre.baseGuests,
                extraPersonPrice: theatre.extraPersonPrice,
                kidPrice: theatre.kidPrice,
                decorationPrice: theatre.decorationPrice,
              }, {
                id: slot.id,
                time: slot.time,
                basePrice: slot.basePrice,
                decorationMandatory: slot.decorationMandatory,
              });
            }}
          />
        </div>

        {/* Price + CTA */}
        <div
          className="mt-auto flex items-end justify-between gap-2 border-t border-gray-100 pt-2 sm:gap-3 sm:pt-2.5"
        >

          {/* Price / Availability */}
          {hasAvailableSlot && displayPrice ? (
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold leading-none text-black sm:text-2xl">
                ₹{displayPrice.toLocaleString()}
              </p>
              <p className="mt-0.5 line-clamp-1 text-[10px] leading-tight text-gray-500 sm:text-xs md:line-clamp-none md:text-sm">
                {capacityMessage}
              </p>
            </div>
          ) : (
            <p className="min-w-0 flex-1 text-[11px] leading-tight text-gray-500 sm:text-xs">
              No times available for this villa
            </p>
          )}

          <div className="hidden shrink-0 flex-col items-end lg:flex">
            <PremiumActionButton
              label={locking ? "Reserving..." : "Reserve This Stay"}
              onClick={handleContinue}
              disabled={locking}
              showArrow
              className={`reserve-slot-btn min-w-[120px] sm:min-w-[148px] ${
                isReserveShaking ? "is-shaking" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {canContinue && (
        <MobileStickyAction
          key={`slot-${selectedSlotId}`}
          label={locking ? "Reserving..." : "Reserve This Stay"}
          onClick={handleContinue}
          disabled={locking}
          totalPrice={displayPrice ?? booking.pricing?.total ?? null}
          advancePay={booking.pricing?.advancePay ?? null}
        />
      )}

      <style jsx>{`
        .reserve-slot-btn.is-shaking {
          animation: reserveSlotShake 0.35s ease-in-out;
        }

        @keyframes reserveSlotShake {
          0%,
          100% {
            transform: translateX(0);
          }
          20% {
            transform: translateX(-4px);
          }
          40% {
            transform: translateX(4px);
          }
          60% {
            transform: translateX(-3px);
          }
          80% {
            transform: translateX(3px);
          }
        }
      `}</style>
    </div>
  );
}

function SpeakerIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3 10h4l5-4v12l-5-4H3v-4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 9.5a3.5 3.5 0 010 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M18.5 7a7 7 0 010 10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
