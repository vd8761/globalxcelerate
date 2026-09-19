import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { ProgramDetailActions } from './program-detail-actions';

export const metadata = {
  title: 'Program Detail | GlobalXcelerate',
  description: 'View and manage program details',
};

function ApplicationStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    submitted: { label: 'Submitted', className: 'bg-yellow-900/50 text-yellow-400 border-yellow-700' },
    under_review: { label: 'Under Review', className: 'bg-blue-900/50 text-blue-400 border-blue-700' },
    accepted: { label: 'Accepted', className: 'bg-green-900/50 text-green-400 border-green-700' },
    rejected: { label: 'Rejected', className: 'bg-red-900/50 text-red-400 border-red-700' },
    waitlisted: { label: 'Waitlisted', className: 'bg-purple-900/50 text-purple-400 border-purple-700' },
  };
  const { label, className } = config[status] ?? { label: status, className: 'bg-gray-600/50 text-gray-300 border-gray-600' };
  return <Badge className={className}>{label}</Badge>;
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('program_provider_profiles')
    .select('organization_id, organization_name, onboarding_status')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.onboarding_status !== 'complete') {
    redirect('/provider/setup');
  }

  // Fetch the program
  const { data: program, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !program) {
    redirect('/provider/programs');
  }

  // Verify ownership
  if (program.organization_id !== profile.organization_id) {
    redirect('/provider/programs');
  }

  // Fetch applications for this program
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      id, status, created_at, gx_score,
      student_profiles (
        first_name, last_name
      )
    `)
    .eq('opportunity_id', id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const categoryLabels: Record<string, string> = {
    global_immersion: 'Global Immersion',
    exchange: 'Exchange',
    research: 'Research',
    scholarships: 'Scholarships',
    internships: 'Internships',
    industry_projects: 'Industry Projects',
    graduate_careers: 'Graduate Careers',
  };

  const workModeLabels: Record<string, string> = {
    onsite: 'On-site',
    remote: 'Remote',
    hybrid: 'Hybrid',
  };

  return (
    <div className="min-h-screen bg-[#050607] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/provider/programs"
            className="inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Programs
          </Link>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{program.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge className="bg-blue-900/50 text-blue-400 border-blue-700">
                {categoryLabels[program.category] ?? program.category}
              </Badge>
              <Badge className={
                program.status === 'published' ? 'bg-green-900/50 text-green-400 border-green-700' :
                program.status === 'draft' ? 'bg-gray-600/50 text-gray-300 border-gray-600' :
                program.status === 'archived' ? 'bg-red-900/50 text-red-400 border-red-700' :
                'bg-yellow-900/50 text-yellow-400 border-yellow-700'
              }>
                {program.status === 'published' ? 'Active' : program.status.charAt(0).toUpperCase() + program.status.slice(1)}
              </Badge>
            </div>
          </div>

          <ProgramDetailActions programId={program.id} currentStatus={program.status} />
        </div>

        {/* Program Details */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white">Details</h2>

          {program.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Description</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{program.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(program.location_country || program.location_city) && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Location</h3>
                  <p className="text-gray-300">
                    {[program.location_city, program.location_country].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            )}

            {program.work_mode && (
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Work Mode</h3>
                  <p className="text-gray-300">{workModeLabels[program.work_mode] ?? program.work_mode}</p>
                </div>
              </div>
            )}

            {program.duration_value && program.duration_unit && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Duration</h3>
                  <p className="text-gray-300">{program.duration_value} {program.duration_unit}</p>
                </div>
              </div>
            )}

            {program.start_date && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Start Date</h3>
                  <p className="text-gray-300">{new Date(program.start_date).toLocaleDateString()}</p>
                </div>
              </div>
            )}

            {program.application_deadline && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Application Deadline</h3>
                  <p className="text-gray-300">{new Date(program.application_deadline).toLocaleDateString()}</p>
                </div>
              </div>
            )}

            {program.spots_available && (
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Spots</h3>
                  <p className="text-gray-300">{program.spots_filled ?? 0} / {program.spots_available} filled</p>
                </div>
              </div>
            )}
          </div>

          {program.requirements && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Requirements</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{program.requirements}</p>
            </div>
          )}

          {program.eligibility_criteria && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Eligibility Criteria</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{program.eligibility_criteria}</p>
            </div>
          )}
        </div>

        {/* Applicants Section */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Applicants ({(applications ?? []).length})
          </h2>

          {(!applications || applications.length === 0) ? (
            <div className="text-center py-8">
              <Users className="h-10 w-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No applications yet for this program.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableHead className="text-gray-400">Applicant Name</TableHead>
                  <TableHead className="text-gray-400">GX Score</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Applied Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app: Record<string, unknown>) => {
                  const studentProfile = app.student_profiles as { first_name?: string; last_name?: string } | null;
                  const applicantName = studentProfile
                    ? `${studentProfile.first_name ?? ''} ${studentProfile.last_name ?? ''}`.trim()
                    : 'Unknown';
                  return (
                    <TableRow key={app.id as string} className="border-gray-800 hover:bg-gray-800/50">
                      <TableCell className="text-white font-medium">{applicantName}</TableCell>
                      <TableCell className="text-gray-300">
                        {(app.gx_score as number) ?? '--'}
                      </TableCell>
                      <TableCell>
                        <ApplicationStatusBadge status={app.status as string} />
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(app.created_at as string).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
