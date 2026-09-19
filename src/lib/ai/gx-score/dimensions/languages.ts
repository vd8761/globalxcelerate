/**
 * Score Languages dimension.
 * Factors: count, proficiency levels, rare language bonus.
 */
const RARE_LANGUAGES = ['mandarin', 'japanese', 'korean', 'arabic', 'russian', 'hindi', 'chinese'];

const PROFICIENCY_SCALE: Record<string, number> = {
  a1: 10, a2: 25, b1: 40, b2: 60, c1: 80, c2: 100, native: 100,
  beginner: 15, intermediate: 45, advanced: 75, fluent: 90,
};

export function scoreLanguages(profile: Record<string, unknown>): number {
  const languages = (profile.languages || []) as Array<{
    name: string;
    proficiency?: string;
    level?: string;
  }>;

  if (!languages || languages.length === 0) return 5;

  const PER_LANGUAGE_BASE = 15;
  let total = 0;

  for (const lang of languages) {
    const level = ((lang.proficiency || lang.level || 'B1').toLowerCase());
    const profScore = PROFICIENCY_SCALE[level] || 40;
    let langScore = PER_LANGUAGE_BASE + (profScore * 0.4);

    // Rare language bonus
    if (RARE_LANGUAGES.some(r => lang.name.toLowerCase().includes(r))) {
      langScore += 10;
    }

    total += langScore;
  }

  return Math.min(100, Math.max(0, Math.round(total)));
}
