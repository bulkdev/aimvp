"use client";

import type { GeneratedSiteContent, IntakeFormData } from "@/types";
import { normalizeNap } from "@/lib/seo";

export default function HairStudioFooter({
  content,
  intake,
}: {
  content: GeneratedSiteContent;
  intake: IntakeFormData;
}) {
  const nap = normalizeNap(intake);
  const ig = content.assets?.socialLinks?.instagram;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.07] bg-[#030304] py-14">
      <div className="mx-auto max-w-[1400px] px-4 md:px-10 flex flex-col md:flex-row justify-between gap-10">
        <div>
          <p className="text-xl font-semibold text-[#f4f1ea]" style={{ fontFamily: "var(--font-hds-display)" }}>
            {content.brandName}
          </p>
          <p className="mt-2 text-sm text-zinc-500 max-w-xs">{content.tagline}</p>
        </div>
        <div className="text-sm text-zinc-500 space-y-2">
          {nap.phone ? (
            <a href={`tel:${nap.phone.replace(/\D/g, "")}`} className="block hover:text-[#d4e157]">
              {nap.phone}
            </a>
          ) : null}
          {nap.email ? (
            <a href={`mailto:${nap.email}`} className="block hover:text-[#d4e157]">
              {nap.email}
            </a>
          ) : null}
          {ig ? (
            <a href={ig} target="_blank" rel="noreferrer" className="block hover:text-[#d4e157]">
              Instagram
            </a>
          ) : null}
        </div>
      </div>
      <p className="text-center text-[11px] text-zinc-700 mt-12">© {year} {content.brandName}. Crafted layout — not a generic theme.</p>
    </footer>
  );
}
