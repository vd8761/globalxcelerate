import type { SupabaseClient } from '@supabase/supabase-js';
import type { CopilotSession } from '../types';
import { GX_SCORE_CONFIG } from '@/lib/config/scoring';

/**
 * Get active session or create a new one.
 */
export async function getOrCreateSession(
  studentId: string,
  supabase: SupabaseClient
): Promise<CopilotSession> {
  const timeoutThreshold = new Date(
    Date.now() - GX_SCORE_CONFIG.session_timeout_ms
  ).toISOString();

  // Check for active session
  const { data: existing } = await supabase
    .from('copilot_sessions')
    .select('*')
    .eq('student_id', studentId)
    .eq('is_active', true)
    .gt('last_activity_at', timeoutThreshold)
    .order('last_activity_at', { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    return existing as CopilotSession;
  }

  // Deactivate any stale sessions
  await supabase
    .from('copilot_sessions')
    .update({ is_active: false })
    .eq('student_id', studentId)
    .eq('is_active', true);

  // Create new session
  const { data: newSession, error } = await supabase
    .from('copilot_sessions')
    .insert({
      student_id: studentId,
      is_active: true,
      messages_count: 0,
      last_activity_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !newSession) {
    throw new Error('Failed to create copilot session');
  }

  return newSession as CopilotSession;
}

/**
 * Update session activity timestamp.
 */
export async function updateSessionActivity(
  sessionId: string,
  supabase: SupabaseClient
): Promise<void> {
  await supabase
    .from('copilot_sessions')
    .update({ last_activity_at: new Date().toISOString() })
    .eq('id', sessionId);
}

/**
 * End a session by marking it inactive.
 */
export async function endSession(
  sessionId: string,
  supabase: SupabaseClient
): Promise<void> {
  await supabase
    .from('copilot_sessions')
    .update({ is_active: false })
    .eq('id', sessionId);
}
