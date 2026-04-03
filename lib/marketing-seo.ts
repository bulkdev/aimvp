/** SEO copy for the marketing homepage only — not used on client-generated sites. */

export const MARKETING_BRAND = "Website by Jay";

/** Cities / region for local SEO (North Shore MA + Greater Boston). */
export const MARKETING_SERVICE_CITIES = [
  "Lynn",
  "Salem",
  "Peabody",
  "Revere",
  "Chelsea",
  "Everett",
  "Saugus",
  "Boston",
] as const;

export const MARKETING_REGION_LABEL = "North Shore of Massachusetts & Greater Boston";

export function marketingLocalKeywords(): string[] {
  return [
    "Website by Jay",
    "web design North Shore MA",
    "small business website Massachusetts",
    "Lynn MA web design",
    "Salem MA website designer",
    "Boston area web design",
    "Peabody Revere Chelsea Everett web design",
    "Saugus MA website",
  ];
}

/** Tuned for SERP snippet length (~150–160 chars). */
export function marketingHomeDescription(): string {
  return `${MARKETING_BRAND}: web design & SEO for North Shore MA & Greater Boston — Lynn, Salem, Peabody, Revere, Chelsea, Everett, Saugus, Boston & nearby. One person, real support.`;
}

export function marketingHomeTitle(): string {
  return `${MARKETING_BRAND} | Web Design & SEO | North Shore MA & Boston Area`;
}
