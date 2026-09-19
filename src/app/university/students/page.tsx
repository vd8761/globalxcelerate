import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Users, TrendingUp, Award, Briefcase, Search, ArrowUpDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export const metadata = {
  title: 'Student Roster | GlobalXcelerate',
  description: 'View and manage students from your institution',
};

export default async function UniversityStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sort?: string }>;
}) {
  const { search, sort } = await searchParams;

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

  // Fetch students from this institution
  let studentsQuery = supabase
    .from('student_profiles')
    .select('user_id, full_name, email, institution, gx_score')
    .ilike('institution', institutionName);

  if (sort === 'gx_score') {
    studentsQuery = studentsQuery.order('gx_score', { ascending: false });
  } else {
    studentsQuery = studentsQuery.order('full_name', { ascending: true });
  }

  const { data: students } = await studentsQuery;

  // Filter by search term if provided
  const filteredStudents = search
    ? (students || []).filter(
        (s) =>
          s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          s.email?.toLowerCase().includes(search.toLowerCase())
      )
    : students || [];

  // Fetch applications for all students
  const studentIds = filteredStudents.map((s) => s.user_id);
  const { data: applications } = studentIds.length > 0
    ? await supabase
        .from('applications')
        .select('user_id, status')
        .in('user_id', studentIds)
    : { data: [] };

  // Fetch skills counts
  const { data: skills } = studentIds.length > 0
    ? await supabase
        .from('student_skills')
        .select('user_id')
        .in('user_id', studentIds)
    : { data: [] };

  // Compute stats
  const totalStudents = filteredStudents.length;
  const avgGxScore =
    totalStudents > 0
      ? (
          filteredStudents.reduce((sum, s) => sum + (s.gx_score || 0), 0) /
          totalStudents
        ).toFixed(1)
      : '--';

  const acceptedApps = (applications || []).filter((a) => a.status === 'accepted');
  const studentsWithAccepted = new Set(acceptedApps.map((a) => a.user_id));
  const activeInPrograms = studentsWithAccepted.size;
  const placementRate =
    totalStudents > 0
      ? ((activeInPrograms / totalStudents) * 100).toFixed(1)
      : '0';

  // Group applications and skills by student
  const appsByStudent = (applications || []).reduce(
    (acc, app) => {
      acc[app.user_id] = (acc[app.user_id] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const skillsByStudent = (skills || []).reduce(
    (acc, skill) => {
      acc[skill.user_id] = (acc[skill.user_id] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const sortToggle = sort === 'gx_score' ? '' : 'gx_score';

  return (
    <div className="min-h-screen bg-[#050607] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Student Roster</h1>
          <p className="text-gray-400 mt-1">{institutionName} &middot; {totalStudents} students</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-blue-400" />
              <h3 className="text-sm font-medium text-gray-400">Total Students</h3>
            </div>
            <p className="text-3xl font-bold text-white">{totalStudents}</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <h3 className="text-sm font-medium text-gray-400">Avg GX Score</h3>
            </div>
            <p className="text-3xl font-bold text-green-400">{avgGxScore}</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Award className="h-5 w-5 text-purple-400" />
              <h3 className="text-sm font-medium text-gray-400">Active in Programs</h3>
            </div>
            <p className="text-3xl font-bold text-purple-400">{activeInPrograms}</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="h-5 w-5 text-yellow-400" />
              <h3 className="text-sm font-medium text-gray-400">Placement Rate</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{placementRate}%</p>
          </div>
        </div>

        {/* Search & Sort Controls */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <form className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                name="search"
                placeholder="Search by name or email..."
                defaultValue={search || ''}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </form>
            <Link
              href={`/university/students?sort=${sortToggle}${search ? `&search=${search}` : ''}`}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
            >
              <ArrowUpDown className="h-4 w-4" />
              {sort === 'gx_score' ? 'Sort by Name' : 'Sort by GX Score'}
            </Link>
          </div>

          {/* Student Table */}
          {filteredStudents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableHead className="text-gray-400">Name</TableHead>
                  <TableHead className="text-gray-400">Email</TableHead>
                  <TableHead className="text-gray-400">GX Score</TableHead>
                  <TableHead className="text-gray-400">Skills</TableHead>
                  <TableHead className="text-gray-400">Applications</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const appCount = appsByStudent[student.user_id] || 0;
                  const skillCount = skillsByStudent[student.user_id] || 0;
                  const hasAccepted = studentsWithAccepted.has(student.user_id);
                  const isActive = appCount > 0;
                  const gxScore = student.gx_score || 0;

                  let scoreColor = 'text-red-400';
                  if (gxScore >= 80) scoreColor = 'text-green-400';
                  else if (gxScore >= 60) scoreColor = 'text-yellow-400';

                  return (
                    <TableRow key={student.user_id} className="border-gray-800 hover:bg-gray-800/50">
                      <TableCell>
                        <Link
                          href={`/university/students/${student.user_id}`}
                          className="text-blue-400 hover:text-blue-300 font-medium"
                        >
                          {student.full_name || 'Unnamed'}
                        </Link>
                      </TableCell>
                      <TableCell className="text-gray-300">{student.email || '--'}</TableCell>
                      <TableCell>
                        <span className={`font-semibold ${scoreColor}`}>{gxScore}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gray-700 text-gray-300 border-gray-600">
                          {skillCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">{appCount}</TableCell>
                      <TableCell>
                        {isActive ? (
                          <Badge className="bg-green-900/50 text-green-400 border-green-700">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-800 text-gray-500 border-gray-700">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400">No students found</h3>
              <p className="text-gray-500 mt-1">
                {search
                  ? 'No students match your search criteria.'
                  : 'No students from your institution have registered yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
