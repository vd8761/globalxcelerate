import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Mail, Calendar, Clock, Shield } from 'lucide-react';
import { UserActions } from './user-actions';

export const metadata = {
  title: 'User Detail | Admin | GlobalXcelerate',
  description: 'View and manage user details',
};

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: adminProfile } = await supabase
    .from('platform_admin_profiles')
    .select('access_level, department, onboarding_status')
    .eq('user_id', user.id)
    .single();

  if (!adminProfile || adminProfile.onboarding_status !== 'complete') {
    redirect('/admin/setup');
  }

  // Fetch target user
  const adminClient = createAdminClient();
  const { data: userData, error: getUserError } = await adminClient.auth.admin.getUserById(id);

  if (getUserError || !userData?.user) {
    redirect('/admin/users');
  }

  const targetUser = userData.user;
  const role = targetUser.user_metadata?.role || 'unknown';

  // Fetch profile based on role
  let profileData: Record<string, unknown> | null = null;

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

  const isSuspended = !!targetUser.banned_until;
  const fullName = (profileData as Record<string, unknown>)?.full_name as string ||
    targetUser.user_metadata?.full_name ||
    targetUser.user_metadata?.name ||
    'Unknown User';

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadgeClass = (r: string) => {
    switch (r) {
      case 'student':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'employer':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'admin':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#050607] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back Link */}
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Link>

        {/* User Profile Card */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
              <User className="h-10 w-10 text-gray-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-white">{fullName}</h1>
                <Badge className={getRoleBadgeClass(role)}>{role}</Badge>
                {isSuspended ? (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Suspended</Badge>
                ) : (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 text-gray-400">
                <Mail className="h-4 w-4" />
                <span>{targetUser.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Details */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Profile Details</h2>
            {role === 'student' && profileData && (
              <div className="space-y-3">
                {!!(profileData as Record<string, unknown>).university && (
                  <div>
                    <p className="text-sm text-gray-400">University</p>
                    <p className="text-white">{(profileData as Record<string, unknown>).university as string}</p>
                  </div>
                )}
                {!!(profileData as Record<string, unknown>).degree && (
                  <div>
                    <p className="text-sm text-gray-400">Degree</p>
                    <p className="text-white">{(profileData as Record<string, unknown>).degree as string}</p>
                  </div>
                )}
                {!!(profileData as Record<string, unknown>).field_of_study && (
                  <div>
                    <p className="text-sm text-gray-400">Field of Study</p>
                    <p className="text-white">{(profileData as Record<string, unknown>).field_of_study as string}</p>
                  </div>
                )}
                {!!(profileData as Record<string, unknown>).graduation_year && (
                  <div>
                    <p className="text-sm text-gray-400">Graduation Year</p>
                    <p className="text-white">{String((profileData as Record<string, unknown>).graduation_year)}</p>
                  </div>
                )}
                {!!(profileData as Record<string, unknown>).onboarding_status && (
                  <div>
                    <p className="text-sm text-gray-400">Onboarding Status</p>
                    <p className="text-white capitalize">{(profileData as Record<string, unknown>).onboarding_status as string}</p>
                  </div>
                )}
              </div>
            )}
            {role === 'employer' && profileData && (
              <div className="space-y-3">
                {!!(profileData as Record<string, unknown>).company_name && (
                  <div>
                    <p className="text-sm text-gray-400">Company</p>
                    <p className="text-white">{(profileData as Record<string, unknown>).company_name as string}</p>
                  </div>
                )}
                {!!(profileData as Record<string, unknown>).industry && (
                  <div>
                    <p className="text-sm text-gray-400">Industry</p>
                    <p className="text-white">{(profileData as Record<string, unknown>).industry as string}</p>
                  </div>
                )}
                {!!(profileData as Record<string, unknown>).company_size && (
                  <div>
                    <p className="text-sm text-gray-400">Company Size</p>
                    <p className="text-white">{(profileData as Record<string, unknown>).company_size as string}</p>
                  </div>
                )}
                {!!(profileData as Record<string, unknown>).position && (
                  <div>
                    <p className="text-sm text-gray-400">Position</p>
                    <p className="text-white">{(profileData as Record<string, unknown>).position as string}</p>
                  </div>
                )}
              </div>
            )}
            {role === 'admin' && profileData && (
              <div className="space-y-3">
                {!!(profileData as Record<string, unknown>).department && (
                  <div>
                    <p className="text-sm text-gray-400">Department</p>
                    <p className="text-white">{(profileData as Record<string, unknown>).department as string}</p>
                  </div>
                )}
                {!!(profileData as Record<string, unknown>).access_level && (
                  <div>
                    <p className="text-sm text-gray-400">Access Level</p>
                    <p className="text-white capitalize">{(profileData as Record<string, unknown>).access_level as string}</p>
                  </div>
                )}
              </div>
            )}
            {!profileData && (
              <p className="text-gray-400">No profile data available</p>
            )}
          </div>

          {/* Activity Section */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Account Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Account Created</p>
                  <p className="text-white">{formatDate(targetUser.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Last Sign In</p>
                  <p className="text-white">{formatDate(targetUser.last_sign_in_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Email Confirmed</p>
                  <p className="text-white">{targetUser.email_confirmed_at ? 'Yes' : 'No'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Onboarding Status</p>
                  <p className="text-white capitalize">
                    {(profileData as Record<string, unknown>)?.onboarding_status as string || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions (Client Component) */}
        <UserActions userId={id} isSuspended={isSuspended} currentRole={role} />
      </div>
    </div>
  );
}
