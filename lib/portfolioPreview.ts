/** Max photos / project cards on the home portfolio strip before the blurred “See more” tile. */
export const DEFAULT_PORTFOLIO_HOME_PREVIEW_COUNT = 8;

export function clampPortfolioHomePreviewCount(n: number | undefined): number {
  const v = n ?? DEFAULT_PORTFOLIO_HOME_PREVIEW_COUNT;
  return Math.min(48, Math.max(1, Math.round(v)));
}
