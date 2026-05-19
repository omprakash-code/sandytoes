"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react";
import DateRangePicker, {
  dateFromKey as dateFromPickerKey,
  GuestStepper,
  toDateKey,
  type DateRangeValue,
} from "@/components/booking-engine/DateRangePicker";
import VillaBookingHeader from "@/components/pages/villa-details/VillaBookingHeader";
import { BRAND } from "@/constants/brand";

export type CheckoutSearchParams = Record<string, string | string[] | undefined>;

const NIGHTLY_RATE = 874;
const FALLBACK_CHECK_IN = "2026-06-01";
const FALLBACK_CHECK_OUT = "2026-06-03";
const MS_PER_DAY = 86_400_000;
const SESSION_BOOKING_KEY = "sandy-toes-checkout-review";
const CHECKOUT_DRAFT_KEY = "sandy-toes-checkout-draft";
const CHECKOUT_DRAFT_MAX_AGE_MS = 60 * 60 * 1000;

type CheckoutForm = {
  firstName: string;
  lastName: string;
  email: string;
  phoneCountry: string;
  phone: string;
  paymentMethod: "card" | "affirm";
  cardName: string;
  cardNumber: string;
  expiry: string;
  securityCode: string;
  country: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  damageOption: "protection" | "deposit" | "";
  consent: boolean;
};

type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;

type StayInputs = {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  promoCode: string;
};

type CheckoutDraft = {
  updatedAt?: number;
  form?: Omit<CheckoutForm, "cardNumber" | "expiry" | "securityCode">;
  stayInputs?: StayInputs;
};

type LocalBookingPayload = {
  lockToken: string;
  sessionId: string;
  paymentSessionId: string;
  createdAt: string;
  property: {
    name: string;
    location: string;
  };
  stay: {
    checkIn: string;
    checkOut: string;
    nights: number;
    adults: number;
    children: number;
    guests: number;
  };
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phoneCountry: string;
    phone: string;
  };
  payment: {
    method: CheckoutForm["paymentMethod"];
    cardName?: string;
    cardLast4?: string;
  };
  billingAddress: {
    country: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
  };
  damageOption: Exclude<CheckoutForm["damageOption"], "">;
  pricing: {
    nightlyRate: number;
    subtotal: number;
    total: number;
    currency: "USD";
  };
  promoCode?: string;
};

type StoredBookingReview = LocalBookingPayload;

type CreateLockResponse = {
  success: boolean;
  message?: string;
  code?: string;
  unavailableDates?: string[];
  data?: {
    lockToken: string;
    sessionId: string;
    expiresAt: string;
    quote?: {
      totalCents?: number;
      currency?: "USD";
    } | null;
  };
};

type CreatePaymentIntentResponse = {
  success: boolean;
  message?: string;
  code?: string;
  data?: {
    provider: "MOCK";
    paymentSessionId: string;
    clientSecret: string;
    lockToken: string;
    sessionId: string;
    amountCents: number;
    currency: "USD";
  };
};

function firstParam(params: CheckoutSearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function parseDateKey(value: string | undefined, fallback: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? fallback : value;
}

function dateFromKey(value: string) {
  return new Date(`${value}T00:00:00`);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatStayDate(date: Date, time: string) {
  const label = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
  return `${label}, ${time}`;
}

function formatBannerDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function daysBetween(start: Date, end: Date) {
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / MS_PER_DAY));
}

function dateKeyFromDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

function formatSecurityCode(value: string) {
  return value.replace(/\D/g, "").slice(0, 4);
}

function formatPhone(value: string) {
  return value.replace(/[^\d+\-()\s]/g, "").replace(/\s+/g, " ").slice(0, 24);
}

function cardDigitCount(cardNumber: string) {
  return cardNumber.replace(/\D/g, "").length;
}

function expiryIsValid(expiry: string) {
  const digits = expiry.replace(/\D/g, "");
  if (digits.length !== 4) return false;
  const month = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2));
  if (month < 1 || month > 12) return false;
  const expiryEnd = new Date(year, month, 0, 23, 59, 59);
  return expiryEnd >= new Date();
}

function securityCodeIsValid(code: string) {
  return /^\d{3,4}$/.test(code);
}

const inputBase =
  "mt-2 block h-12 w-full bg-white px-4 text-sm text-slate-950 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-[#0c7772]/25";

const labelBase =
  "text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 whitespace-nowrap";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-semibold text-[#b94f56]">{message}</p>;
}

function TextField({
  label,
  name,
  value,
  placeholder,
  required,
  error,
  onChange,
}: {
  label: string;
  name: keyof CheckoutForm;
  value: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  onChange: (name: keyof CheckoutForm, value: string) => void;
}) {
  return (
    <label className="block">
      <span className={labelBase}>
        {label} {required ? <span className="text-[#ea7e82]">*</span> : null}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={placeholder}
        className={`${inputBase} ${error ? "ring-2 ring-[#ea7e82]/45" : ""}`}
      />
      <FieldError message={error} />
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  required,
  error,
  options,
  onChange,
}: {
  label: string;
  name: keyof CheckoutForm;
  value: string;
  required?: boolean;
  error?: string;
  options: string[];
  onChange: (name: keyof CheckoutForm, value: string) => void;
}) {
  return (
    <label className="block">
      <span className={labelBase}>
        {label} {required ? <span className="text-[#ea7e82]">*</span> : null}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        className={`${inputBase} appearance-none ${error ? "ring-2 ring-[#ea7e82]/45" : ""}`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </label>
  );
}

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-white p-5 shadow-[0_14px_42px_rgba(6,30,31,0.06)] ring-1 ring-black/5 md:p-7">
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0c7772]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-semibold text-slate-950 md:text-3xl">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function validateForm(form: CheckoutForm) {
  const errors: CheckoutErrors = {};
  const required: Array<keyof CheckoutForm> = [
    "firstName",
    "lastName",
    "email",
    "phoneCountry",
    "phone",
    "country",
    "address",
    "city",
    "state",
    "zip",
  ];

  required.forEach((key) => {
    if (!String(form[key] ?? "").trim()) errors[key] = "Required";
  });

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email";
  }

  if (form.phone && form.phone.replace(/\D/g, "").length < 7) {
    errors.phone = "Enter a valid phone number";
  }

  if (form.paymentMethod === "card") {
    (["cardName", "cardNumber", "expiry", "securityCode"] as const).forEach((key) => {
      if (!form[key].trim()) errors[key] = "Required";
    });

    if (form.cardNumber && (cardDigitCount(form.cardNumber) < 13 || cardDigitCount(form.cardNumber) > 19)) {
      errors.cardNumber = "Enter a valid card number";
    }

    if (form.expiry && !expiryIsValid(form.expiry)) {
      errors.expiry = "Enter a valid expiry date";
    }

    if (form.securityCode && !securityCodeIsValid(form.securityCode)) {
      errors.securityCode = "Enter a valid security code";
    }
  }

  if (!form.damageOption) errors.damageOption = "Choose a damage protection option";
  if (!form.consent) errors.consent = "Please accept the terms to book";

  return errors;
}

function getCardLast4(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, "");
  return digits.slice(-4);
}

function toStoredBookingReview(payload: LocalBookingPayload): StoredBookingReview {
  return {
    lockToken: payload.lockToken,
    sessionId: payload.sessionId,
    paymentSessionId: payload.paymentSessionId,
    createdAt: payload.createdAt,
    property: payload.property,
    stay: payload.stay,
    payment: {
      method: payload.payment.method,
      cardName: payload.payment.cardName,
      cardLast4: payload.payment.cardLast4,
    },
    guest: payload.guest,
    billingAddress: payload.billingAddress,
    damageOption: payload.damageOption,
    pricing: payload.pricing,
    promoCode: payload.promoCode,
  };
}

export default function CheckoutPageClient({ params }: { params: CheckoutSearchParams }) {
  const router = useRouter();
  const initialCheckInKey = parseDateKey(firstParam(params, "checkIn"), FALLBACK_CHECK_IN);
  const initialCheckOutKey = parseDateKey(firstParam(params, "checkOut"), FALLBACK_CHECK_OUT);
  const initialAdults = Math.max(1, Number(firstParam(params, "adults") ?? 2) || 2);
  const initialChildren = Math.max(0, Number(firstParam(params, "children") ?? 0) || 0);
  const initialPromoCode = firstParam(params, "promoCode") ?? "";

  const [stayInputs, setStayInputs] = useState<StayInputs>({
    checkIn: initialCheckInKey,
    checkOut: initialCheckOutKey,
    adults: initialAdults,
    children: initialChildren,
    promoCode: initialPromoCode,
  });

  const stay = useMemo(() => {
    const checkIn = dateFromKey(stayInputs.checkIn);
    const rawCheckOut = dateFromKey(stayInputs.checkOut);
    const checkOut = rawCheckOut > checkIn ? rawCheckOut : addDays(checkIn, 2);
    const nights = daysBetween(checkIn, checkOut);
    const subtotal = nights * NIGHTLY_RATE;
    return {
      checkIn,
      checkOut,
      nights,
      guests: stayInputs.adults + stayInputs.children,
      subtotal,
      refundDate: addDays(checkIn, -14),
    };
  }, [stayInputs]);

  const [form, setForm] = useState<CheckoutForm>({
    firstName: "",
    lastName: "",
    email: "",
    phoneCountry: "United States +1",
    phone: "",
    paymentMethod: "card",
    cardName: "",
    cardNumber: "",
    expiry: "",
    securityCode: "",
    country: "United States",
    address: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    damageOption: "",
    consent: false,
  });
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [editingStay, setEditingStay] = useState(false);
  const [editableDates, setEditableDates] = useState<DateRangeValue>({
    checkIn: dateFromPickerKey(initialCheckInKey),
    checkOut: dateFromPickerKey(initialCheckOutKey),
  });

  function updateField(name: keyof CheckoutForm, value: string) {
    const formattedValue =
      name === "cardNumber"
        ? formatCardNumber(value)
        : name === "expiry"
          ? formatExpiry(value)
          : name === "securityCode"
            ? formatSecurityCode(value)
            : name === "phone"
              ? formatPhone(value)
              : value;

    setForm((current) => ({ ...current, [name]: formattedValue }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitError(null);
  }

  function updateStayInput(next: Partial<StayInputs>) {
    setStayInputs((current) => {
      const merged: StayInputs = { ...current, ...next };
      const checkIn = dateFromKey(merged.checkIn);
      const checkOut = dateFromKey(merged.checkOut);

      if (checkOut <= checkIn) {
        merged.checkOut = dateKeyFromDate(addDays(checkIn, 2));
      }

      merged.adults = Math.min(14, Math.max(1, Number(merged.adults) || 1));
      merged.children = Math.min(8, Math.max(0, Number(merged.children) || 0));

      const query = new URLSearchParams({
        checkIn: merged.checkIn,
        checkOut: merged.checkOut,
        adults: String(merged.adults),
        children: String(merged.children),
      });
      if (merged.promoCode.trim()) query.set("promoCode", merged.promoCode.trim());
      window.history.replaceState(null, "", `/checkout?${query.toString()}`);

      return merged;
    });
  }

  function updateStayDates(next: DateRangeValue) {
    setEditableDates(next);
    if (!next.checkIn || !next.checkOut) return;
    updateStayInput({
      checkIn: toDateKey(next.checkIn),
      checkOut: toDateKey(next.checkOut),
    });
  }

  useEffect(() => {
    try {
      const rawDraft = window.sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
      if (!rawDraft) {
        setDraftReady(true);
        return;
      }

      const draft = JSON.parse(rawDraft) as CheckoutDraft;
      if (!draft.updatedAt || Date.now() - draft.updatedAt > CHECKOUT_DRAFT_MAX_AGE_MS) {
        window.sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
        setDraftReady(true);
        return;
      }
      if (draft.form) {
        setForm((current) => ({
          ...current,
          ...draft.form,
          cardNumber: "",
          expiry: "",
          securityCode: "",
        }));
      }
      if (draft.stayInputs) {
        setStayInputs((current) => ({
          ...current,
          ...draft.stayInputs,
          adults: Math.min(14, Math.max(1, Number(draft.stayInputs?.adults) || current.adults)),
          children: Math.min(
            8,
            Math.max(0, Number(draft.stayInputs?.children) || current.children),
          ),
        }));
        if (draft.stayInputs.checkIn && draft.stayInputs.checkOut) {
          setEditableDates({
            checkIn: dateFromPickerKey(draft.stayInputs.checkIn),
            checkOut: dateFromPickerKey(draft.stayInputs.checkOut),
          });
        }
      }
    } catch {
      // A damaged checkout draft should never block a fresh checkout.
    } finally {
      setDraftReady(true);
    }
  }, []);

  useEffect(() => {
    if (editingStay) {
      setEditableDates({
        checkIn: dateFromPickerKey(stayInputs.checkIn),
        checkOut: dateFromPickerKey(stayInputs.checkOut),
      });
    }
  }, [editingStay, stayInputs.checkIn, stayInputs.checkOut]);

  useEffect(() => {
    if (!draftReady) return;

    const safeForm: CheckoutDraft["form"] = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phoneCountry: form.phoneCountry,
      phone: form.phone,
      paymentMethod: form.paymentMethod,
      cardName: form.cardName,
      country: form.country,
      address: form.address,
      address2: form.address2,
      city: form.city,
      state: form.state,
      zip: form.zip,
      damageOption: form.damageOption,
      consent: form.consent,
    };

    try {
      window.sessionStorage.setItem(
        CHECKOUT_DRAFT_KEY,
        JSON.stringify({ updatedAt: Date.now(), form: safeForm, stayInputs }),
      );
    } catch {
      // Draft persistence is a convenience, not a checkout requirement.
    }
  }, [draftReady, form, stayInputs]);

  useEffect(() => {
    const controller = new AbortController();

    async function checkAvailability() {
      if (!stayInputs.checkIn || !stayInputs.checkOut) return;
      setCheckingAvailability(true);
      try {
        const query = new URLSearchParams({
          checkIn: stayInputs.checkIn,
          checkOut: stayInputs.checkOut,
        });
        const response = await fetch(`/api/villa-bookings/availability?${query.toString()}`, {
          signal: controller.signal,
        });
        const payload = (await response.json()) as {
          success: boolean;
          data?: { available?: boolean; unavailableDates?: string[] };
        };
        if (response.ok && payload.success && payload.data?.available === false) {
          setAvailabilityError("Selected dates include unavailable nights. Please choose new dates.");
        } else {
          setAvailabilityError(null);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      } finally {
        if (!controller.signal.aborted) setCheckingAvailability(false);
      }
    }

    checkAvailability();
    return () => controller.abort();
  }, [stayInputs.checkIn, stayInputs.checkOut]);

  async function handleBookNow() {
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (availabilityError) {
      setSubmitError(availabilityError);
      document.getElementById("checkout-form-start")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }
    if (Object.keys(nextErrors).length > 0) {
      document.getElementById("checkout-form-start")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const lockRequestPayload = {
      checkIn: stayInputs.checkIn,
      checkOut: stayInputs.checkOut,
      adults: stayInputs.adults,
      children: stayInputs.children,
      guestEmail: form.email.trim(),
      guestPhone: form.phone.trim(),
      promoCode: stayInputs.promoCode.trim() || undefined,
    };

    let lockJson: CreateLockResponse;
    let intentJson: CreatePaymentIntentResponse;
    try {
      const lockResponse = await fetch("/api/villa-booking-locks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lockRequestPayload),
      });
      lockJson = (await lockResponse.json()) as CreateLockResponse;

      if (!lockResponse.ok || !lockJson.success || !lockJson.data) {
        if (lockResponse.status === 409) {
          throw new Error("Selected dates are no longer available. Please choose a different stay.");
        }
        throw new Error(lockJson.message ?? "Unable to hold these dates.");
      }

      const intentResponse = await fetch("/api/villa-payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lockToken: lockJson.data.lockToken,
          sessionId: lockJson.data.sessionId,
        }),
      });
      intentJson = (await intentResponse.json()) as CreatePaymentIntentResponse;

      if (!intentResponse.ok || !intentJson.success || !intentJson.data) {
        throw new Error(intentJson.message ?? "Unable to prepare payment.");
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to prepare booking.");
      setSubmitting(false);
      return;
    }

    const payload: LocalBookingPayload = {
      lockToken: lockJson.data.lockToken,
      sessionId: lockJson.data.sessionId,
      paymentSessionId: intentJson.data.paymentSessionId,
      createdAt: new Date().toISOString(),
      property: {
        name: "Sandy Toes at Treasure Cay",
        location: BRAND.location,
      },
      stay: {
        checkIn: stayInputs.checkIn,
        checkOut: stayInputs.checkOut,
        nights: stay.nights,
        adults: stayInputs.adults,
        children: stayInputs.children,
        guests: stay.guests,
      },
      guest: {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phoneCountry: form.phoneCountry,
        phone: form.phone.trim(),
      },
      payment: {
        method: form.paymentMethod,
        cardName: form.paymentMethod === "card" ? form.cardName.trim() : undefined,
        cardLast4: form.paymentMethod === "card" ? getCardLast4(form.cardNumber) : undefined,
      },
      billingAddress: {
        country: form.country,
        address: form.address.trim(),
        address2: form.address2.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim(),
        zip: form.zip.trim(),
      },
      damageOption: form.damageOption || "protection",
      pricing: {
        nightlyRate: NIGHTLY_RATE,
        subtotal: stay.subtotal,
        total: intentJson.data.amountCents / 100,
        currency: "USD",
      },
      promoCode: stayInputs.promoCode.trim() || undefined,
    };

    try {
      window.sessionStorage.setItem(
        SESSION_BOOKING_KEY,
        JSON.stringify(toStoredBookingReview(payload))
      );
    } catch {
      // Session review persistence is helpful but not required for checkout review.
    }
    setSubmitting(false);
    router.push(`/booking-payment?lock=${encodeURIComponent(payload.lockToken)}`);
  }

  const stayDuration = `${stay.nights} night${stay.nights === 1 ? "" : "s"}, ${stay.guests} guest${
    stay.guests === 1 ? "" : "s"
  }`;

  return (
    <main className="min-h-screen bg-[#f7f5f2] text-slate-950">
      <VillaBookingHeader active="checkout" ctaLabel="Back to Villa" ctaHref="/villa-details" />

      <div className="mx-auto max-w-7xl px-4 py-4 md:px-8 lg:py-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-start">
          <aside className="order-first lg:order-last lg:sticky lg:top-7">
            <div className="bg-white shadow-[0_24px_70px_rgba(6,30,31,0.12)] ring-1 ring-[#0b2f3f]/10">
              <div className="border-b border-slate-200/80 p-5 md:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0c7772]">
                  Booking summary
                </p>
                <div className="mt-4 flex gap-4">
                  <div className="relative h-24 w-28 shrink-0 overflow-hidden bg-slate-200">
                    <Image
                      src="/media/booking/villa-details/hero-1.jpg"
                      alt="Sandy Toes villa exterior"
                      fill
                      className="object-cover"
                      sizes="112px"
                      priority
                    />
                    <span className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 text-[10px] font-semibold text-white">
                      1/5
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-xl font-semibold leading-tight text-slate-950">
                      Sandy Toes at Treasure Cay
                    </h1>
                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 text-[#0c7772]" />
                      Treasure Cay, Abaco
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0c7772]">
                      <Star className="h-3.5 w-3.5 fill-[#0c7772]" />
                      10.0 Exceptional
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5 md:p-6">
                <div className="space-y-4 bg-[#fbfaf8] p-4 md:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0c7772]">
                      Stay details
                    </p>
                    <button
                      type="button"
                      onClick={() => setEditingStay((current) => !current)}
                      className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0c7772] transition hover:text-[#ea7e82]"
                    >
                      {editingStay ? "Done" : "Edit"}
                    </button>
                  </div>
                  <div className="relative grid overflow-visible">
                    <div
                      className={`col-start-1 row-start-1 space-y-3 transition-all duration-300 ease-out ${
                        editingStay
                          ? "pointer-events-auto z-10 opacity-100"
                          : "pointer-events-none z-0 -translate-y-2 opacity-0"
                      }`}
                    >
                      <DateRangePicker
                        value={editableDates}
                        onChange={updateStayDates}
                        initialBaseMonth={editableDates.checkIn ?? stay.checkIn}
                        allowClear={false}
                        showStatus
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <GuestStepper
                          label="Guests"
                          value={stayInputs.adults}
                          min={1}
                          max={14}
                          onChange={(value) => updateStayInput({ adults: value })}
                        />
                        <GuestStepper
                          label="Children"
                          value={stayInputs.children}
                          min={0}
                          max={8}
                          onChange={(value) => updateStayInput({ children: value })}
                        />
                      </div>
                      {stayInputs.promoCode ? (
                        <p className="flex items-center justify-between gap-4 border-t border-slate-200 pt-3 text-sm">
                          <span className="text-slate-500">Promo</span>
                          <span className="font-semibold uppercase tracking-[0.08em] text-[#0c7772]">
                            {stayInputs.promoCode}
                          </span>
                        </p>
                      ) : null}
                    </div>
                    <div
                      className={`col-start-1 row-start-1 space-y-4 transition-all duration-300 ease-out ${
                        editingStay
                          ? "pointer-events-none z-0 translate-y-2 opacity-0"
                          : "pointer-events-auto z-10 translate-y-0 opacity-100"
                      }`}
                    >
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                            Check-in
                          </p>
                          <p className="mt-1 font-semibold leading-5 text-slate-950">
                            {formatStayDate(stay.checkIn, "4:00pm")}
                          </p>
                        </div>
                        <div className="border-l border-slate-200 pl-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                            Check-out
                          </p>
                          <p className="mt-1 font-semibold leading-5 text-slate-950">
                            {formatStayDate(stay.checkOut, "10:00am")}
                          </p>
                        </div>
                      </div>
                      <div className="border-t border-slate-200 pt-3">
                        <p className="flex items-center justify-between gap-4 text-sm">
                          <span className="text-slate-500">Guests</span>
                          <span className="font-semibold text-slate-950">{stayDuration}</span>
                        </p>
                        {stayInputs.promoCode ? (
                          <p className="mt-2 flex items-center justify-between gap-4 text-sm">
                            <span className="text-slate-500">Promo</span>
                            <span className="font-semibold uppercase tracking-[0.08em] text-[#0c7772]">
                              {stayInputs.promoCode}
                            </span>
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  {checkingAvailability ? (
                    <p className="text-xs font-semibold text-slate-500">
                      Checking latest availability...
                    </p>
                  ) : null}
                  {availabilityError ? (
                    <p className="bg-[#fff0ef] p-3 text-sm font-semibold text-[#b94f56]">
                      {availabilityError}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>
                      {money(NIGHTLY_RATE)} x {stay.nights} nights
                    </span>
                    <span className="font-medium text-slate-950">{money(stay.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Guest care</span>
                    <span className="font-medium text-slate-950">Included</span>
                  </div>
                </div>

                <div className="bg-[#fbfaf8] p-5 ring-1 ring-slate-200">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0c7772]">
                        Total estimate
                      </p>
                      <p className="mt-2 text-xs text-slate-500">Final amount before confirmation.</p>
                    </div>
                    <span className="text-3xl font-semibold leading-none text-slate-950">
                      {money(stay.subtotal)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-200 pt-4">
                  <p className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <ShieldCheck className="h-4 w-4 text-[#0c7772]" />
                    Secure reservation request
                  </p>
                  <p className="text-xs text-slate-500">
                    Sandy Toes will confirm the final arrival details with you.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleBookNow}
                  disabled={submitting || checkingAvailability}
                  className="h-14 w-full bg-[#ea7e82] px-6 text-base font-semibold text-white shadow-[0_18px_34px_rgba(234,126,130,0.30)] transition hover:bg-[#d86f73] focus:outline-none focus:ring-4 focus:ring-[#ea7e82]/25 disabled:cursor-not-allowed disabled:opacity-65"
                >
                  {submitting ? "Preparing payment..." : "Book now"}
                </button>
                {submitError ? (
                  <p className="bg-[#fff0ef] p-3 text-sm font-semibold text-[#b94f56]">
                    {submitError}
                  </p>
                ) : null}
              </div>
            </div>
          </aside>

          <div id="checkout-form-start" className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0c7772]">
                  Secure checkout
                </p>
                <h1 className="mt-1 font-serif text-2xl font-semibold text-slate-950 md:text-3xl">
                  Complete your reservation
                </h1>
              </div>
              <Link
                href="/villa-details"
                className="text-sm font-semibold text-slate-600 transition hover:text-[#0c7772]"
              >
                Review villa details
              </Link>
            </div>

            <div className="flex items-start gap-3 bg-white p-4 shadow-[0_12px_32px_rgba(6,30,31,0.06)] ring-1 ring-black/5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#eef8f6] text-[#0c7772]">
                <CalendarCheck className="h-5 w-5" />
              </span>
              <p className="pt-2 text-sm font-semibold text-slate-800">
                Partial refund if you cancel by {formatBannerDate(stay.refundDate)}
              </p>
            </div>

            <Section title="Who's checking in?">
              <p className="mb-5 text-sm font-semibold text-[#ea7e82]">* Required</p>
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="First name" name="firstName" value={form.firstName} placeholder="John" required error={errors.firstName} onChange={updateField} />
                <TextField label="Last name" name="lastName" value={form.lastName} placeholder="Smith" required error={errors.lastName} onChange={updateField} />
                <TextField label="Email address" name="email" value={form.email} placeholder="john@example.com" required error={errors.email} onChange={updateField} />
                <SelectField label="Phone country/region" name="phoneCountry" value={form.phoneCountry} required error={errors.phoneCountry} options={["United States +1", "Bahamas +1", "Canada +1", "United Kingdom +44", "India +91"]} onChange={updateField} />
                <div className="md:col-span-2">
                  <TextField label="Phone number" name="phone" value={form.phone} placeholder="786 299 1181" required error={errors.phone} onChange={updateField} />
                </div>
              </div>
            </Section>

            <Section title="Payment details">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["card", "Card"],
                  ["affirm", "Affirm"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateField("paymentMethod", value)}
                    className={`flex h-14 items-center justify-between px-4 text-left font-semibold ring-1 transition ${
                      form.paymentMethod === value
                        ? "bg-[#eef8f6] text-[#0c7772] ring-[#0c7772]"
                        : "bg-white text-slate-800 ring-slate-200 hover:ring-[#0c7772]/35"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {label}
                    </span>
                    {value === "card" ? (
                      <span className="flex gap-1 text-[10px] text-slate-500">
                        {["Amex", "Disc", "MC", "Visa"].map((card) => (
                          <span key={card} className="bg-white px-1.5 py-1 ring-1 ring-slate-200">
                            {card}
                          </span>
                        ))}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>

              {form.paymentMethod === "card" ? (
                <div className="mt-5 bg-[#fbfaf8] p-4 ring-1 ring-slate-200">
                  <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                    <div className="md:col-span-2">
                      <TextField label="Name on card" name="cardName" value={form.cardName} required error={errors.cardName} onChange={updateField} />
                    </div>
                    <TextField label="Card number" name="cardNumber" value={form.cardNumber} placeholder="0000 0000 0000 0000" required error={errors.cardNumber} onChange={updateField} />
                    <div className="grid grid-cols-[1.15fr_0.85fr] gap-4">
                      <TextField label="Expiry date (MM / YY)" name="expiry" value={form.expiry} placeholder="06 / 28" required error={errors.expiry} onChange={updateField} />
                      <TextField label="Security code" name="securityCode" value={form.securityCode} placeholder="123" required error={errors.securityCode} onChange={updateField} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-5 bg-[#fbfaf8] p-4 text-sm text-slate-600 ring-1 ring-slate-200">
                  Affirm payment details will be completed after booking validation.
                </div>
              )}

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <SelectField label="Country/Territory" name="country" value={form.country} required error={errors.country} options={["United States", "Bahamas", "Canada", "United Kingdom", "India"]} onChange={updateField} />
                <TextField label="Address" name="address" value={form.address} required error={errors.address} onChange={updateField} />
                <TextField label="Address 2" name="address2" value={form.address2} placeholder="Apartment, suite, unit" error={errors.address2} onChange={updateField} />
                <TextField label="City" name="city" value={form.city} required error={errors.city} onChange={updateField} />
                <TextField label="State" name="state" value={form.state} required error={errors.state} onChange={updateField} />
                <TextField label="Billing ZIP code" name="zip" value={form.zip} required error={errors.zip} onChange={updateField} />
              </div>
            </Section>

            <Section title="Protect your stay against damages">
              <p className="mb-5 text-sm text-slate-600">
                The host requires you to select a damage protection option{" "}
                <span className="text-[#ea7e82]">*</span>
              </p>
              <div className="space-y-3">
                <label className={`block cursor-pointer bg-[#fbfaf8] p-4 ring-1 transition ${form.damageOption === "protection" ? "ring-[#0c7772]" : "ring-slate-200"}`}>
                  <span className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="damageOption"
                      checked={form.damageOption === "protection"}
                      onChange={() => updateField("damageOption", "protection")}
                      className="mt-1 accent-[#0c7772]"
                    />
                    <span>
                      <strong>Add Property Damage Protection - $89</strong>
                      <ul className="mt-3 space-y-2 text-sm text-slate-600">
                        <li>$3,000 coverage for accidental damage to property like broken lamps, stained linens, and more</li>
                        <li>$500 reimbursement for replacing lost or damaged keys to the property</li>
                        <li>Easy claim process initiated by the host</li>
                      </ul>
                      <span className="mt-3 block text-sm text-slate-500">
                        Great for travelers with kids, in groups, on extended stays, or at luxury properties.{" "}
                        <button type="button" className="font-semibold text-[#0c7772]">
                          View plan details and disclosures
                        </button>
                      </span>
                    </span>
                  </span>
                </label>

                <label className={`block cursor-pointer bg-[#fbfaf8] p-4 ring-1 transition ${form.damageOption === "deposit" ? "ring-[#0c7772]" : "ring-slate-200"}`}>
                  <span className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="damageOption"
                      checked={form.damageOption === "deposit"}
                      onChange={() => updateField("damageOption", "deposit")}
                      className="mt-1 accent-[#0c7772]"
                    />
                    <span>
                      <strong>Pay a refundable damage deposit to the host - $3,000</strong>
                      <span className="mt-3 block text-sm text-slate-500">
                        Refunds are at the discretion of the host and are not guaranteed.
                      </span>
                    </span>
                  </span>
                </label>
              </div>
              <FieldError message={errors.damageOption} />
            </Section>

            <Section title="Policies & rules">
              <div className="space-y-6 text-sm leading-6 text-slate-600">
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">Cancellation policy</h3>
                  <ul className="mt-3 space-y-2 text-slate-600">
                    <li>Partial refund is available when cancellation is completed before the displayed refund date.</li>
                    <li>Property fees may be refunded according to the host policy and timing of cancellation.</li>
                    <li>Guest care fees follow the Sandy Toes cancellation terms for this stay.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">Check-out instructions</h3>
                  <p className="mt-3 text-slate-600">
                    Host check-out instructions will be shared before arrival.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">House rules</h3>
                  <p className="mt-3 text-slate-600">Minimum age to rent: 21</p>
                </div>
                <label className="flex cursor-pointer items-start gap-3 bg-[#fbfaf8] p-4 ring-1 ring-slate-200">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, consent: event.target.checked }));
                      setErrors((current) => ({ ...current, consent: undefined }));
                    }}
                    className="mt-1 accent-[#0c7772]"
                  />
                  <span>
                    By clicking on the button below, I confirm I have read and accept the Privacy
                    Statement, house rules, check-out instructions, rental agreement, and Terms of
                    Service.
                  </span>
                </label>
                <FieldError message={errors.consent} />
              </div>
            </Section>

            <div className="flex items-center gap-3 bg-white p-4 text-sm text-slate-600 ring-1 ring-black/5">
              <Mail className="h-4 w-4 text-[#0c7772]" />
              Booking support is available at{" "}
              <Link href={`mailto:${BRAND.email}`} className="font-semibold text-[#0c7772]">
                {BRAND.email}
              </Link>
              <Phone className="ml-auto hidden h-4 w-4 text-[#ea7e82] sm:block" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
