import { formatCents } from "@/lib/villa-booking";
import { formatISTDate } from "@/lib/formatters";

export type VillaEmailBookingSummary = {
  bookingRef: string;
  villaName: string;
  guestName: string;
  guestEmail: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  adults: number;
  children: number;
  totalCents: number;
  currency: string;
};

export type BuiltVillaEmail = {
  to: string;
  subject: string;
  text: string;
  html: string;
  template: string;
};

function dateLabel(date: Date) {
  return formatISTDate(date);
}

function baseHtml({ title, body }: { title: string; body: string }) {
  return `
    <div style="margin:0;background:#f7f5f2;padding:32px;font-family:Arial,sans-serif;color:#0f172a;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;padding:32px;border:1px solid #e2e8f0;">
        <p style="margin:0 0 12px;color:#0c7772;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Sandy Toes</p>
        <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:32px;line-height:1.15;color:#020617;">${title}</h1>
        ${body}
      </div>
    </div>
  `;
}

function summaryHtml(booking: VillaEmailBookingSummary) {
  return `
    <div style="background:#fbfaf8;border:1px solid #e2e8f0;padding:20px;margin-top:24px;">
      <p style="margin:0 0 10px;"><strong>Booking reference:</strong> ${booking.bookingRef}</p>
      <p style="margin:0 0 10px;"><strong>Villa:</strong> ${booking.villaName}</p>
      <p style="margin:0 0 10px;"><strong>Stay:</strong> ${dateLabel(booking.checkIn)} to ${dateLabel(booking.checkOut)}</p>
      <p style="margin:0 0 10px;"><strong>Guests:</strong> ${booking.adults} adults${booking.children ? `, ${booking.children} children` : ""}</p>
      <p style="margin:0;"><strong>Total:</strong> ${formatCents(booking.totalCents, booking.currency)}</p>
    </div>
  `;
}

export function buildGuestBookingConfirmationEmail(
  booking: VillaEmailBookingSummary,
): BuiltVillaEmail {
  const subject = `Sandy Toes reservation received: ${booking.bookingRef}`;
  const text = [
    `Hi ${booking.guestName},`,
    "",
    "Thank you for choosing Sandy Toes. We have received your reservation details.",
    `Booking reference: ${booking.bookingRef}`,
    `Stay: ${dateLabel(booking.checkIn)} to ${dateLabel(booking.checkOut)}`,
    `Guests: ${booking.adults + booking.children}`,
    `Total: ${formatCents(booking.totalCents, booking.currency)}`,
  ].join("\n");

  return {
    to: booking.guestEmail,
    subject,
    template: "villa-booking-confirmed",
    text,
    html: baseHtml({
      title: "Your Sandy Toes reservation has been received.",
      body: `
        <p style="font-size:16px;line-height:1.7;color:#475569;">Hi ${booking.guestName}, thank you for choosing Sandy Toes. We have received your reservation details and will follow up with arrival information.</p>
        ${summaryHtml(booking)}
      `,
    }),
  };
}

export function buildAdminBookingNotificationEmail({
  booking,
  adminEmail,
}: {
  booking: VillaEmailBookingSummary;
  adminEmail: string;
}): BuiltVillaEmail {
  const subject = `New Sandy Toes booking: ${booking.bookingRef}`;
  const text = [
    "New Sandy Toes reservation received.",
    `Guest: ${booking.guestName} <${booking.guestEmail}>`,
    `Booking reference: ${booking.bookingRef}`,
    `Stay: ${dateLabel(booking.checkIn)} to ${dateLabel(booking.checkOut)}`,
    `Total: ${formatCents(booking.totalCents, booking.currency)}`,
  ].join("\n");

  return {
    to: adminEmail,
    subject,
    template: "villa-admin-booking-notification",
    text,
    html: baseHtml({
      title: "New reservation received.",
      body: `
        <p style="font-size:16px;line-height:1.7;color:#475569;">A new Sandy Toes reservation has been received from ${booking.guestName}.</p>
        ${summaryHtml(booking)}
      `,
    }),
  };
}
