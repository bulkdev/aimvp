import type { IntakeFormData, Project } from "@/types";
import { intakeAddressParts } from "@/lib/location";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Single path segment reserved for system routes — cannot be a customer `publicSlug`. */
export const RESERVED_PUBLIC_URL_SLUGS = new Set([
  "admin",
  "api",
  "preview",
  "site",
  "p",
  "www",
  "favicon.ico",
  "robots",
  "sitemap",
  "manifest",
  "opengraph-image",
  "twitter-image",
  "icon",
  "_next",
  "static",
]);

export function normalizePublicSlug(input: string): string {
  return slugify(input.trim());
}

export function isReservedPublicSlug(slug: string): boolean {
  const s = slug.trim().toLowerCase();
  if (!s || s.includes(".")) return true;
  return RESERVED_PUBLIC_URL_SLUGS.has(s);
}

/** Whether `slug` is allowed as `project.publicSlug` (non-empty, not reserved, safe characters). */
export function isValidCustomerPublicSlug(slug: string): boolean {
  const n = normalizePublicSlug(slug);
  if (n.length < 2 || n.length > 80) return false;
  if (isReservedPublicSlug(n)) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(n);
}

export function appBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/** Published `/site/*`, sitemap URLs, and robots allowlisting are on by default. Set `NEXT_PUBLIC_ENABLE_PUBLIC_PAGES=false` to disable (e.g. staging). */
export function publicPagesEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_PUBLIC_PAGES !== "false";
}

/** Published site base path: `/{publicSlug}` when set, otherwise `/site/{id}`. */
export function buildPublishedBasePath(project: Pick<Project, "id" | "publicSlug">): string {
  const slug = project.publicSlug?.trim();
  if (slug) return `/${slug}`;
  return `/site/${project.id}`;
}

export function buildServiceUrl(project: Pick<Project, "id" | "publicSlug">, serviceName: string): string {
  return `${buildPublishedBasePath(project)}/services/${slugify(serviceName)}`;
}

export function buildAreaUrl(project: Pick<Project, "id" | "publicSlug">, areaName: string): string {
  return `${buildPublishedBasePath(project)}/areas/${slugify(areaName)}`;
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
