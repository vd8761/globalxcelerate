import type { SupabaseClient } from '@supabase/supabase-js';
import type { RateLimitStatus } from '../types';
import { GX_SCORE_CONFIG } from '@/lib/config/scoring';

/**
 * Check if student has remaining message quota for the 24-hour window.
 */
export async function checkRateLimit(
  studentId: string,
  supabase: SupabaseClient
): Promise<RateLimitStatus> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  // Find active rate limit window
  const { data } = await supabase
    .from('copilot_rate_limits')
    .select('*')
    .eq('student_id', studentId)
    .gt('window_end', now.toISOString())
    .order('window_start', { ascending: false })
    .limit(1)
    .single();

  if (!data) {
    // No active window — allowed
    return {
      allowed: true,
      remaining: GX_SCORE_CONFIG.copilot_rate_limit,
      resets_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  const remaining = GX_SCORE_CONFIG.copilot_rate_limit - (data.message_count || 0);
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    resets_at: data.window_end,
  };
}

/**
 * Increment message count for current window (create if needed).
 */
export async function incrementMessageCount(
  studentId: string,
  supabase: SupabaseClient
): Promise<void> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  // Try to find existing window
  const { data } = await supabase
    .from('copilot_rate_limits')
    .select('id, message_count')
    .eq('student_id', studentId)
    .gt('window_end', now.toISOString())
    .order('window_start', { ascending: false })
    .limit(1)
    .single();

  if (data) {
    await supabase
      .from('copilot_rate_limits')
      .update({ message_count: (data.message_count || 0) + 1 })
      .eq('id', data.id);
  } else {
    await supabase.from('copilot_rate_limits').insert({
      student_id: studentId,
      window_start: now.toISOString(),
      window_end: windowEnd,
      message_count: 1,
    });
  }
}
