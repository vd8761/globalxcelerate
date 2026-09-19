import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getPostAuthRedirect } from '@/lib/auth/auth-redirect';
import { logAuthEvent, getClientIp, getUserAgent } from '@/lib/auth/auth-event-logger';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');
  const type = searchParams.get('type');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const ip = getClientIp(request);
  const ua = getUserAgent(request);

  // Handle OAuth error
  if (error) {
    const errorMsg = errorDescription || error;
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorMsg)}`, origin)
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', origin));
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('[AuthCallback] Exchange error:', exchangeError);
      return NextResponse.redirect(
        new URL('/login?error=auth_failed', origin)
      );
    }

    const user = data.user;

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=no_user', origin));
    }

    // Handle recovery type - redirect to reset password
    if (type === 'recovery') {
      await logAuthEvent({ userId: user.id, eventType: 'password_reset_request', ip, userAgent: ua, success: true });
      return NextResponse.redirect(new URL('/reset-password', origin));
    }

    // Handle email verification
    if (type === 'email_verification') {
      await logAuthEvent({ userId: user.id, eventType: 'email_verification', ip, userAgent: ua, success: true });
      return NextResponse.redirect(new URL('/verify-email?verified=true', origin));
    }

    // Handle Apple Sign-In name persistence
    const identities = user.identities || [];
    const appleIdentity = identities.find((i) => i.provider === 'apple');
    if (appleIdentity && !user.user_metadata?.full_name) {
      const nameData = appleIdentity.identity_data;
      if (nameData?.full_name || nameData?.name) {
        await supabase.auth.updateUser({
          data: { full_name: nameData.full_name || nameData.name },
        });
      }
    }

    // Determine provider for logging
    const provider = identities[0]?.provider || 'email';
    await logAuthEvent({
      userId: user.id,
      eventType: provider === 'email' ? 'login_email' : 'login_oauth',
      ip,
      userAgent: ua,
      success: true,
      provider,
    });

    // Determine redirect
    if (next) {
      return NextResponse.redirect(new URL(next, origin));
    }

    const redirectTo = getPostAuthRedirect(user);
    return NextResponse.redirect(new URL(redirectTo, origin));
  } catch (err) {
    console.error('[AuthCallback] Unexpected error:', err);
    return NextResponse.redirect(new URL('/login?error=callback_error', origin));
  }
}
