import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: "next-build-artifacts",
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
