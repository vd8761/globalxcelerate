import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';
import { SECURITY_HEADERS } from '@/lib/auth/constants';
import type { UserRole } from '@/types/auth';

const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/verify-otp'];
const ROLE_SELECT_PAGE = '/role-select';

const PROTECTED_PREFIX_ROLE: Record<string, UserRole> = {
  '/student': 'student',
  '/employer': 'employer',
  '/university': 'university_admin',
  '/provider': 'program_provider',
  '/admin': 'platform_admin',
};

const ROLE_DASHBOARDS: Record<UserRole, string> = {
  student: '/student/dashboard',
  employer: '/employer/dashboard',
  university_admin: '/university/dashboard',
  program_provider: '/provider/dashboard',
  platform_admin: '/admin/dashboard',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('[Middleware]', request.method, pathname);

  try {
    // Public API routes don't need auth checks — skip the Supabase call
    if (pathname.startsWith('/api/auth/')) {
      console.log('[Middleware] Bypassing auth for public API route:', pathname);
      const response = NextResponse.next({ request });
      for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
        response.headers.set(key, value);
      }
      return response;
    }

    const { user, response } = await createMiddlewareClient(request);

    // Set security headers
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      response.headers.set(key, value);
    }

    // Public paths - no auth required
    if (pathname === '/' || pathname.startsWith('/api/auth/health')) {
      return response;
    }

    // Auth pages - redirect authenticated users away
    const isAuthPage = AUTH_PAGES.some((page) => pathname === page || pathname.startsWith(`${page}/`));
    if (isAuthPage) {
      if (user) {
        const role = user.user_metadata?.role as UserRole | undefined;
        if (role) {
          const url = request.nextUrl.clone();
          url.pathname = ROLE_DASHBOARDS[role] || '/role-select';
          return NextResponse.redirect(url);
        }
        // User is authenticated but has no role - allow access to role-select
        if (pathname !== '/role-select') {
          // They can still access auth pages if they haven't selected a role
        }
      }
      return response;
    }

    // Role select page - require auth but NO role
    if (pathname === ROLE_SELECT_PAGE) {
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }

      const role = user.user_metadata?.role as UserRole | undefined;
      if (role) {
        const url = request.nextUrl.clone();
        url.pathname = ROLE_DASHBOARDS[role];
        return NextResponse.redirect(url);
      }

      return response;
    }

    // Auth callback and MFA pages - allow with auth
    if (pathname.startsWith('/auth/')) {
      return response;
    }

    // Protected routes
    const matchedPrefix = Object.keys(PROTECTED_PREFIX_ROLE).find((prefix) =>
      pathname.startsWith(prefix)
    );

    if (matchedPrefix) {
      // Check authentication
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('next', pathname);
        return NextResponse.redirect(url);
      }

      const role = user.user_metadata?.role as UserRole | undefined;

      // Check role assignment
      if (!role) {
        const url = request.nextUrl.clone();
        url.pathname = '/role-select';
        return NextResponse.redirect(url);
      }

      // Check role matches route
      const requiredRole = PROTECTED_PREFIX_ROLE[matchedPrefix];
      if (role !== requiredRole) {
        const url = request.nextUrl.clone();
        url.pathname = ROLE_DASHBOARDS[role];
        return NextResponse.redirect(url);
      }

      // Set user context headers for downstream handlers
      response.headers.set('x-user-id', user.id);
      response.headers.set('x-user-role', role);

      return response;
    }

    // API routes (non-auth) - pass through
    if (pathname.startsWith('/api/')) {
      return response;
    }

    return response;
  } catch (err) {
    console.error('[Proxy] Error:', err);
    // On middleware error, allow request to proceed
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
