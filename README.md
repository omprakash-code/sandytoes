# Sandy Toes Villa Booking System

Sandy Toes is a premium villa booking engine for date-range reservations in Treasure Cay, Bahamas.

This project is being migrated from the legacy Dazzling Screens theatre slot-booking platform into a villa-first booking architecture. The legacy theatre system is preserved under `legacy/` for reference and future upsell reuse, but it is not part of the active application build.

## Active Architecture

- Next.js App Router
- PostgreSQL
- Prisma
- Admin authentication
- Villa date-range availability
- Direct booking checkout
- Booking/payment/email/admin-note records
- Admin booking list and blocked-date management

## Current Booking Flow

1. Guest reviews villa details.
2. Guest selects check-in/check-out and guest count.
3. Checkout validates guest, billing, and payment-intent details.
4. Server creates a short-lived `VillaBookingLock` for the selected stay range.
5. Server prepares a payment intent payload from the immutable lock quote.
6. Payment confirmation consumes the lock and creates the confirmed booking.

The legacy booking-first `/api/villa-bookings` route is deprecated and no longer creates
temporary holds.

## Phase 1 Villa Foundation

The active schema now includes a first-class `Villa` model and `villaId` relations on active villa records:

- `VillaBooking`
- `VillaPayment`
- `VillaBlockedDate`
- `VillaEmailLog`
- `VillaAdminNote`

The `propertySlug` and `propertyName` fields are temporarily preserved for backward compatibility during migration.

## Service Boundaries

Villa business logic lives under:

```txt
src/services/villa/
```

Current services:

- `villa.service.ts`
- `villa-availability.service.ts`
- `villa-booking.service.ts`
- `villa-lock.service.ts`
- `villa-payment.service.ts`
- `villa-pricing.service.ts`

API routes should remain thin controllers that parse input, call services, and return responses.

## Legacy Documentation

The old Dazzling Screens README has been moved to:

```txt
legacy/docs/README.dazzling-screens.md
```

The old theatre slot engine remains useful as architectural reference for payment recovery, lock lifecycle, and admin patterns, but the active villa system should not reuse the generated slot inventory model.

## Phase 2 Lock Foundation

The active schema now includes `VillaBookingLock` for temporary checkout holds.

Lock rules:

- Stay ranges use `[checkIn, checkOut)` semantics.
- Expired locks are ignored by availability even before cleanup runs.
- Lock creation runs inside a transaction and serializes range decisions per villa with
  `pg_advisory_xact_lock`.
- Availability checks consider confirmed bookings, active locks, blocked dates, and
  transitional active `READY_FOR_PAYMENT` rows.

## Phase 3 Lock-First Checkout

Checkout now follows the production payment shape:

```txt
checkout form
→ create VillaBookingLock
→ create payment intent payload
→ payment confirmation endpoint
→ createBookingFromLock()
→ confirmed VillaBooking
→ consumed VillaBookingLock
```

Current payment confirmation is a mock endpoint used only until Stripe is connected. The intended
production path is:

```txt
Stripe PaymentIntent
→ Stripe webhook
→ assertLockValid()
→ createBookingFromLock()
```

Frontend code should not create confirmed bookings directly.

## Phase 4 Admin Operations Foundation

Admin operations now use range-based villa blocks instead of single blocked dates.

Operational model:

- `VillaBlock` stores `[startDate, endDate)` unavailable ranges.
- `BookingActivityLog` records append-only operational events.
- `/admin/calendar` provides monthly visibility for confirmed bookings, active locks, and blocked ranges.
- Admin booking changes use controlled lifecycle actions instead of free-form status editing.
- Rescheduling runs through a transaction-safe service and re-checks availability while excluding the current booking.

Single-date `VillaBlockedDate` records are preserved only for migration compatibility and are backfilled into `VillaBlock`.

## Next Architecture Phase

Before Stripe is connected, the next backend step should be:

1. Replace the mock payment intent with Stripe PaymentIntent creation.
2. Add Stripe webhook confirmation using `createBookingFromLock()`.
3. Add payment-captured-but-booking-failed incident handling.
4. Add idempotency keys and provider event logging.
5. Add email delivery provider integration and confirmation templates.
