import React from "react";
import type { Project } from "@/types";
import { buildThemeCssVars } from "@/lib/utils";
import { resolveSiteVariant } from "@/lib/siteVariant";
import NavbarSection from "./sections/NavbarSection";
import HeroSection from "./sections/HeroSection";
import PlumbingHeroSection from "./sections/PlumbingHeroSection";
import ServicesSection from "./sections/ServicesSection";
import PortfolioSection from "./sections/PortfolioSection";
import AboutSection from "./sections/AboutSection";
import FaqSection from "./sections/FaqSection";
import ContactSection from "./sections/ContactSection";
import BookingSection from "./sections/BookingSection";
import PaymentSection from "./sections/PaymentSection";
import FooterSection from "./sections/FooterSection";
import CtaBanner from "./sections/CtaBanner";

interface Props {
  project: Project;
}

export default function SiteTemplate({ project }: Props) {
  const { content, intake } = project;
  const cssVars = buildThemeCssVars(content.theme);
  const variant = resolveSiteVariant(
    intake.businessDescription,
    intake.siteTemplate ?? "auto",
    intake.companyName
  );

  return (
    <div
      style={cssVars as React.CSSProperties}
      className="preview-root"
    >
      {/* Google Fonts for the selected theme */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&family=Lato:wght@300;400;700&family=Oswald:wght@400;500;600&family=Nunito:wght@400;600;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&display=swap');

        .preview-root {
          --primary: var(--color-primary, #0f172a);
          --secondary: var(--color-secondary, #1e3a5f);
          --accent: var(--color-accent, #3b82f6);
          --h-font: var(--font-heading, 'Playfair Display', Georgia, serif);
          --b-font: var(--font-body, 'DM Sans', system-ui, sans-serif);

          font-family: var(--b-font);
          color: #1a1a2a;
          background: #ffffff;
        }

        .preview-root h1,
        .preview-root h2,
        .preview-root h3,
        .preview-root h4 {
          font-family: var(--h-font);
        }

        .btn-primary {
          background: var(--accent);
          color: white;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          display: inline-block;
          transition: all 0.2s;
          text-decoration: none;
          border: none;
          cursor: pointer;
        }
        .btn-primary:hover { filter: brightness(1.15); transform: translateY(-1px); }

        .btn-outline {
          background: transparent;
          color: var(--accent);
          padding: 13px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          display: inline-block;
          transition: all 0.2s;
          text-decoration: none;
          border: 2px solid var(--accent);
          cursor: pointer;
        }
        .btn-outline:hover { background: var(--accent); color: white; }

        .section-label {
          font-family: var(--b-font);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--accent);
          display: block;
          margin-bottom: 12px;
        }

        .accent-bar {
          width: 48px;
          height: 3px;
          background: var(--accent);
          border-radius: 2px;
          margin: 16px 0 24px;
        }
      `}</style>

      <NavbarSection content={content} intake={intake} />
      {variant === "plumbing" ? (
        <PlumbingHeroSection content={content} intake={intake} />
      ) : (
        <HeroSection content={content} intake={intake} />
      )}
      <ServicesSection content={content} />
      <PortfolioSection content={content} />
      <AboutSection content={content} />

      {/* Booking placeholder — only shown if user enabled it */}
      {intake.bookingEnabled && <BookingSection content={content} />}

      <FaqSection content={content} />
      <CtaBanner content={content} intake={intake} />

      {/* Payment placeholder — only shown if user enabled it */}
      {intake.paymentEnabled && <PaymentSection content={content} />}

      <ContactSection content={content} intake={intake} />
      <FooterSection content={content} intake={intake} />
    </div>
  );
}
