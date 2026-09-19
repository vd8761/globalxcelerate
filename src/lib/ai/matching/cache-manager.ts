import type { SupabaseClient } from '@supabase/supabase-js';
import { GX_SCORE_CONFIG } from '@/lib/config/scoring';

interface CachedScore {
  id: string;
  student_id: string;
  opportunity_id: string;
  composite_score: number;
  dimension_scores: Record<string, unknown>;
  skill_gaps: Array<Record<string, unknown>>;
  explanation_text: string | null;
  explanation_generated_at: string | null;
  calculated_at: string;
  expires_at: string;
}

/**
 * Get cached match score if still valid (not expired).
 */
export async function getCachedScore(
  studentId: string,
  opportunityId: string,
  supabase: SupabaseClient
): Promise<CachedScore | null> {
  const { data, error } = await supabase
    .from('match_scores')
    .select('*')
    .eq('student_id', studentId)
    .eq('opportunity_id', opportunityId)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) return null;
  return data as CachedScore;
}

/**
 * Cache a match score result.
 */
export async function cacheScore(
  scoreData: {
    student_id: string;
    opportunity_id: string;
    composite_score: number;
    dimension_scores: Record<string, unknown>;
    skill_gaps: Array<Record<string, unknown>>;
    explanation_text?: string;
  },
  supabase: SupabaseClient
): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + GX_SCORE_CONFIG.match_cache_ttl_hours * 60 * 60 * 1000);

  await supabase
    .from('match_scores')
    .upsert(
      {
        student_id: scoreData.student_id,
        opportunity_id: scoreData.opportunity_id,
        composite_score: scoreData.composite_score,
        dimension_scores: scoreData.dimension_scores,
        skill_gaps: scoreData.skill_gaps,
        explanation_text: scoreData.explanation_text || null,
        explanation_generated_at: scoreData.explanation_text ? now.toISOString() : null,
        calculation_status: 'completed',
        calculated_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      },
      { onConflict: 'student_id,opportunity_id' }
    );
}

/**
 * Invalidate all cached scores for a student.
 */
export async function invalidateStudentScores(
  studentId: string,
  supabase: SupabaseClient
): Promise<void> {
  await supabase
    .from('match_scores')
    .update({ expires_at: new Date().toISOString(), calculation_status: 'stale' })
    .eq('student_id', studentId);
}

/**
 * Invalidate all cached scores for an opportunity.
 */
export async function invalidateOpportunityScores(
  opportunityId: string,
  supabase: SupabaseClient
): Promise<void> {
  await supabase
    .from('match_scores')
    .update({ expires_at: new Date().toISOString(), calculation_status: 'stale' })
    .eq('opportunity_id', opportunityId);
}
