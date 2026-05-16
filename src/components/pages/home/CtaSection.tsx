"use client";

import { Phone, Mail } from "lucide-react";
// import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";
import { WhatsAppIcon } from "@/components/icons/WhatsApp";
import { HomeOutlineButton, HomePrimaryButton } from "@/components/ui/HomeButtons";
import { BRAND } from "@/constants/brand";

export default function CtaSection() {
  return (
    <section className="relative overflow-hidden py-8 sm:py-14 lg:py-28">
      {/* Fixed Background Image */}
      <div
        className="absolute inset-0 pointer-events-none bg-fixed bg-cover bg-center"
        style={{
          backgroundImage: "url('/media/site/shared/call-to-action-bg.webp')",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/58" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          {/* Heading */}
          <h2 className="mb-3 text-2xl font-semibold text-white sm:mb-4 sm:text-3xl md:text-4xl">
            Ready for Treasure Cay?
          </h2>

          <p className="mx-auto mb-5 max-w-2xl text-sm text-white/85 sm:mb-6 sm:text-base md:text-lg">
            Start with the villa details, then send your preferred dates.
            Our booking team can help shape the stay from there.
          </p>

          {/* Primary CTA */}
          <div className="mb-5 mx-auto flex w-full max-w-[340px] flex-col items-center justify-center gap-2.5 sm:mb-6 sm:max-w-none sm:flex-row sm:gap-3 lg:gap-4">
            <HomePrimaryButton
              href="/villa-details"
              trackingName="View Villa Details"
              trackingLocation="Home CTA"
              className="w-full max-w-[250px] sm:w-auto sm:max-w-none px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-3 text-[13px] sm:text-sm lg:text-base"
            >
              View Villa Details
            </HomePrimaryButton>

            <HomeOutlineButton
              href={`https://wa.me/${BRAND.whatsappNumber}?text=Hi%20Sandy%20Toes%2C%20I%27m%20interested%20in%20a%20Treasure%20Cay%20villa%20stay.%20Could%20you%20please%20help%20with%20availability%20and%20pricing%3F`}
              target="_blank"
              rel="noopener noreferrer"
              leadingIcon={<WhatsAppIcon size={22} className="text-green-500" />}
              className="w-full max-w-[250px] sm:w-auto sm:max-w-none px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-3 border-white/60 bg-white/5 !text-white text-[13px] sm:text-sm lg:text-base hover:border-[#00C951] hover:bg-white/10 hover:!text-white"
            >
              Chat on WhatsApp
            </HomeOutlineButton>

          </div>

          {/* Support Info */}
          <div className="flex flex-col items-center justify-center gap-4 text-xs text-white/75 sm:flex-row sm:gap-6 sm:text-sm">
            <a
              href={`tel:${BRAND.phoneHref}`}
              className="flex items-center gap-2 transition hover:text-[#FFD700]">
              <Phone size={16} />
              {BRAND.phoneDisplay}
            </a>

            <span className="hidden sm:block">•</span>

            <a
              href={`mailto:${BRAND.email}`}
              className="flex items-center gap-2 transition hover:text-[#FFD700]"
            >
              <Mail size={16} />
              {BRAND.email}
            </a>

            <span className="hidden sm:block">•</span>

            <span className="font-medium">
              Replies under 5 minutes
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
