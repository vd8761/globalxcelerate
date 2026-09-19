import type { DimensionScore } from '../types';

interface Experience {
  title: string;
  description?: string;
  skills?: string[];
  start_date: string;
  end_date?: string;
  type?: string;
}

interface OpportunityForExperience {
  title: string;
  description?: string;
  requirements?: { skills?: Array<{ name: string }> };
}

/**
 * Calculate experience dimension score using recency-weighted relevance.
 */
export function calculateExperienceScore(
  studentExperiences: Experience[],
  opportunity: OpportunityForExperience
): DimensionScore {
  if (!studentExperiences || studentExperiences.length === 0) {
    return { score: 0, weight: 0, weighted_score: 0, label: 'Experience' };
  }

  const now = Date.now();
  const opportunityKeywords = extractKeywords(opportunity);
  let totalScore = 0;

  for (const exp of studentExperiences) {
    const endDate = exp.end_date ? new Date(exp.end_date).getTime() : now;
    const monthsAgo = (now - endDate) / (1000 * 60 * 60 * 24 * 30);

    // Recency multiplier
    let recencyMultiplier: number;
    if (monthsAgo <= 12) recencyMultiplier = 1.0;
    else if (monthsAgo <= 24) recencyMultiplier = 0.7;
    else if (monthsAgo <= 36) recencyMultiplier = 0.4;
    else recencyMultiplier = 0.2;

    // Relevance via keyword overlap
    const expKeywords = new Set([
      ...extractWords(exp.title),
      ...extractWords(exp.description || ''),
      ...(exp.skills || []).map(s => s.toLowerCase()),
    ]);

    const overlap = opportunityKeywords.filter(k => expKeywords.has(k)).length;
    const relevance = opportunityKeywords.length > 0
      ? overlap / opportunityKeywords.length
      : 0.5;

    totalScore += recencyMultiplier * relevance * 30;
  }

  const score = Math.min(100, Math.max(0, Math.round(totalScore)));
  return { score, weight: 0, weighted_score: 0, label: 'Experience' };
}

function extractKeywords(opportunity: OpportunityForExperience): string[] {
  const words = new Set<string>();
  extractWords(opportunity.title).forEach(w => words.add(w));
  extractWords(opportunity.description || '').forEach(w => words.add(w));
  opportunity.requirements?.skills?.forEach(s => words.add(s.name.toLowerCase()));
  return Array.from(words);
}

function extractWords(text: string): string[] {
  return text.toLowerCase().split(/\W+/).filter(w => w.length > 3);
}
