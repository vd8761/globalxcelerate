import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/components/dashboard/logout-button';

export const metadata = {
  title: 'Employer Dashboard | GlobalXcelerate',
  description: 'Manage your job listings and candidates',
};

export default async function EmployerDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('employer_profiles')
    .select('company_name, job_title, industry, company_size, onboarding_status')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.onboarding_status !== 'complete') {
    redirect('/employer/setup');
  }

  return (
    <div className="min-h-screen bg-[#050607] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome, {profile.company_name}</h1>
            <p className="text-gray-400 mt-1">{profile.job_title} &middot; {profile.industry}</p>
          </div>
          <LogoutButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white">Active Listings</h3>
            <p className="text-4xl font-bold text-blue-400 mt-2">0</p>
            <p className="text-gray-500 text-sm mt-1">Post your first opportunity</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white">Applications</h3>
            <p className="text-4xl font-bold text-green-400 mt-2">0</p>
            <p className="text-gray-500 text-sm mt-1">No pending applications</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white">Matched Candidates</h3>
            <p className="text-4xl font-bold text-purple-400 mt-2">0</p>
            <p className="text-gray-500 text-sm mt-1">AI matching available</p>
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <a href="/employer/opportunities" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
              Post Opportunity
            </a>
            <a href="/employer/candidates" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
              Search Candidates
            </a>
            <a href="/employer/applications" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
              Review Applications
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
