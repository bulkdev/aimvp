"use client";

import type { GeneratedSiteContent, IntakeFormData, Project } from "@/types";
import { buildAreaUrl } from "@/lib/seo";
import { intakeLocationLine } from "@/lib/location";

interface Props {
  content: GeneratedSiteContent;
  intake?: IntakeFormData;
  isPlumbing?: boolean;
  /** When set, service-area links use the short `/{publicSlug}` path when configured. */
  linkProject?: Pick<Project, "id" | "publicSlug">;
}

const DEFAULT_GROUPS = [
  {
    title: "Plumbing Services",
    items: [
      "Residential Plumbing",
      "Water Heater",
      "Repiping & Pipe Repair",
      "Drain Cleaning",
      "Sewer Repair",
      "Sump Pumps",
      "Water Filtration",
      "Leak Detection",
    ],
  },
  {
    title: "Heating Services",
    items: [
      "Boilers",
      "Heating Maintenance",
      "Oil-to-Gas Conversion",
      "Commercial Heating",
      "Carbon Monoxide Testing",
    ],
  },
];

function nearbyAreas(city?: string): string[] {
  if (!city) return ["Surrounding neighborhoods", "Nearby communities", "Greater metro area"];
  const clean = city.split(",")[0]?.trim() || city;
  return [clean, `${clean} Downtown`, `${clean} North`, `${clean} South`, "Nearby communities"];
}

export default function ServicesSection({ content, intake, isPlumbing = false, linkProject }: Props) {
  const configuredGroups =
    content.assets?.serviceGroups
      ?.filter((g) => g.title.trim() && g.items.some((item) => item.trim()))
      .map((g) => ({
      title: g.title.trim(),
      items: g.items.map((item) => item.trim()).filter(Boolean),
    })) ?? [];
  const groups = configuredGroups.length > 0 ? configuredGroups : DEFAULT_GROUPS;
  const locationLine = intake ? intakeLocationLine(intake) : "";
  const city = locationLine || "your area";
  const serviceAreas =
    content.assets?.serviceAreas?.map((a) => a.trim()).filter(Boolean) ?? nearbyAreas(intake?.city);
  const areaLinks =
    linkProject && isPlumbing
      ? serviceAreas.slice(0, 8).map((area) => ({ label: area, href: buildAreaUrl(linkProject, area) }))
      : [];

  return (
    <section
      id="services"
      style={{ background: "#f8f9fc", padding: "96px 0" }}
    >
      <div className="px-6 md:px-12 lg:px-24 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="section-label">What We Offer</span>
          <h2
            style={{
              fontFamily: "var(--h-font)",
              fontSize: "clamp(1.8rem, 3.5vw, 2.75rem)",
              fontWeight: 700,
              color: "var(--primary)",
              marginBottom: "16px",
              letterSpacing: "-0.02em",
            }}
          >
            Our Services
          </h2>
          {isPlumbing && (
            <p style={{ color: "#4b5563", maxWidth: "760px", margin: "0 auto 8px", lineHeight: 1.7 }}>
              {content.brandName} provides fast, reliable plumbing services in {city} and nearby areas.
            </p>
          )}
          <div className="accent-bar" style={{ margin: "0 auto 0" }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            ...groups,
          ].map((group) => (
            <div
              key={group.title}
              style={{
                borderRadius: "16px",
                padding: "28px 24px",
                border: "1px solid rgba(15,23,42,0.08)",
                background: "#ffffff",
                boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--h-font)",
                  fontSize: "1.45rem",
                  color: "var(--primary)",
                  marginBottom: "14px",
                }}
              >
                {group.title}
              </h3>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "grid",
                  gap: "8px",
                }}
              >
                {group.items.map((item) => (
                  <li key={item} className="text-[0.98rem] flex items-start gap-2" style={{ color: "#1f2937" }}>
                    <span
                      aria-hidden="true"
                      className="inline-flex items-center justify-center mt-[2px] w-4 h-4 rounded-full text-white text-[11px] font-bold leading-none"
                      style={{ background: "var(--accent)" }}
                    >
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                style={{
                  marginTop: "16px",
                  display: "inline-block",
                  fontWeight: 700,
                  color: "var(--accent)",
                  textDecoration: "none",
                }}
              >
                See more
              </a>
            </div>
          ))}
        </div>

        {isPlumbing && (
          <div className="mt-8">
            <div
              style={{
                borderRadius: "16px",
                padding: "24px 22px",
                border: "1px solid rgba(15,23,42,0.08)",
                background: "#ffffff",
                boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
              }}
            >
              <h3 style={{ fontFamily: "var(--h-font)", fontSize: "1.2rem", color: "var(--primary)", marginBottom: "12px" }}>
                Areas We Serve
              </h3>
              <div className="flex flex-wrap gap-2">
                {serviceAreas.map((area) => {
                  const link = areaLinks.find((l) => l.label === area);
                  const pill = {
                    display: "inline-block" as const,
                    background: "color-mix(in srgb, var(--accent) 10%, #e2e8f0)",
                    color: "var(--primary)",
                    padding: "8px 14px",
                    borderRadius: 999,
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    border: "1px solid rgba(15, 23, 42, 0.08)",
                  };
                  return link ? (
                    <a key={area} href={link.href} style={{ ...pill, textDecoration: "none", color: "var(--primary)" }}>
                      {area}
                    </a>
                  ) : (
                    <span key={area} style={pill}>
                      {area}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
