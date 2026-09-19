import type { AuthEventType } from '@/types/auth';

interface AuthEventParams {
  userId?: string;
  eventType: AuthEventType;
  ip: string;
  userAgent: string;
  provider?: string;
  success: boolean;
  errorCode?: string;
  metadata?: Record<string, unknown>;
}

export async function logAuthEvent(params: AuthEventParams): Promise<void> {
  // Non-blocking: fire and forget
  try {
    // Use dynamic import to avoid issues with server-only module in edge
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    await supabase.from('auth_events').insert({
      user_id: params.userId || null,
      event_type: params.eventType,
      ip_address: params.ip,
      user_agent: params.userAgent,
      provider: params.provider || null,
      success: params.success,
      error_code: params.errorCode || null,
      metadata: params.metadata || null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    // Log to console but don't throw - event logging is non-blocking
    console.error('[AuthEvent] Failed to log event:', params.eventType, err);
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '0.0.0.0';
}

export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}
