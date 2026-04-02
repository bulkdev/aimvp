import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel expects Next build output in ".next". Keep custom dist locally only.
  distDir: process.env.VERCEL ? ".next" : "next-build-artifacts",
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
