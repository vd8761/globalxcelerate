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
import { Plus, FileText, CheckCircle, Archive, PenLine } from 'lucide-react';

export const metadata = {
  title: 'Programs | GlobalXcelerate',
  description: 'Manage your programs',
};

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-gray-600/50 text-gray-300 border-gray-600' },
    published: { label: 'Active', className: 'bg-green-900/50 text-green-400 border-green-700' },
    closed: { label: 'Closed', className: 'bg-yellow-900/50 text-yellow-400 border-yellow-700' },
    archived: { label: 'Archived', className: 'bg-red-900/50 text-red-400 border-red-700' },
  };
  const { label, className } = config[status] ?? { label: status, className: 'bg-gray-600/50 text-gray-300 border-gray-600' };
  return <Badge className={className}>{label}</Badge>;
}

function CategoryBadge({ category }: { category: string }) {
  const labels: Record<string, string> = {
    global_immersion: 'Global Immersion',
    exchange: 'Exchange',
    research: 'Research',
    scholarships: 'Scholarships',
    internships: 'Internships',
    industry_projects: 'Industry Projects',
    graduate_careers: 'Graduate Careers',
  };
  return (
    <Badge className="bg-blue-900/50 text-blue-400 border-blue-700">
      {labels[category] ?? category}
    </Badge>
  );
}

export default async function ProviderProgramsPage() {
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

  // Fetch programs
  const { data: programs } = await supabase
    .from('opportunities')
    .select(`
      id, title, category, status, location_country, location_city,
      start_date, application_deadline, spots_available, spots_filled, created_at
    `)
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false });

  // Get application counts
  const programIds = (programs ?? []).map((p) => p.id);
  let applicationCounts: Record<string, number> = {};

  if (programIds.length > 0) {
    const { data: countData } = await supabase
      .from('applications')
      .select('opportunity_id')
      .in('opportunity_id', programIds)
      .is('deleted_at', null);

    if (countData) {
      for (const row of countData) {
        const oppId = row.opportunity_id;
        applicationCounts[oppId] = (applicationCounts[oppId] || 0) + 1;
      }
    }
  }

  // Calculate stats
  const allPrograms = programs ?? [];
  const totalCount = allPrograms.length;
  const activeCount = allPrograms.filter((p) => p.status === 'published').length;
  const draftCount = allPrograms.filter((p) => p.status === 'draft').length;
  const archivedCount = allPrograms.filter((p) => p.status === 'archived').length;

  return (
    <div className="min-h-screen bg-[#050607] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Programs</h1>
            <p className="text-gray-400 mt-1">Manage your programs and opportunities</p>
          </div>
          <Link
            href="/provider/programs/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create New Program
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-400">Total Programs</h3>
            </div>
            <p className="text-3xl font-bold text-white mt-2">{totalCount}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <h3 className="text-sm font-medium text-gray-400">Active</h3>
            </div>
            <p className="text-3xl font-bold text-green-400 mt-2">{activeCount}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <PenLine className="h-5 w-5 text-yellow-400" />
              <h3 className="text-sm font-medium text-gray-400">Draft</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-400 mt-2">{draftCount}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <Archive className="h-5 w-5 text-red-400" />
              <h3 className="text-sm font-medium text-gray-400">Archived</h3>
            </div>
            <p className="text-3xl font-bold text-red-400 mt-2">{archivedCount}</p>
          </div>
        </div>

        {/* Programs Table */}
        {allPrograms.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No programs yet</h3>
            <p className="text-gray-400 mb-6">
              Create your first program to start accepting applications.
            </p>
            <Link
              href="/provider/programs/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create New Program
            </Link>
          </div>
        ) : (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableHead className="text-gray-400">Title</TableHead>
                  <TableHead className="text-gray-400">Category</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Applications</TableHead>
                  <TableHead className="text-gray-400">Start Date</TableHead>
                  <TableHead className="text-gray-400">Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allPrograms.map((program) => (
                  <TableRow key={program.id} className="border-gray-800 hover:bg-gray-800/50">
                    <TableCell>
                      <Link
                        href={`/provider/programs/${program.id}`}
                        className="text-white font-medium hover:text-blue-400 transition-colors"
                      >
                        {program.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <CategoryBadge category={program.category} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={program.status} />
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {applicationCounts[program.id] || 0}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {program.start_date
                        ? new Date(program.start_date).toLocaleDateString()
                        : '--'}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {program.application_deadline
                        ? new Date(program.application_deadline).toLocaleDateString()
                        : '--'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
