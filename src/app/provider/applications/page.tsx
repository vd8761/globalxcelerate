'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Application {
  id: string;
  status: string;
  created_at: string;
  gx_score: number | null;
  opportunity_id: string;
  program_title: string;
  applicant_name: string;
  applicant_email: string;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    submitted: { label: 'Submitted', className: 'bg-yellow-900/50 text-yellow-400 border-yellow-700' },
    under_review: { label: 'Under Review', className: 'bg-blue-900/50 text-blue-400 border-blue-700' },
    accepted: { label: 'Accepted', className: 'bg-green-900/50 text-green-400 border-green-700' },
    rejected: { label: 'Rejected', className: 'bg-red-900/50 text-red-400 border-red-700' },
    waitlisted: { label: 'Waitlisted', className: 'bg-purple-900/50 text-purple-400 border-purple-700' },
    pending: { label: 'Pending', className: 'bg-yellow-900/50 text-yellow-400 border-yellow-700' },
  };
  const { label, className } = config[status] ?? { label: status, className: 'bg-gray-600/50 text-gray-300 border-gray-600' };
  return <Badge className={className}>{label}</Badge>;
}

export default function ProviderApplicationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [programs, setPrograms] = useState<{ id: string; title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterProgram, setFilterProgram] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/provider/applications');
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(data.error?.message || 'Failed to fetch applications');
      }

      setApplications(data.data?.applications || []);
      setPrograms(data.data?.programs || []);
    } catch (err) {
      // Fallback: fetch programs first, then applications per program
      try {
        const programsRes = await fetch('/api/v1/provider/programs');
        const programsData = await programsRes.json();

        if (!programsRes.ok) {
          if (programsRes.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch programs');
        }

        const programsList = programsData.data?.programs || programsData.data || [];
        setPrograms(programsList.map((p: any) => ({ id: p.id, title: p.title })));

        // Set empty applications since the endpoint may not exist yet
        setApplications([]);
      } catch {
        toast({
          title: 'Error',
          description: 'Unable to load applications. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  async function handleAction(applicationId: string, action: 'accepted' | 'rejected' | 'waitlisted') {
    setActionLoading(`${applicationId}-${action}`);
    try {
      const res = await fetch(`/api/v1/provider/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || `Failed to ${action} application`);
      }

      toast({
        title: 'Success',
        description: `Application ${action} successfully.`,
      });

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: action } : app
        )
      );
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  }

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    if (filterProgram !== 'all' && app.opportunity_id !== filterProgram) return false;
    if (filterStatus !== 'all' && app.status !== filterStatus) return false;
    return true;
  });

  // Stats
  const totalCount = applications.length;
  const pendingCount = applications.filter((a) => a.status === 'submitted' || a.status === 'pending' || a.status === 'under_review').length;
  const acceptedCount = applications.filter((a) => a.status === 'accepted').length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050607] p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050607] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Applicant Review</h1>
          <p className="text-gray-400 mt-1">Review and manage applications to your programs</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-400">Total Applications</h3>
            </div>
            <p className="text-3xl font-bold text-white mt-2">{totalCount}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-400" />
              <h3 className="text-sm font-medium text-gray-400">Pending Review</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-400 mt-2">{pendingCount}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <h3 className="text-sm font-medium text-gray-400">Accepted</h3>
            </div>
            <p className="text-3xl font-bold text-green-400 mt-2">{acceptedCount}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-400" />
              <h3 className="text-sm font-medium text-gray-400">Rejected</h3>
            </div>
            <p className="text-3xl font-bold text-red-400 mt-2">{rejectedCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Select value={filterProgram} onValueChange={setFilterProgram}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Filter by program" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="waitlisted">Waitlisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Applications Table */}
          {filteredApplications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableHead className="text-gray-400">Applicant Name</TableHead>
                  <TableHead className="text-gray-400">Program</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">GX Score</TableHead>
                  <TableHead className="text-gray-400">Applied Date</TableHead>
                  <TableHead className="text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => {
                  const isExpanded = expandedRow === app.id;
                  const canAction = app.status === 'submitted' || app.status === 'pending' || app.status === 'under_review';

                  return (
                    <>
                      <TableRow
                        key={app.id}
                        className="border-gray-800 hover:bg-gray-800/50 cursor-pointer"
                        onClick={() => setExpandedRow(isExpanded ? null : app.id)}
                      >
                        <TableCell className="text-white font-medium">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            )}
                            {app.applicant_name || 'Unknown'}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">{app.program_title || '--'}</TableCell>
                        <TableCell>
                          <StatusBadge status={app.status} />
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${
                            (app.gx_score || 0) >= 80 ? 'text-green-400' :
                            (app.gx_score || 0) >= 60 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {app.gx_score ?? '--'}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {app.created_at
                            ? new Date(app.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : '--'}
                        </TableCell>
                        <TableCell>
                          {canAction ? (
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="sm"
                                onClick={() => handleAction(app.id, 'accepted')}
                                disabled={actionLoading !== null}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs h-7 px-2"
                              >
                                {actionLoading === `${app.id}-accepted` ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  'Accept'
                                )}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAction(app.id, 'rejected')}
                                disabled={actionLoading !== null}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs h-7 px-2"
                              >
                                {actionLoading === `${app.id}-rejected` ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  'Reject'
                                )}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAction(app.id, 'waitlisted')}
                                disabled={actionLoading !== null}
                                variant="outline"
                                className="border-gray-700 text-gray-300 hover:bg-gray-800 text-xs h-7 px-2"
                              >
                                {actionLoading === `${app.id}-waitlisted` ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  'Waitlist'
                                )}
                              </Button>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-xs">--</span>
                          )}
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow key={`${app.id}-detail`} className="border-gray-800 bg-gray-800/30">
                          <TableCell colSpan={6}>
                            <div className="py-3 px-4 space-y-2">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <span className="text-xs text-gray-500">Email</span>
                                  <p className="text-sm text-gray-300">{app.applicant_email || '--'}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500">Program</span>
                                  <p className="text-sm text-gray-300">{app.program_title}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500">GX Score</span>
                                  <p className={`text-sm font-semibold ${
                                    (app.gx_score || 0) >= 80 ? 'text-green-400' :
                                    (app.gx_score || 0) >= 60 ? 'text-yellow-400' :
                                    'text-red-400'
                                  }`}>
                                    {app.gx_score ?? 'Not available'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16">
              <ClipboardList className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400">No applications found</h3>
              <p className="text-gray-500 mt-1">
                {applications.length === 0
                  ? 'No applications have been received yet. Applications will appear here once students apply to your programs.'
                  : 'No applications match the current filters.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
