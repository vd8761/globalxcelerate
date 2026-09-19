import type { SupabaseClient } from '@supabase/supabase-js';
import type { BatchJobResult, CandidateRank } from '../types';
import { calculateMatchScore } from './calculate-match-score';

/**
 * Process batch matching for an opportunity — find top matching students.
 */
export async function processBatchMatching(
  opportunityId: string,
  limit: number = 100,
  minScore: number = 0,
  supabase: SupabaseClient
): Promise<BatchJobResult> {
  const jobId = crypto.randomUUID();

  // Fetch eligible students
  const { data: students } = await supabase
    .from('student_profiles')
    .select('user_id, first_name, last_name, profile_photo_url')
    .eq('open_to_opportunities', true)
    .eq('onboarding_completed', true)
    .limit(limit);

  if (!students || students.length === 0) {
    return {
      job_id: jobId,
      status: 'completed',
      matches_calculated: 0,
      top_score: 0,
      median_score: 0,
      candidates: [],
    };
  }

  // Process in chunks of 10
  const CHUNK_SIZE = 10;
  const results: CandidateRank[] = [];

  for (let i = 0; i < students.length; i += CHUNK_SIZE) {
    const chunk = students.slice(i, i + CHUNK_SIZE);
    const promises = chunk.map(async (student) => {
      try {
        const result = await calculateMatchScore(student.user_id, opportunityId, supabase);
        if (result.composite_score >= minScore) {
          return {
            student_id: student.user_id,
            student_name: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
            avatar_url: student.profile_photo_url,
            composite_score: result.composite_score,
            dimensions: result.dimensions,
            top_skills: result.skill_gaps
              .filter(g => g.proficiency_current !== null)
              .slice(0, 5)
              .map(g => g.skill_name),
            skill_gaps_count: result.skill_gaps.filter(g => !g.proficiency_current).length,
          } satisfies CandidateRank;
        }
        return null;
      } catch {
        return null;
      }
    });

    const chunkResults = await Promise.allSettled(promises);
    for (const r of chunkResults) {
      if (r.status === 'fulfilled' && r.value) {
        results.push(r.value);
      }
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.composite_score - a.composite_score);
  const scores = results.map(r => r.composite_score);

  return {
    job_id: jobId,
    status: 'completed',
    matches_calculated: results.length,
    top_score: scores[0] || 0,
    median_score: scores.length > 0 ? scores[Math.floor(scores.length / 2)] : 0,
    candidates: results,
  };
}
