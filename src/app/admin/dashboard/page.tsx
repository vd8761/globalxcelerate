import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/components/dashboard/logout-button';

export const metadata = {
  title: 'Admin Dashboard | GlobalXcelerate',
  description: 'Platform administration and analytics',
};

export default async function AdminDashboardPage() {
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

  const { count: totalUsers } = await supabase
    .from('student_profiles')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="min-h-screen bg-[#050607] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Platform Admin</h1>
            <p className="text-gray-400 mt-1">Access level: {profile.access_level || 'Full'} &middot; {profile.department || 'Platform'}</p>
          </div>
          <LogoutButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white">Total Users</h3>
            <p className="text-4xl font-bold text-blue-400 mt-2">{totalUsers ?? 0}</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white">Active Listings</h3>
            <p className="text-4xl font-bold text-green-400 mt-2">0</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white">Reports</h3>
            <p className="text-4xl font-bold text-yellow-400 mt-2">0</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white">System Health</h3>
            <p className="text-4xl font-bold text-green-400 mt-2">OK</p>
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <a href="/admin/users" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
              Manage Users
            </a>
            <a href="/admin/opportunities" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
              Moderate Listings
            </a>
            <a href="/admin/reports" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
              View Reports
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
