import type { SupabaseClient } from '@supabase/supabase-js';
import type { ScoreTriggerType } from '../types';

/**
 * Record a GX Score history entry.
 */
export async function recordScoreHistory(
  studentId: string,
  newScore: number,
  previousScore: number,
  triggerType: ScoreTriggerType,
  triggerDetails: string | null,
  capped: boolean,
  dimensionScores: Record<string, number>,
  supabase: SupabaseClient
): Promise<void> {
  const changeDelta = newScore - previousScore;

  await supabase.from('gx_score_history').insert({
    student_id: studentId,
    composite_score: newScore,
    dimension_scores: dimensionScores,
    grade_bracket: getGradeFromScore(newScore),
    change_delta: changeDelta,
    trigger_type: triggerType,
    trigger_details: triggerDetails,
    capped,
  });
}

function getGradeFromScore(score: number): string {
  if (score >= 85) return 'exceptional';
  if (score >= 70) return 'strong';
  if (score >= 50) return 'developing';
  if (score >= 30) return 'emerging';
  return 'beginner';
}
