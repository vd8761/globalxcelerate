'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, Pencil, Eye, Calendar, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Opportunity {
  id: string;
  title: string;
  category: string;
  status: string;
  applications_count: number;
  deadline: string;
  created_at: string;
}

const categoryLabels: Record<string, string> = {
  internships: 'Internship',
  global_immersion: 'Global Immersion',
  exchange: 'Exchange Program',
  industry_projects: 'Industry Project',
  research: 'Research',
  scholarships: 'Scholarship',
  graduate_careers: 'Graduate Career',
};

const statusStyles: Record<string, string> = {
  draft: 'bg-gray-600/20 text-gray-400 border-gray-700',
  pending_review: 'bg-yellow-600/20 text-yellow-400 border-yellow-700',
  published: 'bg-green-600/20 text-green-400 border-green-700',
  closed: 'bg-red-600/20 text-red-400 border-red-700',
  archived: 'bg-gray-600/20 text-gray-500 border-gray-700',
};

const categoryColors: Record<string, string> = {
  internships: 'bg-blue-600/20 text-blue-400 border-blue-700',
  global_immersion: 'bg-purple-600/20 text-purple-400 border-purple-700',
  exchange: 'bg-cyan-600/20 text-cyan-400 border-cyan-700',
  industry_projects: 'bg-orange-600/20 text-orange-400 border-orange-700',
  research: 'bg-emerald-600/20 text-emerald-400 border-emerald-700',
  scholarships: 'bg-pink-600/20 text-pink-400 border-pink-700',
  graduate_careers: 'bg-indigo-600/20 text-indigo-400 border-indigo-700',
};

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
}

export default function EmployerOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOpportunities() {
      try {
        const res = await fetch('/api/v1/employer/opportunities');
        if (!res.ok) {
          throw new Error('Failed to fetch opportunities');
        }
        const data = await res.json();
        setOpportunities(data.opportunities ?? data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchOpportunities();
  }, []);

  return (
    <div className="min-h-screen bg-[#050607] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Opportunities</h1>
          <Link href="/employer/opportunities/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create New Opportunity
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="h-5 w-48 bg-gray-700 rounded" />
                  <div className="h-5 w-24 bg-gray-700 rounded" />
                  <div className="h-5 w-20 bg-gray-700 rounded" />
                  <div className="ml-auto flex gap-2">
                    <div className="h-8 w-16 bg-gray-700 rounded" />
                    <div className="h-8 w-28 bg-gray-700 rounded" />
                  </div>
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
        {!loading && !error && opportunities.length === 0 && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center flex flex-col items-center">
            <FileText className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No opportunities yet
            </h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Create your first opportunity to start attracting talented candidates from around the world.
            </p>
            <Link href="/employer/opportunities/new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create New Opportunity
              </Button>
            </Link>
          </div>
        )}

        {/* Opportunities List */}
        {!loading && !error && opportunities.length > 0 && (
          <div className="space-y-3">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-sm font-medium text-gray-500">
              <div className="col-span-3">Title</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Applications</div>
              <div className="col-span-2">Deadline</div>
              <div className="col-span-1">Created</div>
              <div className="col-span-2">Actions</div>
            </div>

            {/* Rows */}
            {opportunities.map((opportunity) => (
              <div
                key={opportunity.id}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 md:grid md:grid-cols-12 md:gap-4 md:items-center"
              >
                {/* Title */}
                <div className="col-span-3 mb-3 md:mb-0">
                  <h3 className="text-white font-medium truncate">
                    {opportunity.title}
                  </h3>
                </div>

                {/* Category */}
                <div className="col-span-2 mb-3 md:mb-0">
                  <Badge
                    variant="outline"
                    className={`text-xs ${categoryColors[opportunity.category] ?? 'bg-gray-600/20 text-gray-400 border-gray-700'}`}
                  >
                    {categoryLabels[opportunity.category] ?? opportunity.category}
                  </Badge>
                </div>

                {/* Status */}
                <div className="col-span-1 mb-3 md:mb-0">
                  <Badge
                    variant="outline"
                    className={`text-xs capitalize ${statusStyles[opportunity.status] ?? 'bg-gray-600/20 text-gray-400 border-gray-700'}`}
                  >
                    {opportunity.status.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Applications Count */}
                <div className="col-span-1 mb-3 md:mb-0">
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <Users className="w-3.5 h-3.5" />
                    <span>{opportunity.applications_count}</span>
                  </div>
                </div>

                {/* Deadline */}
                <div className="col-span-2 mb-3 md:mb-0">
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{opportunity.deadline ? formatDate(opportunity.deadline) : 'No deadline'}</span>
                  </div>
                </div>

                {/* Created */}
                <div className="col-span-1 mb-3 md:mb-0">
                  <span className="text-gray-400 text-sm">
                    {formatDate(opportunity.created_at)}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center gap-2">
                  <Link href={`/employer/opportunities/${opportunity.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/employer/applications?opportunity_id=${opportunity.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Applications
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
