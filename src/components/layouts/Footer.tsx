"use client";

import Image from "next/image";
import Link from "next/link";
import { Twitter } from "lucide-react";
import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { YoutubeIcon } from "@/components/icons/YoutubeIcon";
import { BRAND } from "@/constants/brand";

const quickLinks = [
  { label: "Home", href: "/villa-details" },
  { label: "About Us", href: "/villa-details#overview" },
  { label: "Villa Details", href: "/villa-details" },
  { label: "Gallery", href: "/villa-details#gallery" },
  { label: "Contact Us", href: "/villa-details#booking" },
];

const supportLinks = [
  { label: "Booking Policy", href: "/villa-details#rules" },
  { label: "Cancellation Policy", href: "/villa-details#rules" },
  { label: "Refund Policy", href: "/villa-details#rules" },
  { label: "Privacy Policy", href: "/villa-details" },
  { label: "Terms & Conditions", href: "/villa-details#rules" },
];

const socialLinks = [
  { label: "Facebook", href: BRAND.facebookUrl, icon: FacebookIcon },
  { label: "Instagram", href: BRAND.instagramUrl, icon: InstagramIcon },
  { label: "Twitter", href: "https://twitter.com/", icon: Twitter },
  { label: "Youtube", href: BRAND.youtubeUrl, icon: YoutubeIcon },
];

export default function Footer() {
  return (
    <footer className="bg-[#061827] px-6 pb-9 pt-20 text-white md:px-8 md:pb-10 md:pt-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.8fr_1fr_1.1fr_1.35fr_1fr] lg:gap-14">
          <div>
            <div className="mb-6">
              <Image
                src="/assets/Logo-transparent.png"
                alt={`${BRAND.name} Logo`}
                width={242}
                height={208}
                className="h-auto w-[178px] object-contain"
              />
            </div>
            <p className="max-w-[340px] text-base leading-8 text-white/76">
              Luxury beachfront stays designed for comfort, privacy, and
              memorable island experiences in Treasure Cay, Bahamas.
            </p>
          </div>

          <FooterLinkColumn title="Quick Menu" links={quickLinks} />
          <FooterLinkColumn title="Support" links={supportLinks} />

          <div>
            <h4 className="mb-6 text-[1.7rem] font-semibold leading-none text-white">
              Contact Info
            </h4>
            <div className="space-y-7 text-base leading-7 text-white/74">
              <p>
                <span className="font-semibold text-white/80">A :</span>{" "}
                16201 NW 54 AVE Miami Gardens FL 33014
              </p>
              <a
                href={`tel:${BRAND.phoneHref}`}
                className="block transition hover:text-[#ea7e82]"
              >
                <span className="font-semibold text-white/80">P :</span>{" "}
                1-786-299-1181
              </a>
              <a
                href="mailto:booking@sandytoes.com"
                className="block transition hover:text-[#ea7e82]"
              >
                <span className="font-semibold text-white/80">E :</span>{" "}
                booking@sandytoes.com
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-6 text-[1.7rem] font-semibold leading-none text-white">
              Social Media
            </h4>
            <ul className="space-y-4">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 text-base text-white/72 transition hover:text-[#ea7e82]"
                    >
                      <span className="flex h-4 w-4 items-center justify-center text-[#ea7e82] [&_svg]:h-4 [&_svg]:w-4">
                        <Icon className="h-4 w-4" />
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-20 border-t border-white/22 pt-10">
          <div className="flex flex-col gap-4 text-base text-white/75 sm:flex-row sm:items-center sm:justify-between">
            <p>Copyright © 2026 All rights reserved.</p>
            <p>{BRAND.name}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLinkColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h4 className="mb-6 text-[1.7rem] font-semibold leading-none text-white">
        {title}
      </h4>
      <ul className="space-y-4">
        {links.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="text-base text-white/72 transition hover:text-[#ea7e82]"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
