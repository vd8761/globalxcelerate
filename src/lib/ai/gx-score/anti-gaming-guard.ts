import { GX_SCORE_CONFIG } from '@/lib/config/scoring';

interface AntiGamingResult {
  cappedScore: number;
  capped: boolean;
  originalDelta: number;
}

/**
 * Enforce anti-gaming protection: daily cap and per-dimension cap.
 */
export function enforceAntiGaming(
  currentScore: number,
  newScore: number,
  dailyChangeApplied: number,
  config = GX_SCORE_CONFIG
): AntiGamingResult {
  const originalDelta = newScore - currentScore;

  // If score decreased, don't cap (allow natural decay)
  if (originalDelta <= 0) {
    return { cappedScore: newScore, capped: false, originalDelta };
  }

  // Check daily cap
  const remainingDailyBudget = Math.max(0, config.anti_gaming_daily_cap - dailyChangeApplied);

  if (remainingDailyBudget <= 0) {
    return { cappedScore: currentScore, capped: true, originalDelta };
  }

  // Cap the increase
  const allowedDelta = Math.min(originalDelta, remainingDailyBudget, config.anti_gaming_dimension_cap);
  const cappedScore = currentScore + allowedDelta;

  return {
    cappedScore: Math.min(100, cappedScore),
    capped: allowedDelta < originalDelta,
    originalDelta,
  };
}
