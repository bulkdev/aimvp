/** Saved in `assets.designVariants.ourWork` — controls Our Work / portfolio presentation. */
export type PortfolioLayoutMode = "masonry" | "grid-3" | "slider";

/** Legacy values from older saves map onto the three modes. */
export function normalizePortfolioLayout(raw: string | undefined): PortfolioLayoutMode {
  const v = raw ?? "masonry";
  if (v === "masonry" || v === "grid-3" || v === "slider") return v;
  if (v === "minimal-grid") return "grid-3";
  if (v === "cards" || v === "split-feature") return "masonry";
  return "masonry";
}

export const PORTFOLIO_LAYOUT_OPTIONS: { value: PortfolioLayoutMode; label: string; description: string }[] = [
  {
    value: "masonry",
    label: "Pinterest-style masonry",
    description: "Uneven, puzzle-style column layout",
  },
  {
    value: "grid-3",
    label: "3-column grid",
    description: "Uniform cards in three columns",
  },
  {
    value: "slider",
    label: "One photo slider",
    description: "Single large image with prev/next",
  },
];
