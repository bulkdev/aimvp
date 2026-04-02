import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SiteTheme, IntakeFormData } from "@/types";
import { resolveSiteVariant } from "@/lib/siteVariant";

// ─── Tailwind class merging ───────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Default theme palette ───────────────────────────────────────────────────
// Used when logo color extraction is not available.
// Swap this with real color extraction (e.g. node-vibrant) later.

export const DEFAULT_THEMES: Record<string, SiteTheme> = {
  modern: {
    primaryColor: "#0f172a",
    secondaryColor: "#1e3a5f",
    accentColor: "#3b82f6",
    fontHeading: "'Playfair Display', Georgia, serif",
    fontBody: "'DM Sans', system-ui, sans-serif",
    style: "modern",
  },
  bold: {
    primaryColor: "#1a1a2e",
    secondaryColor: "#16213e",
    accentColor: "#e94560",
    fontHeading: "'Oswald', Impact, sans-serif",
    fontBody: "'Nunito', system-ui, sans-serif",
    style: "bold",
  },
  classic: {
    primaryColor: "#2d3748",
    secondaryColor: "#4a5568",
    accentColor: "#d69e2e",
    fontHeading: "'Merriweather', Georgia, serif",
    fontBody: "'Lato', system-ui, sans-serif",
    style: "classic",
  },
  minimal: {
    primaryColor: "#111827",
    secondaryColor: "#374151",
    accentColor: "#10b981",
    fontHeading: "'Inter', system-ui, sans-serif",
    fontBody: "'Inter', system-ui, sans-serif",
    style: "minimal",
  },
  /** Trade / plumbing: deep navy, high-contrast CTAs (common on pro contractor sites) */
  plumbing: {
    primaryColor: "#0b1220",
    secondaryColor: "#152642",
    accentColor: "#ea580c",
    fontHeading: "'Oswald', 'Arial Narrow', sans-serif",
    fontBody: "'DM Sans', system-ui, sans-serif",
    style: "bold",
  },
  /** Multi-trade home services: navy + warm orange (HVAC/plumbing contractor style) */
  superService: {
    primaryColor: "#0c1e3d",
    secondaryColor: "#1a3a5c",
    accentColor: "#e85d04",
    fontHeading: "'Oswald', 'Arial Narrow', sans-serif",
    fontBody: "'DM Sans', system-ui, sans-serif",
    style: "bold",
  },
};

/**
 * Theme for a full intake (respects explicit site template + description).
 */
export function pickThemeFromIntake(intake: IntakeFormData): SiteTheme {
  const v = resolveSiteVariant(intake.businessDescription, intake.siteTemplate ?? "auto", intake.companyName);
  if (v === "superService") {
    return DEFAULT_THEMES.superService;
  }
  if (v === "plumbing") {
    return DEFAULT_THEMES.plumbing;
  }
  return pickTheme(intake.businessDescription);
}

/**
 * Picks a theme based on a business description keyword match.
 * Does not apply the plumbing trade palette — use {@link pickThemeFromIntake} for previews/generation.
 */
export function pickTheme(description: string): SiteTheme {
  const lower = description.toLowerCase();
  if (
    lower.includes("law") ||
    lower.includes("finance") ||
    lower.includes("account") ||
    lower.includes("consult")
  ) {
    return DEFAULT_THEMES.classic;
  }
  if (
    lower.includes("gym") ||
    lower.includes("fitness") ||
    lower.includes("sport") ||
    lower.includes("repair")
  ) {
    return DEFAULT_THEMES.bold;
  }
  if (
    lower.includes("salon") ||
    lower.includes("spa") ||
    lower.includes("wellness") ||
    lower.includes("yoga")
  ) {
    return DEFAULT_THEMES.minimal;
  }
  return DEFAULT_THEMES.modern;
}

// ─── CSS variable injection for preview ──────────────────────────────────────

export function buildThemeCssVars(theme: SiteTheme): Record<string, string> {
  return {
    "--color-primary": theme.primaryColor,
    "--color-secondary": theme.secondaryColor,
    "--color-accent": theme.accentColor,
    "--font-heading": theme.fontHeading,
    "--font-body": theme.fontBody,
  };
}

// ─── Text helpers ─────────────────────────────────────────────────────────────

export function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen - 3) + "..." : str;
}
