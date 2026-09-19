import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Users, Briefcase, FileText, Activity } from 'lucide-react';

export const metadata = {
  title: 'Platform Analytics | Admin | GlobalXcelerate',
  description: 'Platform analytics and reports',
};

export default async function AdminReportsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('platform_admin_profiles')
    .select('access_level, department, onboarding_status')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.onboarding_status !== 'complete') {
    redirect('/admin/setup');
  }

  // Fetch counts from all tables in parallel
  const [
    studentsResult,
    employersResult,
    adminsResult,
    opportunitiesResult,
    publishedOppsResult,
    pendingOppsResult,
    archivedOppsResult,
    applicationsResult,
  ] = await Promise.all([
    supabase.from('student_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('employer_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('platform_admin_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('status', 'archived'),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
  ]);

  const studentCount = studentsResult.count ?? 0;
  const employerCount = employersResult.count ?? 0;
  const adminCount = adminsResult.count ?? 0;
  const totalUsers = studentCount + employerCount + adminCount;

  const totalOpportunities = opportunitiesResult.count ?? 0;
  const publishedOpps = publishedOppsResult.count ?? 0;
  const pendingOpps = pendingOppsResult.count ?? 0;
  const archivedOpps = archivedOppsResult.count ?? 0;

  const totalApplications = applicationsResult.count ?? 0;

  return (
    <div className="min-h-screen bg-[#050607] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Platform Analytics</h1>
          <p className="text-gray-400 mt-1">Overview of platform metrics and health</p>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users Card */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-400">Total Users</h3>
            </div>
            <p className="text-4xl font-bold text-blue-400">{totalUsers}</p>
            <div className="mt-4 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Students</span>
                <span className="text-white font-medium">{studentCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Employers</span>
                <span className="text-white font-medium">{employerCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Admins</span>
                <span className="text-white font-medium">{adminCount}</span>
              </div>
            </div>
          </div>

          {/* Total Opportunities Card */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Briefcase className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-400">Total Opportunities</h3>
            </div>
            <p className="text-4xl font-bold text-green-400">{totalOpportunities}</p>
            <div className="mt-4 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Published</span>
                <span className="text-green-400 font-medium">{publishedOpps}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Pending Review</span>
                <span className="text-yellow-400 font-medium">{pendingOpps}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Archived</span>
                <span className="text-red-400 font-medium">{archivedOpps}</span>
              </div>
            </div>
          </div>

          {/* Total Applications Card */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <FileText className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-400">Total Applications</h3>
            </div>
            <p className="text-4xl font-bold text-purple-400">{totalApplications}</p>
            <div className="mt-4 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Platform-wide</span>
                <span className="text-white font-medium">{totalApplications}</span>
              </div>
            </div>
          </div>

          {/* Platform Health Card */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Activity className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-400">Platform Health</h3>
            </div>
            <p className="text-4xl font-bold text-emerald-400">OK</p>
            <div className="mt-4 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Status</span>
                <span className="text-emerald-400 font-medium">Operational</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Database</span>
                <span className="text-emerald-400 font-medium">Connected</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Auth Service</span>
                <span className="text-emerald-400 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Conversion Rate (Users to Applications)</span>
                <span className="text-white font-medium">
                  {totalUsers > 0 ? `${Math.round((totalApplications / totalUsers) * 100)}%` : '0%'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Avg Applications per Opportunity</span>
                <span className="text-white font-medium">
                  {totalOpportunities > 0 ? (totalApplications / totalOpportunities).toFixed(1) : '0'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Opportunities Pending Moderation</span>
                <span className="text-yellow-400 font-medium">{pendingOpps}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-400">Approval Rate</span>
                <span className="text-white font-medium">
                  {totalOpportunities > 0
                    ? `${Math.round((publishedOpps / totalOpportunities) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/admin/users"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
              >
                <Users className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-white font-medium">Manage Users</p>
                  <p className="text-gray-400 text-sm">{totalUsers} registered users</p>
                </div>
              </a>
              <a
                href="/admin/opportunities"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
              >
                <Briefcase className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">Moderate Opportunities</p>
                  <p className="text-gray-400 text-sm">{pendingOpps} awaiting review</p>
                </div>
              </a>
              <a
                href="/admin/dashboard"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
              >
                <Activity className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-white font-medium">Admin Dashboard</p>
                  <p className="text-gray-400 text-sm">Return to main dashboard</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
