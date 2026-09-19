'use client';

import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Search, Briefcase } from 'lucide-react';

interface Opportunity {
  id: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
  published_at: string | null;
  organization: { name: string; logo_url: string | null } | null;
  employer: { full_name: string; email?: string } | null;
}

interface Meta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export default function AdminOpportunitiesPage() {
  const [pendingOpportunities, setPendingOpportunities] = useState<Opportunity[]>([]);
  const [allOpportunities, setAllOpportunities] = useState<Opportunity[]>([]);
  const [pendingMeta, setPendingMeta] = useState<Meta>({ page: 1, per_page: 20, total: 0, total_pages: 0 });
  const [allMeta, setAllMeta] = useState<Meta>({ page: 1, per_page: 20, total: 0, total_pages: 0 });
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingAll, setLoadingAll] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPendingOpportunities = useCallback(async () => {
    setLoadingPending(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        per_page: '50',
        status: 'pending_review',
      });

      const res = await fetch(`/api/v1/admin/opportunities?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setPendingOpportunities(json.data || []);
        setPendingMeta(json.meta);
      }
    } catch (error) {
      console.error('Failed to fetch pending opportunities:', error);
    } finally {
      setLoadingPending(false);
    }
  }, []);

  const fetchAllOpportunities = useCallback(async () => {
    setLoadingAll(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        per_page: '50',
      });
      if (statusFilter && statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      if (search) {
        params.set('search', search);
      }

      const res = await fetch(`/api/v1/admin/opportunities?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setAllOpportunities(json.data || []);
        setAllMeta(json.meta);
      }
    } catch (error) {
      console.error('Failed to fetch opportunities:', error);
    } finally {
      setLoadingAll(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchPendingOpportunities();
  }, [fetchPendingOpportunities]);

  useEffect(() => {
    fetchAllOpportunities();
  }, [fetchAllOpportunities]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/v1/admin/opportunities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'approve' }),
      });
      const json = await res.json();
      if (json.success) {
        fetchPendingOpportunities();
        fetchAllOpportunities();
      }
    } catch (error) {
      console.error('Approve failed:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectOpen = (id: string) => {
    setSelectedOpportunityId(id);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedOpportunityId) return;
    setActionLoading(selectedOpportunityId);
    try {
      const res = await fetch('/api/v1/admin/opportunities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedOpportunityId,
          action: 'reject',
          reason: rejectReason,
        }),
      });
      const json = await res.json();
      if (json.success) {
        fetchPendingOpportunities();
        fetchAllOpportunities();
      }
    } catch (error) {
      console.error('Reject failed:', error);
    } finally {
      setActionLoading(null);
      setRejectDialogOpen(false);
      setSelectedOpportunityId(null);
      setRejectReason('');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'internship':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'job':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'research':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'fellowship':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending_review':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'draft':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'archived':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const renderLoadingSkeleton = () => (
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i} className="border-gray-800">
        <TableCell><Skeleton className="h-5 w-48 bg-gray-800" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24 bg-gray-800" /></TableCell>
        <TableCell><Skeleton className="h-5 w-20 bg-gray-800" /></TableCell>
        <TableCell><Skeleton className="h-5 w-20 bg-gray-800" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24 bg-gray-800" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24 bg-gray-800" /></TableCell>
      </TableRow>
    ))
  );

  const renderOpportunityRow = (opp: Opportunity, showActions: boolean) => (
    <TableRow key={opp.id} className="border-gray-800 hover:bg-gray-800/30">
      <TableCell>
        <div>
          <p className="text-white font-medium">{opp.title}</p>
          <p className="text-gray-400 text-sm">{opp.organization?.name || 'Unknown Org'}</p>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={getCategoryBadgeClass(opp.category)}>
          {opp.category}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={getStatusBadgeClass(opp.status)}>
          {opp.status.replace('_', ' ')}
        </Badge>
      </TableCell>
      <TableCell className="text-gray-300">{formatDate(opp.created_at)}</TableCell>
      <TableCell>
        {showActions ? (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleApprove(opp.id)}
              disabled={actionLoading === opp.id}
              className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
            >
              <CheckCircle className="mr-1 h-3.5 w-3.5" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleRejectOpen(opp.id)}
              disabled={actionLoading === opp.id}
              className="bg-red-600 hover:bg-red-700 text-white h-8 px-3"
            >
              <XCircle className="mr-1 h-3.5 w-3.5" />
              Reject
            </Button>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">{formatDate(opp.published_at)}</span>
        )}
      </TableCell>
    </TableRow>
  );

  return (
    <div className="min-h-screen bg-[#050607] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Opportunity Moderation</h1>
          <p className="text-gray-400 mt-1">Review and manage platform opportunities</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-900/50 border border-gray-800">
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white text-gray-400"
            >
              Pending Review ({pendingMeta.total})
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400"
            >
              All Opportunities ({allMeta.total})
            </TabsTrigger>
          </TabsList>

          {/* Pending Review Tab */}
          <TabsContent value="pending" className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800 hover:bg-transparent">
                    <TableHead className="text-gray-400">Title / Organization</TableHead>
                    <TableHead className="text-gray-400">Category</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Submitted</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingPending ? (
                    renderLoadingSkeleton()
                  ) : pendingOpportunities.length === 0 ? (
                    <TableRow className="border-gray-800">
                      <TableCell colSpan={5} className="text-center text-gray-400 py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Briefcase className="h-8 w-8 text-gray-600" />
                          <p>No opportunities pending review</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingOpportunities.map((opp) => renderOpportunityRow(opp, true))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* All Opportunities Tab */}
          <TabsContent value="all" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search opportunities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-500"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-gray-900/50 border-gray-800 text-white">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800 hover:bg-transparent">
                    <TableHead className="text-gray-400">Title / Organization</TableHead>
                    <TableHead className="text-gray-400">Category</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Submitted</TableHead>
                    <TableHead className="text-gray-400">Published</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingAll ? (
                    renderLoadingSkeleton()
                  ) : allOpportunities.length === 0 ? (
                    <TableRow className="border-gray-800">
                      <TableCell colSpan={5} className="text-center text-gray-400 py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Briefcase className="h-8 w-8 text-gray-600" />
                          <p>No opportunities found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    allOpportunities.map((opp) => renderOpportunityRow(opp, false))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Reject Reason Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Reject Opportunity</DialogTitle>
            <DialogDescription className="text-gray-400">
              Please provide a reason for rejecting this opportunity. This will be shared with the submitter.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setRejectDialogOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={actionLoading !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
