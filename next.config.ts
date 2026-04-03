import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Keep dev and prod artifacts isolated to avoid manifest shape mismatches.
  // `next start` only supports production build output.
  distDir: process.env.VERCEL ? ".next" : isProd ? "next-build-artifacts-prod" : "next-build-artifacts",
  experimental: {
    // Large JSON bodies (e.g. many base64 images). Route Handlers are still capped by the host (e.g. ~4.5MB on Vercel); client compresses before PATCH.
    serverActions: { bodySizeLimit: "25mb" },
    middlewareClientMaxBodySize: "25mb",
  },
  webpack: (config, { dev }) => {
    // On some Windows setups, webpack's filesystem cache can lose chunk files
    // during fast refresh and cause "Cannot find module './xxx.js'" errors.
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  images: {
    // Allow SVG uploads (e.g. logo files)
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
  },
};

export default nextConfig;
