"use client";

import type { GeneratedSiteContent, IntakeFormData, Project } from "@/types";
import { buildAreaUrl } from "@/lib/seo";
import { intakeLocationLine } from "@/lib/location";

interface Props {
  content: GeneratedSiteContent;
  intake?: IntakeFormData;
  isPlumbing?: boolean;
  /** Plumbing Flow template: dark section + cyan-accent cards */
  plumbingFlow?: boolean;
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

export default function ServicesSection({
  content,
  intake,
  isPlumbing = false,
  plumbingFlow = false,
  linkProject,
}: Props) {
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

  const flow = plumbingFlow;

  return (
    <section
      id="services"
      style={{
        background: flow ? "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)" : "#f8f9fc",
        padding: "96px 0",
      }}
    >
      <div className="px-6 md:px-12 lg:px-24 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="section-label"
            style={flow ? { color: "color-mix(in srgb, var(--accent) 75%, #67e8f9)" } : undefined}
          >
            What We Offer
          </span>
          <h2
            style={{
              fontFamily: "var(--h-font)",
              fontSize: "clamp(1.8rem, 3.5vw, 2.75rem)",
              fontWeight: 700,
              color: flow ? "#f8fafc" : "var(--primary)",
              marginBottom: "16px",
              letterSpacing: "-0.02em",
            }}
          >
            Our Services
          </h2>
          {isPlumbing && (
            <p
              style={{
                color: flow ? "rgba(226,232,240,0.88)" : "#4b5563",
                maxWidth: "760px",
                margin: "0 auto 8px",
                lineHeight: 1.7,
              }}
            >
              {content.brandName} provides fast, reliable plumbing services in {city} and nearby areas.
            </p>
          )}
          <div className="accent-bar" style={{ margin: "0 auto 0", background: flow ? "color-mix(in srgb, var(--accent) 70%, #22d3ee)" : undefined }} />
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
                border: flow ? "1px solid rgba(103,232,249,0.22)" : "1px solid rgba(15,23,42,0.08)",
                background: flow ? "rgba(15,23,42,0.55)" : "#ffffff",
                boxShadow: flow ? "0 12px 40px rgba(0,0,0,0.35)" : "0 8px 24px rgba(15,23,42,0.06)",
                backdropFilter: flow ? "blur(8px)" : undefined,
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--h-font)",
                  fontSize: "1.45rem",
                  color: flow ? "#f1f5f9" : "var(--primary)",
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
                  <li
                    key={item}
                    className="text-[0.98rem] flex items-start gap-2"
                    style={{ color: flow ? "#e2e8f0" : "#1f2937" }}
                  >
                    <span
                      aria-hidden="true"
                      className="inline-flex items-center justify-center mt-[2px] w-4 h-4 rounded-full text-white text-[11px] font-bold leading-none"
                      style={{
                        background: flow
                          ? "linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 60%, #0891b2))"
                          : "var(--accent)",
                      }}
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
                  color: flow ? "color-mix(in srgb, var(--accent) 85%, #67e8f9)" : "var(--accent)",
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
                border: flow ? "1px solid rgba(103,232,249,0.2)" : "1px solid rgba(15,23,42,0.08)",
                background: flow ? "rgba(15,23,42,0.5)" : "#ffffff",
                boxShadow: flow ? "0 12px 32px rgba(0,0,0,0.25)" : "0 8px 24px rgba(15,23,42,0.06)",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--h-font)",
                  fontSize: "1.2rem",
                  color: flow ? "#f1f5f9" : "var(--primary)",
                  marginBottom: "12px",
                }}
              >
                Areas We Serve
              </h3>
              <div className="flex flex-wrap gap-2">
                {serviceAreas.map((area) => {
                  const link = areaLinks.find((l) => l.label === area);
                  const pill = {
                    display: "inline-block" as const,
                    background: flow
                      ? "color-mix(in srgb, var(--accent) 18%, rgba(15,23,42,0.9))"
                      : "color-mix(in srgb, var(--accent) 10%, #e2e8f0)",
                    color: flow ? "#e2e8f0" : "var(--primary)",
                    padding: "8px 14px",
                    borderRadius: 999,
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    border: flow ? "1px solid rgba(103,232,249,0.25)" : "1px solid rgba(15, 23, 42, 0.08)",
                  };
                  return link ? (
                    <a key={area} href={link.href} style={{ ...pill, textDecoration: "none" }}>
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
