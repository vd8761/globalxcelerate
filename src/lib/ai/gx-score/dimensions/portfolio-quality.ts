/**
 * Score Portfolio Quality dimension.
 * Factors: items count, variety, external links, recency.
 */
export function scorePortfolioQuality(profile: Record<string, unknown>): number {
  const items = (profile.portfolio_items || profile.projects || []) as Array<{
    section?: string;
    type?: string;
    external_url?: string;
    created_at?: string;
  }>;

  if (!items || items.length === 0) return 0;

  const PER_ITEM_BASE = 8;
  let total = 0;
  const sections = new Set<string>();

  for (const item of items) {
    let itemScore = PER_ITEM_BASE;

    // External link bonus
    if (item.external_url) itemScore += 5;

    // Recency
    if (item.created_at) {
      const monthsAgo = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsAgo < 6) itemScore *= 1.2;
    }

    total += itemScore;
    if (item.section || item.type) sections.add(item.section || item.type || '');
  }

  // Variety bonus
  if (sections.size >= 3) total += 10;
  else if (sections.size >= 2) total += 5;

  return Math.min(100, Math.max(0, Math.round(total)));
}
