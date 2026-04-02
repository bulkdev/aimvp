import type { IntakeFormData } from "@/types";
import { intakeAddressParts } from "@/lib/location";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function appBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/** Published `/site/*`, sitemap URLs, and robots allowlisting are on by default. Set `NEXT_PUBLIC_ENABLE_PUBLIC_PAGES=false` to disable (e.g. staging). */
export function publicPagesEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_PUBLIC_PAGES !== "false";
}

export function buildPublishedBasePath(projectId: string): string {
  return `/site/${projectId}`;
}

export function buildServiceUrl(projectId: string, serviceName: string): string {
  return `${buildPublishedBasePath(projectId)}/services/${slugify(serviceName)}`;
}

export function buildAreaUrl(projectId: string, areaName: string): string {
  return `${buildPublishedBasePath(projectId)}/areas/${slugify(areaName)}`;
}

export function absoluteUrl(pathname: string): string {
  const base = appBaseUrl();
  return new URL(pathname, base).toString();
}

export type NormalizedNap = {
  businessName: string;
  phone?: string;
  email?: string;
  streetAddress?: string;
  /** Full "City, ST" for display */
  city?: string;
  addressLocality?: string;
  addressRegion?: string;
  fullAddress?: string;
};

export function normalizeNap(intake: IntakeFormData): NormalizedNap {
  const parts = intakeAddressParts(intake);
  const businessName = intake.companyName?.trim() || "";
  const streetAddress = intake.address?.trim() || undefined;
  const display = parts.display || undefined;
  const fullAddress = [streetAddress, display].filter(Boolean).join(", ") || undefined;
  const phone = intake.phone?.trim() || undefined;
  const email = intake.email?.trim() || undefined;
  return {
    businessName,
    phone,
    email,
    streetAddress,
    city: display,
    addressLocality: parts.locality,
    addressRegion: parts.region,
    fullAddress,
  };
}
