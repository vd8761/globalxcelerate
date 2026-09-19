'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Filter, Search, Users, FileText, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Application {
  id: string;
  student_name?: string;
  opportunity_title: string;
  status: string;
  match_score?: number;
  submitted_at: string;
}

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview', label: 'Interview' },
  { value: 'selected', label: 'Selected' },
  { value: 'rejected', label: 'Rejected' },
];

const statusStyles: Record<string, string> = {
  draft: 'bg-gray-600/20 text-gray-400',
  submitted: 'bg-blue-600/20 text-blue-400',
  under_review: 'bg-yellow-600/20 text-yellow-400',
  shortlisted: 'bg-purple-600/20 text-purple-400',
  assessment: 'bg-indigo-600/20 text-indigo-400',
  interview: 'bg-cyan-600/20 text-cyan-400',
  selected: 'bg-green-600/20 text-green-400',
  rejected: 'bg-red-600/20 text-red-400',
  withdrawn: 'bg-gray-600/20 text-gray-500',
};

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
}

export default function EmployerApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [opportunityId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApplications() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter && statusFilter !== 'all') {
          params.set('status', statusFilter);
        }
        if (opportunityId) {
          params.set('opportunity_id', opportunityId);
        }
        params.set('sort_by', 'submitted_at');
        params.set('sort_order', 'desc');

        const res = await fetch(`/api/v1/employer/applications?${params.toString()}`);
        if (!res.ok) {
          throw new Error('Failed to fetch applications');
        }
        const json = await res.json();
        setApplications(json.data ?? json.applications ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, [statusFilter, opportunityId]);

  const filteredApplications = applications.filter((app) => {
    if (!searchQuery) return true;
    const name = app.student_name ?? 'Anonymous Student';
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.opportunity_title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-[#050607] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Applications</h1>
            <p className="text-gray-400 mt-1">
              Review and manage candidate applications
            </p>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Users className="w-5 h-5" />
            <span className="text-sm">
              {filteredApplications.length} application
              {filteredApplications.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by applicant or opportunity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {statusOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-white hover:bg-gray-700"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="h-5 w-36 bg-gray-700 rounded" />
                  <div className="h-5 w-48 bg-gray-700 rounded" />
                  <div className="h-5 w-24 bg-gray-700 rounded" />
                  <div className="h-5 w-16 bg-gray-700 rounded" />
                  <div className="ml-auto h-8 w-20 bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredApplications.length === 0 && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center flex flex-col items-center">
            <FileText className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No applications found
            </h3>
            <p className="text-gray-400 mb-6 max-w-md">
              {statusFilter !== 'all'
                ? 'No applications match the current filter. Try changing the status filter.'
                : 'Applications will appear here once candidates apply to your opportunities.'}
            </p>
          </div>
        )}

        {/* Applications List */}
        {!loading && !error && filteredApplications.length > 0 && (
          <div className="space-y-3">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-sm font-medium text-gray-500">
              <div className="col-span-3">Applicant</div>
              <div className="col-span-3">Opportunity</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Match</div>
              <div className="col-span-2">Submitted</div>
              <div className="col-span-1">Action</div>
            </div>

            {/* Rows */}
            {filteredApplications.map((application) => (
              <div
                key={application.id}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 md:grid md:grid-cols-12 md:gap-4 md:items-center hover:border-gray-700 transition-colors"
              >
                {/* Applicant Name */}
                <div className="col-span-3 mb-3 md:mb-0">
                  <h3 className="text-white font-medium truncate">
                    {application.student_name ?? 'Anonymous Student'}
                  </h3>
                </div>

                {/* Opportunity Title */}
                <div className="col-span-3 mb-3 md:mb-0">
                  <p className="text-gray-400 text-sm truncate">
                    {application.opportunity_title}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="col-span-2 mb-3 md:mb-0">
                  <Badge
                    variant="outline"
                    className={`text-xs capitalize border-transparent ${
                      statusStyles[application.status] ??
                      'bg-gray-600/20 text-gray-400'
                    }`}
                  >
                    {application.status.replace(/_/g, ' ')}
                  </Badge>
                </div>

                {/* Match Score */}
                <div className="col-span-1 mb-3 md:mb-0">
                  {application.match_score != null ? (
                    <span className="text-sm font-medium text-green-400">
                      {Math.round(application.match_score * 100)}%
                    </span>
                  ) : (
                    <span className="text-sm text-gray-600">--</span>
                  )}
                </div>

                {/* Submitted Date */}
                <div className="col-span-2 mb-3 md:mb-0">
                  <span className="text-gray-400 text-sm">
                    {formatDate(application.submitted_at)}
                  </span>
                </div>

                {/* View Action */}
                <div className="col-span-1">
                  <Link href={`/employer/applications/${application.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
