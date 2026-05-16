export const BOOKING_ROUTES = {
  ROOT: "/booking",
  THEATRE: "/booking/theatre",
  DETAILS: "/booking/details",
  OCCASION: "/booking/occasion",
  EXTRAS: (category: string) => `/booking/extras/${category}`,
  PAYMENT: "/booking/payment",
  THANK_YOU: "/booking/thank-you",
};

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Villa Details", href: "/villa-details" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const LEGAL_LINKS = [
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Cancellation Policy", href: "/cancellation-policy" },
];
