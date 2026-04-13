"use client";

import { useEffect, useMemo, useState } from "react";
import type { Project } from "@/types";
import { normalizeNap } from "@/lib/seo";
import { intakeLocationLine } from "@/lib/location";
import {
  TINT_FALLBACK_HERO,
  TINT_FALLBACK_SECOND,
  firstHeroStillFromSlides,
  firstHeroVideoFromSlides,
} from "./tintLuxuryConstants";
import TintLuxuryNavbar from "./TintLuxuryNavbar";
import TintLuxuryHero from "./TintLuxuryHero";
import TintSimulatorSection from "./TintSimulatorSection";
import TintSpectralServices from "./TintSpectralServices";
import TintBeforeAfter from "./TintBeforeAfter";
import TintTrustBridge from "./TintTrustBridge";
import TintFaqGlass from "./TintFaqGlass";
import TintLuxuryContact from "./TintLuxuryContact";
import TintLuxuryFooter from "./TintLuxuryFooter";
import TintBookingSuite, { TintBookFloatingButton } from "./TintBookingSuite";

const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Syne:wght@400;600;700;800&display=swap";

export default function WindowTintLuxuryTemplate({ project }: { project: Project }) {
  const { content, intake } = project;
  const [bookOpen, setBookOpen] = useState(false);
  const nap = normalizeNap(intake);
  const cityLine = intakeLocationLine(intake);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    const id = "window-tint-luxury-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = FONT_LINK;
      document.head.appendChild(link);
    }
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  const { heroVideoUrl, posterUrl, stillForImageHero, simulatorCarUrl, beforeSrc, afterSrc, realPhotoPair } =
    useMemo(() => {
      const assets = content.assets;
      const slides = assets?.heroSlides;

      const explicitVideo = assets?.tintHeroVideoUrl?.trim();
      const slideVideo = firstHeroVideoFromSlides(slides);
      const heroVideoUrl = explicitVideo || slideVideo || null;

      const posterFromField = assets?.tintHeroVideoPosterUrl?.trim();
      const firstStill = firstHeroStillFromSlides(slides);
      const posterUrl = posterFromField || firstStill || TINT_FALLBACK_HERO;
      const stillForImageHero = firstStill || posterUrl || TINT_FALLBACK_HERO;
      const simulatorCarUrl = stillForImageHero;

      const tb = assets?.tintBeforeImageUrl?.trim();
      const ta = assets?.tintAfterImageUrl?.trim();
      const portfolio = assets?.portfolioProjects;
      const realPhotoPair = Boolean(tb && ta);
      const beforeSrc = tb || portfolio?.[0]?.[0] || TINT_FALLBACK_SECOND;
      const afterSrc = ta || portfolio?.[0]?.[1] || portfolio?.[1]?.[0] || TINT_FALLBACK_HERO;

      return {
        heroVideoUrl,
        posterUrl,
        stillForImageHero,
        simulatorCarUrl,
        beforeSrc,
        afterSrc,
        realPhotoPair,
      };
    }, [content.assets]);

  const stats = useMemo(() => content.assets?.siteStats ?? [], [content.assets?.siteStats]);

  return (
    <div
      className="window-tint-luxury-root min-h-screen bg-[#030306] text-zinc-100 antialiased selection:bg-violet-500/30 selection:text-white"
      style={
        {
          "--font-tint-display": "'Syne', system-ui, sans-serif",
          "--font-tint-body": "'Outfit', system-ui, sans-serif",
        } as React.CSSProperties
      }
    >
      <TintLuxuryNavbar brandName={content.brandName} onBook={() => setBookOpen(true)} />
      <main>
        <TintLuxuryHero
          title={content.hero.title}
          subtitle={content.hero.subtitle}
          ctaText={content.hero.ctaText}
          secondaryCta={content.hero.ctaSecondaryText}
          backgroundVideoUrl={heroVideoUrl}
          posterUrl={posterUrl}
          backgroundImageUrl={stillForImageHero}
          onPrimaryCta={() => setBookOpen(true)}
          onSecondaryCta={() => {
            document.getElementById("tint-simulator")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
        <TintSimulatorSection carImageUrl={simulatorCarUrl} />
        <TintSpectralServices services={content.services} onBook={() => setBookOpen(true)} />
        <TintBeforeAfter beforeSrc={beforeSrc} afterSrc={afterSrc} realPhotoPair={realPhotoPair} />
        <TintTrustBridge stats={stats} />
        <TintFaqGlass faqs={content.faqs} />
        <TintLuxuryContact
          heading={content.contact.heading}
          subheading={content.contact.subheading}
          phone={nap.phone}
          email={nap.email}
          cityLine={cityLine}
        />
        <TintLuxuryFooter brandName={content.brandName} />
      </main>
      <TintBookFloatingButton onClick={() => setBookOpen(true)} />
      <TintBookingSuite
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        brandName={content.brandName}
        phone={nap.phone}
        email={nap.email}
      />
    </div>
  );
}
