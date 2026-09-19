import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Admin check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('platform_admin_profiles')
      .select('access_level, department')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('per_page') || '20', 10)));
    const search = searchParams.get('search') || '';
    const roleFilter = searchParams.get('role') || '';

    // Use admin client to list users
    const adminClient = createAdminClient();
    const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers({
      page,
      perPage,
    });

    if (listError) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'LIST_USERS_ERROR', message: listError.message } },
        { status: 500 }
      );
    }

    let users = usersData.users || [];

    // Apply search filter (email or name from user_metadata)
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter((u) => {
        const email = (u.email || '').toLowerCase();
        const fullName = (u.user_metadata?.full_name || u.user_metadata?.name || '').toLowerCase();
        return email.includes(searchLower) || fullName.includes(searchLower);
      });
    }

    // Apply role filter
    if (roleFilter) {
      users = users.filter((u) => u.user_metadata?.role === roleFilter);
    }

    // Get user IDs for profile lookups
    const userIds = users.map((u) => u.id);

    // Fetch profile data from all profile tables
    const [studentProfiles, employerProfiles, adminProfiles] = await Promise.all([
      supabase.from('student_profiles').select('user_id, full_name, onboarding_status').in('user_id', userIds),
      supabase.from('employer_profiles').select('user_id, full_name').in('user_id', userIds),
      supabase.from('platform_admin_profiles').select('user_id, full_name').in('user_id', userIds),
    ]);

    // Build profile lookup map
    const profileMap = new Map<string, { full_name: string; onboarding_status?: string }>();

    for (const p of studentProfiles.data || []) {
      profileMap.set(p.user_id, { full_name: p.full_name, onboarding_status: p.onboarding_status });
    }
    for (const p of employerProfiles.data || []) {
      if (!profileMap.has(p.user_id)) {
        profileMap.set(p.user_id, { full_name: p.full_name });
      }
    }
    for (const p of adminProfiles.data || []) {
      if (!profileMap.has(p.user_id)) {
        profileMap.set(p.user_id, { full_name: p.full_name });
      }
    }

    // Format response
    const formattedUsers = users.map((u) => {
      const profileInfo = profileMap.get(u.id);
      return {
        id: u.id,
        email: u.email,
        role: u.user_metadata?.role || 'unknown',
        full_name: profileInfo?.full_name || u.user_metadata?.full_name || null,
        onboarding_status: profileInfo?.onboarding_status || null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
      };
    });

    const totalUsers = usersData.total || 0;
    const totalPages = Math.ceil(totalUsers / perPage);

    return NextResponse.json({
      success: true,
      data: formattedUsers,
      error: null,
      meta: {
        page,
        per_page: perPage,
        total: totalUsers,
        total_pages: totalPages,
      },
    });
  } catch (error) {
    console.error('Admin users list error:', error);
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
