"use client";

import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Device PNGs from fastlane/frameit-frames (gh-pages) — transparent screen cutouts, real bezels.
 * @see https://github.com/fastlane/frameit-frames
 */

/** Measured 3910×2241 — offsets from `latest/offsets.json` → Macbook Pro 16 */
const MB = {
  aspect: 3910 / 2241,
  screen: {
    leftPct: (419 / 3910) * 100,
    topPct: (98 / 2241) * 100,
    widthPct: (3072 / 3910) * 100,
    heightPct: (1920 / 2241) * 100,
  },
} as const;

/** Measured 1311×2672 — offsets → iPhone 14 Pro */
const IP = {
  aspect: 1311 / 2672,
  screen: {
    leftPct: (68 / 1311) * 100,
    topPct: (58 / 2672) * 100,
    widthPct: (1179 / 1311) * 100,
    heightPct: (2556 / 2672) * 100,
  },
} as const;

export function MacbookPortfolioFrame({ children }: { children: ReactNode }) {
  const s = MB.screen;
  return (
    <div
      className="relative w-full max-w-[720px] mx-auto"
      style={{ aspectRatio: `${MB.aspect}` }}
    >
      <div
        className="absolute z-0 overflow-hidden rounded-[2px] bg-[#0a0f1c]"
        style={{
          left: `${s.leftPct}%`,
          top: `${s.topPct}%`,
          width: `${s.widthPct}%`,
          height: `${s.heightPct}%`,
        }}
      >
        {children}
      </div>
      <Image
        src="/device-frames/macbook-pro-16-space-gray.png"
        alt=""
        width={3910}
        height={2241}
        className="absolute inset-0 z-10 h-full w-full select-none object-fill pointer-events-none"
        priority={false}
        sizes="(max-width: 720px) 100vw, 720px"
      />
    </div>
  );
}

export function IphonePortfolioFrame({ children }: { children: ReactNode }) {
  const s = IP.screen;
  return (
    <div
      className="relative w-[min(260px,78vw)] shrink-0 mx-auto"
      style={{ aspectRatio: `${IP.aspect}` }}
    >
      <div
        className="absolute z-0 overflow-hidden rounded-[1.85rem] bg-black"
        style={{
          left: `${s.leftPct}%`,
          top: `${s.topPct}%`,
          width: `${s.widthPct}%`,
          height: `${s.heightPct}%`,
        }}
      >
        {children}
      </div>
      <Image
        src="/device-frames/iphone-14-pro-black.png"
        alt=""
        width={1311}
        height={2672}
        className="absolute inset-0 z-10 h-full w-full select-none object-fill pointer-events-none"
        priority={false}
        sizes="260px"
      />
    </div>
  );
}
