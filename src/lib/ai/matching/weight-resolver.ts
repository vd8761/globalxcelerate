import type { MatchWeights } from '../types';
import { DEFAULT_WEIGHTS, OPPORTUNITY_TYPE_WEIGHTS } from '../constants/matching-weights';

/**
 * Resolve the appropriate weights for a given opportunity type.
 */
export function resolveWeights(opportunityType?: string): MatchWeights {
  if (!opportunityType) return DEFAULT_WEIGHTS;

  const typeWeights = OPPORTUNITY_TYPE_WEIGHTS[opportunityType];
  if (!typeWeights) return DEFAULT_WEIGHTS;

  // Validate weights sum to ~1.0
  const sum = Object.values(typeWeights).reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1.0) > 0.01) {
    console.warn(`Weights for ${opportunityType} sum to ${sum}, using defaults`);
    return DEFAULT_WEIGHTS;
  }

  return typeWeights;
}
