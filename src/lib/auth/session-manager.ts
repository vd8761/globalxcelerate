import { createAdminClient } from '@/lib/supabase/admin';
import { SESSION_CONFIG } from './constants';

export async function enforceSessionLimit(
  userId: string,
  maxSessions: number = SESSION_CONFIG.maxConcurrent
): Promise<{ terminated: string[] }> {
  const terminated: string[] = [];

  try {
    const supabase = createAdminClient();

    // Get active sessions sorted by last_active_at
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('id, last_active_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('last_active_at', { ascending: true });

    if (!sessions || sessions.length < maxSessions) {
      return { terminated };
    }

    // Terminate oldest sessions beyond limit
    const sessionsToTerminate = sessions.slice(0, sessions.length - maxSessions + 1);

    for (const session of sessionsToTerminate) {
      await supabase
        .from('user_sessions')
        .update({
          is_active: false,
          terminated_at: new Date().toISOString(),
          terminated_reason: 'concurrent_limit',
        })
        .eq('id', session.id);

      terminated.push(session.id);
    }
  } catch (err) {
    console.error('Failed to enforce session limit:', err);
  }

  return { terminated };
}
