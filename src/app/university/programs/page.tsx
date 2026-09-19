import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Handshake, Users, CheckCircle, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Program Partnerships | GlobalXcelerate',
  description: 'View program partnerships and student enrollment data',
};

export default async function UniversityProgramsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('university_admin_profiles')
    .select('institution_name, onboarding_status')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.onboarding_status !== 'complete') {
    redirect('/university/setup');
  }

  const institutionName = profile.institution_name;

  // Get all students from this institution
  const { data: students } = await supabase
    .from('student_profiles')
    .select('user_id')
    .ilike('institution', institutionName);

  const studentIds = (students || []).map((s) => s.user_id);

  // Get all applications from those students with opportunity and organization details
  const { data: applications } = studentIds.length > 0
    ? await supabase
        .from('applications')
        .select('id, user_id, status, opportunity_id, opportunities(title, category, organization_id, organizations(name))')
        .in('user_id', studentIds)
    : { data: [] };

  // Aggregate by program (opportunity)
  const programMap = new Map<
    string,
    {
      title: string;
      orgName: string;
      category: string;
      enrolledCount: number;
      totalApplicants: number;
    }
  >();

  (applications || []).forEach((app: any) => {
    const oppId = app.opportunity_id;
    if (!oppId) return;

    const existing = programMap.get(oppId);
    const isAccepted = app.status === 'accepted';

    if (existing) {
      existing.totalApplicants += 1;
      if (isAccepted) existing.enrolledCount += 1;
    } else {
      programMap.set(oppId, {
        title: app.opportunities?.title || 'Unknown Program',
        orgName: app.opportunities?.organizations?.name || 'Unknown Provider',
        category: app.opportunities?.category || 'General',
        enrolledCount: isAccepted ? 1 : 0,
        totalApplicants: 1,
      });
    }
  });

  const programs = Array.from(programMap.values());

  // Compute stats
  const totalPartnerships = programs.filter((p) => p.enrolledCount > 0).length;
  const activeEnrollments = programs.reduce((sum, p) => sum + p.enrolledCount, 0);
  const totalApplications = (applications || []).length;
  const avgAcceptanceRate =
    totalApplications > 0
      ? ((activeEnrollments / totalApplications) * 100).toFixed(1)
      : '0';

  function getCategoryColor(category: string) {
    const colors: Record<string, string> = {
      technology: 'bg-blue-900/30 text-blue-300 border-blue-700',
      business: 'bg-purple-900/30 text-purple-300 border-purple-700',
      research: 'bg-green-900/30 text-green-300 border-green-700',
      internship: 'bg-yellow-900/30 text-yellow-300 border-yellow-700',
      fellowship: 'bg-pink-900/30 text-pink-300 border-pink-700',
    };
    return colors[category.toLowerCase()] || 'bg-gray-800 text-gray-300 border-gray-700';
  }

  return (
    <div className="min-h-screen bg-[#050607] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Program Partnerships</h1>
          <p className="text-gray-400 mt-1">{institutionName} &middot; Program enrollment overview</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Handshake className="h-5 w-5 text-blue-400" />
              <h3 className="text-sm font-medium text-gray-400">Total Partnerships</h3>
            </div>
            <p className="text-3xl font-bold text-white">{totalPartnerships}</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <h3 className="text-sm font-medium text-gray-400">Active Enrollments</h3>
            </div>
            <p className="text-3xl font-bold text-green-400">{activeEnrollments}</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-purple-400" />
              <h3 className="text-sm font-medium text-gray-400">Total Applications</h3>
            </div>
            <p className="text-3xl font-bold text-purple-400">{totalApplications}</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-5 w-5 text-yellow-400" />
              <h3 className="text-sm font-medium text-gray-400">Avg Acceptance Rate</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{avgAcceptanceRate}%</p>
          </div>
        </div>

        {/* Program Cards */}
        {programs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs
              .sort((a, b) => b.enrolledCount - a.enrolledCount)
              .map((program, index) => {
                const acceptanceRate =
                  program.totalApplicants > 0
                    ? ((program.enrolledCount / program.totalApplicants) * 100).toFixed(0)
                    : '0';

                return (
                  <div
                    key={index}
                    className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">{program.title}</h3>
                        <p className="text-gray-400 text-sm mt-1">{program.orgName}</p>
                      </div>
                      <Badge className={getCategoryColor(program.category)}>
                        {program.category}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-800">
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-400">{program.enrolledCount}</p>
                        <p className="text-xs text-gray-500">Enrolled</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-300">{program.totalApplicants}</p>
                        <p className="text-xs text-gray-500">Applicants</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-yellow-400">{acceptanceRate}%</p>
                        <p className="text-xs text-gray-500">Rate</p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
            <Handshake className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400">No partnerships yet</h3>
            <p className="text-gray-500 mt-1">
              Program partnerships will appear here once your students start applying to opportunities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
