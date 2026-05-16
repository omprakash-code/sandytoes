import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import { Suspense } from "react";
import "@splidejs/react-splide/css";
import "./globals.css";
import { BookingProvider } from "@/context/BookingContext";
import { Toaster } from "sonner";
import MetaBootstrap from "@/components/meta/MetaBootstrap";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sandy Toes - Bahamas Luxury Rentals",
  description:
    "Reserve a luxury Treasure Cay villa stay with Sandy Toes. Beach access, private pool, spacious family living, and an easy direct booking experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${manrope.variable} ${playfair.variable} antialiased`}
      >
        <BookingProvider>{children}</BookingProvider>
        <Suspense fallback={null}>
          <MetaBootstrap />
        </Suspense>
        <Toaster
          richColors
          position="top-center"
          mobileOffset={{ top: 20, left: 16, right: 16 }}
        />
      </body>
    </html>
  );
}
