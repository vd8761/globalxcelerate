import { createAIClient } from '../shared/ai-client';
import type { MatchDimensions, SkillGap } from '../types';

/**
 * Generate a natural language explanation of match score.
 */
export async function generateExplanation(
  scoreData: {
    composite_score: number;
    dimensions: MatchDimensions;
    skill_gaps: SkillGap[];
  },
  studentProfile: { name?: string; skills?: string[] },
  opportunity: { title?: string }
): Promise<{ explanation: string; improvement_suggestions: string[] }> {
  const ai = createAIClient();

  const dimensionSummary = Object.entries(scoreData.dimensions)
    .map(([key, dim]) => `${dim.label}: ${dim.score}/100 (weight: ${Math.round(dim.weight * 100)}%)`)
    .join('\n');

  const gapSummary = scoreData.skill_gaps.length > 0
    ? `Missing/weak skills: ${scoreData.skill_gaps.map(g => g.skill_name).join(', ')}`
    : 'No significant skill gaps identified.';

  const prompt = `Analyze this match score and provide a brief, encouraging explanation:

Overall Match: ${scoreData.composite_score}%
Opportunity: ${opportunity.title || 'Unknown'}

Dimension Breakdown:
${dimensionSummary}

${gapSummary}

Provide:
1. A 2-3 sentence explanation of the match quality
2. Top 2-3 specific improvement suggestions

Format your response as:
EXPLANATION: [your explanation]
SUGGESTIONS:
- [suggestion 1]
- [suggestion 2]
- [suggestion 3]`;

  try {
    const text = await ai.generateText(prompt, { maxTokens: 500, temperature: 0.6 });

    const explanationMatch = text.match(/EXPLANATION:\s*(.+?)(?=SUGGESTIONS:|$)/s);
    const suggestionsMatch = text.match(/SUGGESTIONS:\s*(.+?)$/s);

    const explanation = explanationMatch?.[1]?.trim() || text.trim();
    const suggestions = suggestionsMatch?.[1]
      ?.split('\n')
      .map(s => s.replace(/^-\s*/, '').trim())
      .filter(Boolean) || [];

    return { explanation, improvement_suggestions: suggestions };
  } catch {
    return {
      explanation: `Your match score of ${scoreData.composite_score}% indicates ${scoreData.composite_score >= 75 ? 'a strong' : scoreData.composite_score >= 50 ? 'a moderate' : 'some'} alignment with this opportunity. Focus on strengthening your weaker dimensions to improve your score.`,
      improvement_suggestions: scoreData.skill_gaps.slice(0, 3).map(g => `Develop proficiency in ${g.skill_name}`),
    };
  }
}
