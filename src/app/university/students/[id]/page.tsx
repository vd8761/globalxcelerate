import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ArrowLeft, GraduationCap, Mail, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const metadata = {
  title: 'Student Detail | GlobalXcelerate',
  description: 'View student profile, skills, and application history',
};

export default async function UniversityStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: adminProfile } = await supabase
    .from('university_admin_profiles')
    .select('institution_name, onboarding_status')
    .eq('user_id', user.id)
    .single();

  if (!adminProfile || adminProfile.onboarding_status !== 'complete') {
    redirect('/university/setup');
  }

  // Get student profile
  const { data: student } = await supabase
    .from('student_profiles')
    .select('user_id, full_name, email, institution, gx_score, created_at')
    .eq('user_id', id)
    .single();

  if (!student) {
    redirect('/university/students');
  }

  // Verify institution matches
  if (
    !student.institution ||
    !student.institution.toLowerCase().includes(adminProfile.institution_name.toLowerCase())
  ) {
    redirect('/university/students');
  }

  // Get student skills
  const { data: studentSkills } = await supabase
    .from('student_skills')
    .select('skill_id, skills_master(name, category)')
    .eq('user_id', id);

  // Get applications with opportunity details
  const { data: applications } = await supabase
    .from('applications')
    .select('id, status, created_at, opportunity_id, opportunities(title, organization_id, organizations(name))')
    .eq('user_id', id)
    .order('created_at', { ascending: false });

  const gxScore = student.gx_score || 0;
  let scoreColor = 'text-red-400';
  let scoreBg = 'bg-red-900/20 border-red-800';
  if (gxScore >= 80) {
    scoreColor = 'text-green-400';
    scoreBg = 'bg-green-900/20 border-green-800';
  } else if (gxScore >= 60) {
    scoreColor = 'text-yellow-400';
    scoreBg = 'bg-yellow-900/20 border-yellow-800';
  }

  const totalApplications = (applications || []).length;
  const acceptedCount = (applications || []).filter((a) => a.status === 'accepted').length;
  const pendingCount = (applications || []).filter((a) => a.status === 'pending').length;
  const rejectedCount = (applications || []).filter((a) => a.status === 'rejected').length;

  function getStatusBadge(status: string) {
    switch (status) {
      case 'accepted':
        return 'bg-green-900/50 text-green-400 border-green-700';
      case 'pending':
        return 'bg-yellow-900/50 text-yellow-400 border-yellow-700';
      case 'rejected':
        return 'bg-red-900/50 text-red-400 border-red-700';
      case 'withdrawn':
        return 'bg-gray-800 text-gray-400 border-gray-700';
      default:
        return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  }

  return (
    <div className="min-h-screen bg-[#050607] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back Button */}
        <Link
          href="/university/students"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Student Roster
        </Link>

        {/* Profile Header */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-blue-600/20 border border-blue-700 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{student.full_name || 'Unnamed Student'}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                  <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                    <Mail className="h-3.5 w-3.5" />
                    {student.email || 'No email'}
                  </span>
                  <span className="hidden sm:inline text-gray-600">&middot;</span>
                  <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                    <Building2 className="h-3.5 w-3.5" />
                    {student.institution}
                  </span>
                </div>
              </div>
            </div>

            {/* GX Score */}
            <div className={`flex flex-col items-center p-4 rounded-xl border ${scoreBg}`}>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">GX Score</span>
              <span className={`text-4xl font-bold ${scoreColor}`}>{gxScore}</span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{totalApplications}</p>
            <p className="text-xs text-gray-500 mt-1">Total Applications</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{acceptedCount}</p>
            <p className="text-xs text-gray-500 mt-1">Accepted</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
            <p className="text-xs text-gray-500 mt-1">Pending</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{rejectedCount}</p>
            <p className="text-xs text-gray-500 mt-1">Rejected</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-gray-900/50 border border-gray-800">
            <TabsTrigger value="profile" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400">
              Profile
            </TabsTrigger>
            <TabsTrigger value="applications" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400">
              Applications
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400">
              Skills
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white">Student Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-500">Full Name</label>
                  <p className="text-white mt-1">{student.full_name || '--'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="text-white mt-1">{student.email || '--'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Institution</label>
                  <p className="text-white mt-1">{student.institution || '--'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Member Since</label>
                  <p className="text-white mt-1">
                    {student.created_at
                      ? new Date(student.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '--'}
                  </p>
                </div>
              </div>

              {/* Skills Preview */}
              {(studentSkills || []).length > 0 && (
                <div>
                  <h3 className="text-sm text-gray-500 mb-3">Skills ({(studentSkills || []).length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {(studentSkills || []).map((skill: any) => (
                      <Badge
                        key={skill.skill_id}
                        className="bg-blue-900/30 text-blue-300 border-blue-700"
                      >
                        {skill.skills_master?.name || `Skill #${skill.skill_id}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Application History</h2>
              {(applications || []).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-transparent">
                      <TableHead className="text-gray-400">Opportunity</TableHead>
                      <TableHead className="text-gray-400">Organization</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Applied Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(applications || []).map((app: any) => (
                      <TableRow key={app.id} className="border-gray-800 hover:bg-gray-800/50">
                        <TableCell className="text-white font-medium">
                          {app.opportunities?.title || 'Unknown Opportunity'}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {app.opportunities?.organizations?.name || '--'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(app.status)}>
                            {app.status?.charAt(0).toUpperCase() + app.status?.slice(1) || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {app.created_at
                            ? new Date(app.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : '--'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No applications yet.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Skills & Competencies</h2>
              {(studentSkills || []).length > 0 ? (
                <div className="space-y-4">
                  {/* Group skills by category */}
                  {Object.entries(
                    (studentSkills || []).reduce(
                      (acc: Record<string, any[]>, skill: any) => {
                        const category = skill.skills_master?.category || 'Other';
                        if (!acc[category]) acc[category] = [];
                        acc[category].push(skill);
                        return acc;
                      },
                      {} as Record<string, any[]>
                    )
                  ).map(([category, skills]) => (
                    <div key={category}>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">{category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {(skills as any[]).map((skill: any) => (
                          <Badge
                            key={skill.skill_id}
                            className="bg-blue-900/30 text-blue-300 border-blue-700"
                          >
                            {skill.skills_master?.name || `Skill #${skill.skill_id}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No skills recorded yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
