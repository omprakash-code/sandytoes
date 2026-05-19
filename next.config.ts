import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/about-us",
        destination: "/villa-details#overview",
        permanent: false,
      },
      {
        source: "/contact-us",
        destination: "/villa-details#booking",
        permanent: false,
      },
      {
        source: "/gallary",
        destination: "/villa-details#gallery",
        permanent: false,
      },
      {
        source: "/booking",
        destination: "/villa-details#booking",
        permanent: false,
      },
      {
        source: "/booking-policy",
        destination: "/villa-details#rules",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
