import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/components/dashboard/logout-button';

export const metadata = {
  title: 'University Dashboard | GlobalXcelerate',
  description: 'Monitor student outcomes and manage partnerships',
};

export default async function UniversityDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('university_admin_profiles')
    .select('institution_name, department, position, onboarding_status')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.onboarding_status !== 'complete') {
    redirect('/university/setup');
  }

  return (
    <div className="min-h-screen bg-[#050607] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome, {profile.institution_name}</h1>
            <p className="text-gray-400 mt-1">{profile.department} &middot; {profile.position}</p>
          </div>
          <LogoutButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white">Enrolled Students</h3>
            <p className="text-4xl font-bold text-blue-400 mt-2">0</p>
            <p className="text-gray-500 text-sm mt-1">No students linked yet</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white">Avg GX Score</h3>
            <p className="text-4xl font-bold text-green-400 mt-2">--</p>
            <p className="text-gray-500 text-sm mt-1">No data available</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white">Active Programs</h3>
            <p className="text-4xl font-bold text-purple-400 mt-2">0</p>
            <p className="text-gray-500 text-sm mt-1">No partnerships yet</p>
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <a href="/university/students" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
              View Students
            </a>
            <a href="/university/programs" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
              Manage Programs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
