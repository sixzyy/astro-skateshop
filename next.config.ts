import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const ALLOWED_IMAGE_HOSTS = [
  "images.unsplash.com",
  "picsum.photos",
  "fastly.picsum.photos",
  "res.cloudinary.com",
  "i.imgur.com",
  "images.pexels.com",
  "cdn.pixabay.com",
  "i.pinimg.com",
  "cdn.shopify.com",
  "imgs.search.brave.com",
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: ALLOWED_IMAGE_HOSTS.map((hostname) => ({ protocol: "https", hostname })),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
