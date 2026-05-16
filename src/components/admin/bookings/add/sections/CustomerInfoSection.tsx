import { Minus, Plus } from "lucide-react";

import {
  inputClass,
  sectionClass,
  type TheatreOption,
} from "@/components/admin/bookings/add/shared";

type CustomerInfoSectionProps = {
  name: string;
  phone: string;
  email: string;
  errors: Record<string, string>;
  lookingUpUser: boolean;
  existingUserId: string | null;
  existingUserName: string | null;
  selectedTheatre: TheatreOption | null;
  guestsForControl: number;
  kidsCount: number;
  canDecreaseGuests: boolean;
  canIncreaseGuests: boolean;
  canDecreaseKids: boolean;
  canIncreaseKids: boolean;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onPhoneBlur: () => void;
  onEmailChange: (value: string) => void;
  onDecrementGuests: () => void;
  onIncrementGuests: () => void;
  onEnableKids: () => void;
  onDisableKids: () => void;
  onDecrementKids: () => void;
  onIncrementKids: () => void;
};

export function CustomerInfoSection({
  name,
  phone,
  email,
  errors,
  lookingUpUser,
  existingUserId,
  existingUserName,
  selectedTheatre,
  guestsForControl,
  kidsCount,
  canDecreaseGuests,
  canIncreaseGuests,
  canDecreaseKids,
  canIncreaseKids,
  onNameChange,
  onPhoneChange,
  onPhoneBlur,
  onEmailChange,
  onDecrementGuests,
  onIncrementGuests,
  onEnableKids,
  onDisableKids,
  onDecrementKids,
  onIncrementKids,
}: CustomerInfoSectionProps) {
  const guestStepButtonClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-150 active:scale-95 sm:h-8 sm:w-8";
  const guestStepButtonEnabledClass =
    "border-slate-300 bg-white text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50";
  const guestStepButtonDisabledClass =
    "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed";
  const bringingKids = kidsCount > 0;

  return (
    <section className={sectionClass}>
      <h2 className="text-sm font-semibold text-slate-900">2. Customer Details</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            name="customer_name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            className={inputClass}
            placeholder="Customer full name"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            name="customer_phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value)}
            onBlur={onPhoneBlur}
            maxLength={10}
            inputMode="numeric"
            className={inputClass}
            placeholder="10 digit phone"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          {lookingUpUser && <p className="mt-1 text-xs text-slate-500">Checking existing user...</p>}
          {existingUserId && existingUserName && !lookingUpUser && (
            <p className="mt-1 text-xs text-emerald-700">Existing user linked: {existingUserName}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">Email (optional)</label>
          <input
            name="customer_email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            className={inputClass}
            placeholder="name@example.com"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">Adults</label>
          <div className="flex h-11 items-center justify-between rounded-lg border border-slate-300 bg-white px-1 sm:h-10 sm:rounded-md">
            <button
              type="button"
              disabled={!canDecreaseGuests}
              onClick={onDecrementGuests}
              className={`${guestStepButtonClass} ${
                canDecreaseGuests ? guestStepButtonEnabledClass : guestStepButtonDisabledClass
              }`}
            >
              <Minus size={16} />
            </button>

            <span className="min-w-[40px] text-center text-sm font-semibold tabular-nums text-slate-900">
              {guestsForControl}
            </span>

            <div className="group relative">
              <button
                type="button"
                disabled={!canIncreaseGuests}
                onClick={onIncrementGuests}
                className={`${guestStepButtonClass} ${
                  canIncreaseGuests ? guestStepButtonEnabledClass : guestStepButtonDisabledClass
                }`}
              >
                <Plus size={16} />
              </button>
              {selectedTheatre && !canIncreaseGuests && (
                <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black px-3 py-1 text-xs text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  Max capacity reached
                </div>
              )}
            </div>
          </div>

          {selectedTheatre ? (
            <p className="mt-1 text-xs text-slate-500">
              {selectedTheatre.baseGuests} adult included · Max {selectedTheatre.capacity} total
              capacity for this villa
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">Select villa to manage adults</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">Kids (3-10 yrs)</label>
          <div className="relative grid h-11 grid-cols-2 items-center rounded-lg border border-slate-300 bg-slate-50 px-1 py-1 sm:h-10 sm:rounded-md">
            <div
              className="absolute top-1 left-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-md bg-white shadow-sm transition-transform duration-300 ease-out"
              style={{
                transform: bringingKids ? "translateX(0%)" : "translateX(100%)",
              }}
            />

            <button
              type="button"
              onClick={onEnableKids}
              className={`relative z-10 flex h-full items-center justify-center px-2 text-xs font-medium transition sm:text-sm ${
                bringingKids ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Yes, bringing kids
            </button>

            <button
              type="button"
              onClick={onDisableKids}
              className={`relative z-10 flex h-full items-center justify-center px-2 text-xs font-medium transition sm:text-sm ${
                !bringingKids ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              No kids
            </button>
          </div>

          {bringingKids ? (
            <div className="mt-2 flex h-11 items-center justify-between rounded-lg border border-slate-300 bg-white px-1 sm:h-10 sm:rounded-md">
              <button
                type="button"
                disabled={!canDecreaseKids}
                onClick={onDecrementKids}
                className={`${guestStepButtonClass} ${
                  canDecreaseKids ? guestStepButtonEnabledClass : guestStepButtonDisabledClass
                }`}
              >
                <Minus size={16} />
              </button>

              <span className="min-w-[40px] text-center text-sm font-semibold tabular-nums text-slate-900">
                {kidsCount}
              </span>

              <div className="group relative">
                <button
                  type="button"
                  disabled={!canIncreaseKids}
                  onClick={onIncrementKids}
                  className={`${guestStepButtonClass} ${
                    canIncreaseKids ? guestStepButtonEnabledClass : guestStepButtonDisabledClass
                  }`}
                >
                  <Plus size={16} />
                </button>
                {selectedTheatre && !canIncreaseKids && (
                  <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black px-3 py-1 text-xs text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    Max capacity reached
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {selectedTheatre ? (
            <p className="mt-1 text-xs text-slate-500">
              Charged separately at ₹{selectedTheatre.kidPrice.toLocaleString()} per kid
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">Select villa to manage kids</p>
          )}
        </div>
      </div>
    </section>
  );
}
