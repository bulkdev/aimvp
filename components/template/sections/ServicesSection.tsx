"use client";

import type { GeneratedSiteContent } from "@/types";
import ServiceIcon from "@/components/template/ServiceIcon";

interface Props {
  content: GeneratedSiteContent;
}

const SERVICE_STOCK: Record<string, string> = {
  plumbing: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1200&q=80",
  emergency: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
  drain: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=1200&q=80",
  water: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80",
  installation: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1200&q=80",
  maintenance: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80",
  cleaning: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1200&q=80",
  lawn: "https://images.unsplash.com/photo-1560749003-f4b1e17e2f31?auto=format&fit=crop&w=1200&q=80",
  landscaping: "https://images.unsplash.com/photo-1592417817038-d13fd7342605?auto=format&fit=crop&w=1200&q=80",
  salon: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
  beauty: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
  generic: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
};

function pickServiceImage(title: string, description: string, overrides?: Record<string, string>): string {
  const hay = `${title} ${description}`.toLowerCase();
  const normalizedTitle = title.trim().toLowerCase();
  if (overrides?.[normalizedTitle]) return overrides[normalizedTitle];
  if (hay.includes("emergency")) return SERVICE_STOCK.emergency;
  if (hay.includes("drain") || hay.includes("clog") || hay.includes("sewer")) return SERVICE_STOCK.drain;
  if (hay.includes("water heater") || hay.includes("water")) return SERVICE_STOCK.water;
  if (hay.includes("install")) return SERVICE_STOCK.installation;
  if (hay.includes("mainten") || hay.includes("inspection")) return SERVICE_STOCK.maintenance;
  if (hay.includes("plumb") || hay.includes("plum")) return SERVICE_STOCK.plumbing;
  if (hay.includes("clean")) return SERVICE_STOCK.cleaning;
  if (hay.includes("lawn")) return SERVICE_STOCK.lawn;
  if (hay.includes("landscap")) return SERVICE_STOCK.landscaping;
  if (hay.includes("salon") || hay.includes("hair")) return SERVICE_STOCK.salon;
  if (hay.includes("beauty") || hay.includes("spa")) return SERVICE_STOCK.beauty;
  return SERVICE_STOCK.generic;
}

export default function ServicesSection({ content }: Props) {
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
          <div className="accent-bar" style={{ margin: "0 auto 0" }} />
        </div>

        {/* Service Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "28px",
          }}
        >
          {content.services.map((service, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                borderRadius: "16px",
                padding: "36px 32px",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
                transition: "all 0.25s",
                cursor: "default",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.24)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 16px rgba(0,0,0,0.18)";
              }}
            >
              {/* Card background image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pickServiceImage(service.title, service.description, content.assets?.serviceCardImages)}
                alt=""
                aria-hidden
                style={{
                  position: "absolute",
                  inset: "-8px",
                  width: "calc(100% + 16px)",
                  height: "calc(100% + 16px)",
                  objectFit: "cover",
                  filter: "blur(1px)",
                  transform: "scale(1.03)",
                }}
              />
              {/* Gradient + blur glass overlay for readability */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(11,18,32,0.34) 0%, rgba(21,38,66,0.52) 48%, rgba(11,18,32,0.82) 100%)",
                  backdropFilter: "blur(0.8px)",
                }}
              />

              <div style={{ position: "relative", zIndex: 1 }}>
              {/* Icon */}
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  background: "color-mix(in srgb, var(--accent) 24%, transparent)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <ServiceIcon name={service.icon} color="var(--accent)" size={24} />
              </div>

              <h3
                style={{
                  fontFamily: "var(--h-font)",
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: "#ffffff",
                  marginBottom: "12px",
                }}
              >
                {service.title}
              </h3>

              <p style={{ color: "rgba(255,255,255,0.86)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                {service.description}
              </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
