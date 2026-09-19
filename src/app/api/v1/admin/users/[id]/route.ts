import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: NextResponse.json(
      { success: false, data: null, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    )};
  }

  const { data: profile } = await supabase
    .from('platform_admin_profiles')
    .select('access_level, department')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return { error: NextResponse.json(
      { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
      { status: 403 }
    )};
  }

  return { user, profile };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    const adminCheck = await verifyAdmin(supabase);
    if ('error' in adminCheck) return adminCheck.error;

    // Fetch user from auth using admin client
    const adminClient = createAdminClient();
    const { data: userData, error: getUserError } = await adminClient.auth.admin.getUserById(id);

    if (getUserError || !userData?.user) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    const authUser = userData.user;
    const role = authUser.user_metadata?.role || 'unknown';

    // Fetch profile based on role
    let profileData = null;

    if (role === 'student') {
      const { data } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', id)
        .single();
      profileData = data;
    } else if (role === 'employer') {
      const { data } = await supabase
        .from('employer_profiles')
        .select('*')
        .eq('user_id', id)
        .single();
      profileData = data;
    } else if (role === 'admin') {
      const { data } = await supabase
        .from('platform_admin_profiles')
        .select('*')
        .eq('user_id', id)
        .single();
      profileData = data;
    }

    return NextResponse.json({
      success: true,
      data: {
        id: authUser.id,
        email: authUser.email,
        role,
        email_confirmed_at: authUser.email_confirmed_at,
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
        banned_until: authUser.banned_until,
        user_metadata: authUser.user_metadata,
        profile: profileData,
      },
      error: null,
      meta: null,
    });
  } catch (error) {
    console.error('Admin get user error:', error);
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    const adminCheck = await verifyAdmin(supabase);
    if ('error' in adminCheck) return adminCheck.error;

    const body = await request.json();
    const { action, role } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'INVALID_REQUEST', message: 'Action is required' } },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    switch (action) {
      case 'suspend': {
        const { error } = await adminClient.auth.admin.updateUserById(id, {
          ban_duration: '876000h',
        });
        if (error) {
          return NextResponse.json(
            { success: false, data: null, error: { code: 'SUSPEND_ERROR', message: error.message } },
            { status: 500 }
          );
        }
        return NextResponse.json({
          success: true,
          data: { id, status: 'suspended' },
          error: null,
          meta: null,
        });
      }

      case 'activate': {
        const { error } = await adminClient.auth.admin.updateUserById(id, {
          ban_duration: 'none',
        });
        if (error) {
          return NextResponse.json(
            { success: false, data: null, error: { code: 'ACTIVATE_ERROR', message: error.message } },
            { status: 500 }
          );
        }
        return NextResponse.json({
          success: true,
          data: { id, status: 'active' },
          error: null,
          meta: null,
        });
      }

      case 'update_role': {
        if (!role) {
          return NextResponse.json(
            { success: false, data: null, error: { code: 'INVALID_REQUEST', message: 'Role is required for update_role action' } },
            { status: 400 }
          );
        }

        // Get current user metadata to merge
        const { data: currentUser, error: getUserError } = await adminClient.auth.admin.getUserById(id);
        if (getUserError || !currentUser?.user) {
          return NextResponse.json(
            { success: false, data: null, error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
            { status: 404 }
          );
        }

        const { error } = await adminClient.auth.admin.updateUserById(id, {
          user_metadata: { ...currentUser.user.user_metadata, role },
        });
        if (error) {
          return NextResponse.json(
            { success: false, data: null, error: { code: 'UPDATE_ROLE_ERROR', message: error.message } },
            { status: 500 }
          );
        }
        return NextResponse.json({
          success: true,
          data: { id, role },
          error: null,
          meta: null,
        });
      }

      default:
        return NextResponse.json(
          { success: false, data: null, error: { code: 'INVALID_ACTION', message: `Unknown action: ${action}` } },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    const adminCheck = await verifyAdmin(supabase);
    if ('error' in adminCheck) return adminCheck.error;

    // Soft-delete: ban the user permanently
    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.updateUserById(id, {
      ban_duration: '876000h',
    });

    if (error) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'DELETE_ERROR', message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id, status: 'deleted' },
      error: null,
      meta: null,
    });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
