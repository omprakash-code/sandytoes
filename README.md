# Dazzling Screens — Private Theatre Booking Platform

A production-grade, multi-step private theatre booking system built with modern web architecture, focused on pricing correctness, slot locking, and data integrity.

This project simulates a real-world booking engine similar to premium private cinema experiences, handling partial payments, slot locking, and configurable pricing logic.

## Key Highlights

- Slot locking to prevent double bookings
- Self-healing lock lifecycle (orphan/stale lock auto-recovery)
- Centralized pricing engine (no UI calculations)
- Partial/full payment flow (advance is configurable; default ₹750)
- Resilient Razorpay flow for retries, session expiry, and multi-tab safety
- Fast Razorpay verification path:
  - successful verify reduced from about `3.1–3.2s` to about `190–207ms`
  - paid-expired verify reduced from about `1.7s` to about `57–59ms`
- Shared booking email theming via one env toggle:
  - `BOOKING_EMAIL_THEME=light|dark`
  - consistent header structure across customer/admin booking emails
  - payment-dropoff and paid-expired emails now include occasion and add-on details
- Webhook-backed Razorpay reconciliation (`payment.captured` / `payment.failed`)
- Global structured booking error contract across booking + payment APIs
- Centralized client booking error handler with route-safe recovery
- First-class `PAID_EXPIRED` booking lifecycle for payment-captured but unconfirmed bookings
- Consent-gated Meta Pixel + Conversions API tracking for booking funnel analytics
- Safe auto-sync for future slots (create-only + advisory lock protected)
- Multi-step booking with persistence
- Admin-controlled decoration rules
- Admin Add Booking flow (online + offline, shared booking engine)
- Snapshot-based pricing (future-proof)
- Clean separation of UI, logic, and data layers

it's designed with real production constraints in mind.


## Booking Flow Overview
The booking system follows a strict, step-by-step flow to ensure pricing accuracy, slot safety, and a smooth user experience.

### Step 1: Location & Date Selection
User selects the city/location and booking date.
Route: `/booking` (single entry route).

### Step 2: Theatre & Slot Selection
Available theatres and slots are displayed. Once a slot is selected, it is locked server-side to avoid double booking.

### Step 3: Contact & Booking Details
User enters contact information (Name, Email, Phone), selects guest count, and chooses decoration preference. A pricing snapshot (base, extrasPerson, decoration(Yes/No), total) is calculated, Booking Updated and saved.

### Step 4: Conditional Navigation
- If decoration preference is yes → user is redirected to Occasion selection after submit
- If decoration preference is No → user will be redirect to Terms & conditions after submit

### Step 5: Occasion Selection *(only if decoration is selected)*
User selects the celebration occasion (Birthday, Anniversary, Proposal, etc.) and enter name or partner 1, Partner 2 name.

### Step 6: Extra Products – Sequential Flow
Extra products are added one category at a time, in a fixed order:
1. Cake
2. Decoration Items
3. Gifts

Each category has its own dedicated page. Users must complete or skip a category before moving to the next one.

### Step 7: Terms & Conditions
User must accept the terms to proceed further.

### Step 8: Payment
Payment is collected via Razorpay with the locked payable amount (advance or full). Any remaining amount is shown on success and paid at theatre only when applicable.

If payment is captured but the reservation expires before confirmation:
- booking is recorded as `PAID_EXPIRED`
- customer/admin notification emails are triggered
- admin sees the incident as `PAID - EXPIRED`
- stale re-entry to `/booking/payment` is redirected back to `/booking`

### Step 9: Order Confirmation
Booking is finalized and the user is redirected to the Thank You page.

## Mobile Booking CTA UX (2026-02-20)

- A unified sticky CTA is used across mobile booking steps:
  - theatre selection
  - contact
  - occasion
  - extras categories
- Sticky CTA shows dynamic pricing helpers:
  - total price
  - advance payable now
  - remaining payable at theatre
- In summary-driven steps (`contact`, `occasion`, `extras`), sticky CTA auto-hides when the user scrolls to the summary payment helper block, and the inline summary CTA is shown instead.
- Theatre step keeps sticky CTA active (after slot selection), with footer-safe mobile spacing applied only on `/booking/theatre`.

## UI Density & Typography Update (2026-02-22)

- Booking flow UI was compacted across step-1, contact, occasion, theatre, and extras pages to reduce unnecessary spacing and improve scanability on laptops.
- Typography refinements were applied to dense controls (notably quick-date chips and cake disclaimer copy) for clearer visual hierarchy.
- Occasion inline detail popup alignment was improved for left-edge cards to avoid viewport clipping.
- Theatre next-day slot action now confirms date-change via toast feedback.

## Routing Update (2026-02-13)

Booking flow entry was updated from `/booking/location` to `/booking`:

- Previous Step 1 route (`/booking/location`) was retired
- Step 1 now lives at: `src/app/booking/page.tsx` (`/booking`)
- Route constant normalized to: `BOOKING_ROUTES.ROOT = "/booking"`
- Prebooking cookie persistence (`/api/prebooking/set`) is handled from `src/app/booking/page.tsx` before navigating to theatre step

Current rule:
- Start booking from `/booking` only.


## Architecture Overview

### Frontend

- Next.js (App Router)
- React Context — Single source of truth for booking
- Tailwind CSS — Utility-first styling
- Framer Motion — Micro-interactions
- Fully client-driven booking steps (hydration-safe)

### Backend

- Prisma ORM
- PostgreSQL
- API Routes (Next.js)
- Slot locking & booking lifecycle handled server-side

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (App Router), React |
| Styling | Tailwind CSS |
| State | React Context |
| Animations | Framer Motion |
| Backend | Next.js API Routes |
| ORM | Prisma |
| Database | PostgreSQL |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- npm / yarn / pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/omprakash-code/dazzling-screens.git

# Move into the project directory
cd dazzling-screens

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

### Operational Env Additions (2026-03-01)

Add these keys in `.env` for current production behavior:

```env
# Admin auth validation cache (short TTL, DB-safe)
ADMIN_AUTH_CACHE_TTL_MS=2000
ADMIN_AUTH_CACHE_MAX_ENTRIES=500

# Booking email theme
BOOKING_EMAIL_THEME=dark

# Razorpay webhook verification
RAZORPAY_WEBHOOK_SECRET=replace-with-razorpay-webhook-secret

# Theatre lock unlock sweep throttle
SLOT_UNLOCK_THROTTLE_MS=60000

# Future slot auto-sync
SLOT_SYNC_ENABLED=false
SLOT_SYNC_DAYS_AHEAD=90
SLOT_SYNC_INTERVAL_MINUTES=60
SLOT_SYNC_INTERNAL_KEY=replace-with-strong-random-key

# Meta Pixel + Conversions API
NEXT_PUBLIC_META_PIXEL_ID=replace-with-meta-pixel-id
META_ACCESS_TOKEN=replace-with-meta-capi-access-token
META_TEST_EVENT_CODE=optional-test-event-code
META_GRAPH_API_VERSION=v22.0
```

## Meta Tracking (2026-03-10)

The booking funnel now includes consent-gated Meta tracking across browser + server paths.

Tracked events:

- `PageView`
  - fires on page views after marketing consent is accepted
- `ViewContent`
  - fires on homepage and booking-flow pages
- `CTA_Click`
  - fires on tracked high-intent buttons:
    - `Book Now`
    - `Start Booking`
    - `Reserve This Slot`
    - final payment/confirm CTA
- `InitiateCheckout`
  - fires when Razorpay checkout opens
- `Purchase`
  - fires only after successful backend payment verification
  - sent via Meta Conversions API
  - uses `value = totalAmount`
  - also sends:
    - `advance_paid_value`
    - `total_booking_value`

Important behavior:

- Meta browser tracking loads only after marketing consent
- server-side `Purchase` is non-blocking and does not delay booking confirmation
- deduplication uses a stable event id built from `bookingRef + paymentReference`
- success-page refresh does not create another `Purchase`

## Pricing System

Pricing is never calculated in the UI. All pricing logic is centralized in `src/lib/booking-pricing.ts`.

### Pricing Rules

- Base price = Theatre base price
- Extra guests = (guestCount - includedGuests) × extraPersonPrice
- Decoration cost added conditionally
- Discounts (future-ready)
- Advance payment is configurable (default ₹750 via settings/theatre rules)

The pricing snapshot is saved to the database to prevent future mismatches.

## Slot Locking Strategy

- Slot is locked when user proceeds from theatre selection
- Lock prevents parallel bookings
- Lock expires automatically if booking is not completed
- Orphan/stale LOCKED slots are auto-released during lock attempts
- Ensures fair availability and no race conditions

## Booking Error Hardening (2026-02-14)

Major reliability upgrade added:

- Standardized API error shape for booking mutations and payment APIs:
  - `{ success: false, code, message }`
- Canonical client-handled codes:
  - `BOOKING_NOT_FOUND`
  - `BOOKING_FINALIZED`
  - `BOOKING_INVALID_STATE`
  - `UNAUTHORIZED`
  - `SLOT_EXPIRED`
  - `SESSION_EXPIRED`
- Shared client recovery utility:
  - `src/utils/handleBookingError.ts`
- Payment safety improvements:
  - booking session cookie (`ds_booking_session`) validation
  - terminal paid-expired handling for captured-payment expiry/slot-loss incidents
  - payment page blocks stale retries after paid-expired incidents and returns user to `/booking`
  - lock owner authority sourced from session token and validated against slot lock
  - stale/missing `ds_lock_owner` cookie self-healing
  - booking-level DB row lock (`FOR UPDATE`) during create-order and verify
  - webhook reconciliation endpoint for async gateway events
  - safe retry/cancel/back-navigation state reset (no infinite spinner)
  - duplicate payment countdown redirect UX (`5s → 1s`) before auto-navigation

## Payment-Captured Failure Handling (2026-03-08)

- A dedicated booking lifecycle state now exists for captured-money / unconfirmed-booking incidents:
  - `BookingStatus.PAID_EXPIRED`
- This state is used when:
  - payment succeeds
  - the reservation expires during payment processing/verification
  - or the slot becomes unavailable before confirmation completes
- Current behavior:
  - customer sees a dedicated payment-received modal with restart/support actions
  - customer and admin notification emails are sent for refund follow-up
  - admin main bookings page shows these incidents as `PAID - EXPIRED`
  - these incidents are excluded from generic abandonment listing
- Goal:
  - payment-captured incidents should remain operationally visible as first-class follow-up items, not hidden under ordinary abandonment

## Success Link Security (2026-02-15)

- Public success page access no longer uses predictable `bookingRef` query.
- Success page now uses a signed token URL:
  - `/booking/success?t=<signed_token>`
- Token integrity is validated server-side via HMAC SHA256 using `SUCCESS_PAGE_SECRET`.
- Token verification route:
  - `GET /api/bookings/by-success-token?t=...`
- Expiry rule:
  - Link remains valid until **booked slot end time + 24 hours** (IST, overnight-safe).
- Public `by-ref` success lookup has been removed.

Required env:
- `SUCCESS_PAGE_SECRET` (strong random secret, unique per environment)

## Payment Operations (Admin)

- Admin Payments view tracks all attempts with status-based diagnostics.
- `FAILED` payments expose contextual failure reason via hover tooltip.

## Admin Add Booking (2026-02-16)

- Admin can create bookings from the Bookings page drawer using one vertical flow.
- Backend uses a single endpoint for admin create:
  - `POST /api/admin/bookings/create`
- Flow supports:
  - `LOOKUP_USER` mode by phone
  - `CREATE` mode with `OFFLINE` or `ONLINE` payment
- Pricing, slot checks, products, and payment verification are reused from shared booking engine logic.
- Offline confirmed bookings now redirect directly to tokenized success page:
  - `/booking/success?t=<token>`
- Success page shows admin payment metadata only for admin-created bookings.
- Success page and downloadable ticket now show saved celebration details and per-item number decoration values when available.
- Customer-facing success/PDF hides raw admin payment metadata; admin-created confirmations keep payment context in a simplified form.
- Admin bookings table includes row-level booking ticket PDF download.
- Duplicate/multi-tab payment attempts are surfaced clearly to both users and admins.

## Admin Edit Booking (2026-02-19)

- Admin can edit bookings from the same drawer used by Add Booking.
- Edit APIs:
  - `GET /api/admin/bookings/:id` (prefill)
  - `PATCH /api/admin/bookings/:id` (update)
- Edit flow supports slot changes, product updates, customer updates, and payment status updates with server-side revalidation.
- On slot reassignment, when previous premium slot is released to `AVAILABLE`, admin receives a structured notification message in the update response.

## Admin Booking Coupon & Payment UX (2026-02-24)

- Admin create/edit booking now supports multi-coupon preview and apply flow.
- New preview API:
  - `POST /api/admin/bookings/coupon-preview`
- Coupon validation in admin flows is centralized through shared coupon evaluator logic used by:
  - create booking (`POST /api/admin/bookings/create`)
  - edit booking (`PATCH /api/admin/bookings/:id`)
- Booking summary and payment section in admin drawer were redesigned for progressive clarity:
  - guided selection-first summary states
  - cleaner paid/remaining breakdown
  - dynamic collection CTA labels
  - fully-paid edit state hides unnecessary payment controls until pricing-impacting changes occur
- Slot selection UI now includes compact status dots for faster scan in admin flow.

## Admin Coupon Builder Upgrade (2026-03-11)

- Coupon admin drawer now separates:
  - discount setup
  - usage controls
  - booking/cart restrictions
- `Apply Discount On` now supports:
  - booking total
  - slot price
  - all booking products
  - selected product categories
  - selected products
- Product/category targeting now discounts only matched items instead of using the full product subtotal.
- Restrictions now support cart-composition rules such as:
  - cart must include category
  - cart must include products
  - theatre / slot / date / time restrictions
  - location restriction inside the same restriction flow
- Coupon picker UX for products/categories was upgraded with:
  - collapsible searchable selector
  - select all / clear actions
  - easier handling for large product catalogs
- Focused coupon tests now cover:
  - targeted product/category validation
  - matched-item discount evaluation
  - booking-total coupons that require both cake and decoration categories

## Admin Tables UX (2026-02-19)

- Booking and abandonment rows no longer show delete action.
- Selection checkboxes are hidden across bookings/live/abandonment, slots, and products tables (logic retained in code).
- Row-level horizontal spacing standardized in:
  - bookings
  - slots
  - products
  - payments
  - waitlist
  - contact

## Admin Product Management (2026-02-24)

- Product admin now supports complete drawer-based CRUD:
  - add product
  - view grouped product details
  - edit product and variants
  - delete from row action with custom confirmation popup
- Product image is upload-only in admin form (no manual URL input).
- Variant management supports dynamic add/remove with validation:
  - unique variant labels
  - exactly one default variant
  - optional sale price (when present, cannot exceed regular price)
- Inventory is now stock-driven per variant:
  - stock is captured in admin product form
  - booking flow enforces quantity by available stock
  - out-of-stock items are blocked in booking flow
- Deletion safety:
  - product deletion is blocked if the product exists in booking history
  - popup displays linked booking references as clickable links to booking drawer view

## Database Design

- Normalized schema
- Booking lifecycle managed via status: INCOMPLETE, CONFIRMED, CANCELLED
- Pricing stored as immutable snapshot
- Users linked via phone number (connectOrCreate)
- Extras stored as booking items (future-safe)

## Booking Status Lifecycle

AVAILABLE → LOCKED → INCOMPLETE → CONFIRMED

This ensures:
- No orphan bookings
- No accidental overwrites
- Clear admin visibility

## Project Structure

```
src/
├── app/
│   ├── booking/
│   │   ├── theatre/
│   │   ├── contact/
│   │   ├── occasion/
│   │   ├── terms/
│   │   └── payment/
│   └── api/
│       └── bookings/
├── components/
│   └── booking/
├── context/
│   └── BookingContext.tsx
├── utils/
│   └── pricing.ts
├── constants/
│   └── routes.ts
└── prisma/
    └── schema.prisma
```

## Design Decisions

### Not Implemented
- Pricing logic in UI
- Server components for booking steps
- Recalculation from DB products

### Implemented
- All business rules centralized
- UI is purely declarative
- Backend enforces integrity

These decisions mirror real-world booking systems.

## Upcoming Enhancements

- Auto slot unlock via cron
- Coupon engine
- Admin pricing overrides
- WhatsApp & Email notifications
- Booking dashboard (admin)

## Author

Omprakash Kumar 
Full Stack Developer  
Focused on building scalable, real-world web systems
