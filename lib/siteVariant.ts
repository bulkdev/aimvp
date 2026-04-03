import type { SiteTemplateChoice } from "@/types";

/**
 * Which visual / copy template to use for the generated site.
 * Extend with new trades (HVAC, electrical, etc.) as you add layouts.
 */
export type SiteTemplateVariant = "default" | "plumbing" | "superService" | "renovations";

/** Keyword-based inference when the user leaves template on "auto". */
export function inferSiteVariant(description: string, companyName = ""): SiteTemplateVariant {
  const lower = `${description} ${companyName}`.toLowerCase();

  const superServiceSignals = [
    "hvac",
    "heating and cooling",
    "heating & cooling",
    "furnace",
    "air conditioning",
    "a/c repair",
    "heat pump",
    "cooling and heating",
    "plumbing and heating",
    "heating and plumbing",
  ];
  for (const word of superServiceSignals) {
    if (lower.includes(word)) return "superService";
  }

  const renovationSignals = [
    "full-service home",
    "full service home",
    "commercial renovation",
    "home renovation",
    "home & commercial",
    "renovation",
    "renovate",
    "remodel",
    "remodeling",
    "general contractor",
    "design-build",
    "design build",
    "kitchen remodel",
    "bathroom remodel",
    "tenant improvement",
    "build-out",
    "buildout",
    "commercial build",
  ];
  for (const word of renovationSignals) {
    if (lower.includes(word)) return "renovations";
  }

  const plumbingSignals = [
    "plumb",
    "pluming",
    "plumber",
    "drainage",
    "drain clean",
    "drain cleaning",
    "water heater",
    "repipe",
    "re-pipe",
    "sewer",
    "clog",
    "hydro jet",
    "backflow",
    "sump pump",
    "garbage disposal",
    "pipe burst",
    "burst pipe",
    "leak repair",
    "toilet",
    "faucet",
    "fixture install",
  ];

  for (const word of plumbingSignals) {
    if (lower.includes(word)) return "plumbing";
  }

  if (/\bdrains?\b/.test(lower) || /\bpipes?\b/.test(lower)) return "plumbing";

  return "default";
}

/** Use explicit form choice when set; otherwise infer from description + company name. */
export function resolveSiteVariant(
  description: string,
  choice: SiteTemplateChoice | undefined,
  companyName = ""
): SiteTemplateVariant {
  if (choice === "super-service") return "superService";
  if (choice === "renovations") return "renovations";
  if (choice === "plumbing" || choice === "plumbing-split" || choice === "plumbing-boxed" || choice === "plumbing-flow") {
    return "plumbing";
  }
  if (choice === "default") return "default";
  return inferSiteVariant(description, companyName);
}
