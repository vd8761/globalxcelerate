'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, MapPin, Clock, Briefcase, Calendar } from 'lucide-react';
import type { ApplicationDetail } from '@/lib/applications/types';
import { useApplicationDetail } from '@/hooks/applications/use-application-detail';
import { useApplicationRealtime } from '@/hooks/applications/use-application-realtime';
import { canStudentEdit, canStudentWithdraw } from '@/lib/applications/transitions';
import { ApplicationStatusBadge } from './application-status-badge';
import { ApplicationTimeline } from './application-timeline';
import { CoverLetterDisplay } from './cover-letter-display';
import { CoverLetterEditor } from './cover-letter-editor';
import { MatchScoreGauge } from './match-score-gauge';
import { DocumentList } from './document-list';
import { DocumentUploadZone } from './document-upload-zone';
import { WithdrawalDialog } from './withdrawal-dialog';
import { useUpdateApplication } from '@/hooks/applications/use-update-application';
import { useDeleteDocument } from '@/hooks/applications/use-application-documents';
import { formatRelativeDate } from '@/lib/applications/utils';

interface Props {
  initialData: ApplicationDetail;
  applicationId: string;
}

export function ApplicationDetailContent({ initialData, applicationId }: Props) {
  const { data: application } = useApplicationDetail(applicationId, initialData);
  useApplicationRealtime(applicationId);

  const [isEditingCoverLetter, setIsEditingCoverLetter] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const updateMutation = useUpdateApplication(applicationId);
  const deleteMutation = useDeleteDocument(applicationId);

  const app = application ?? initialData;
  const isDraft = canStudentEdit(app.status);
  const canWithdraw = canStudentWithdraw(app.status);

  const handleCoverLetterSave = (html: string) => {
    updateMutation.mutate(
      { cover_letter: html, version: app.version },
      { onSuccess: () => setIsEditingCoverLetter(false) }
    );
  };

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
        <Link href="/student/applications" className="hover:text-cyan-700 transition-colors">Applications</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 font-medium truncate max-w-[300px]">
          {app.opportunity?.title ?? 'Application'}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Opportunity Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200 overflow-hidden">
                {app.opportunity?.organization?.logo_url ? (
                  <img src={app.opportunity.organization.logo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-base font-bold text-slate-500">
                    {app.opportunity?.organization?.name?.charAt(0) ?? '?'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-slate-900 leading-tight">
                  {app.opportunity?.title}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {app.opportunity?.organization?.name}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
                  {app.opportunity?.location_country && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {app.opportunity.location_city ? `${app.opportunity.location_city}, ` : ''}
                      {app.opportunity.location_country}
                    </span>
                  )}
                  {app.opportunity?.work_mode && (
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {app.opportunity.work_mode}
                    </span>
                  )}
                  {app.opportunity?.deadline && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Deadline: {new Date(app.opportunity.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <ApplicationStatusBadge status={app.status} />
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-5">Application Progress</h3>
            <ApplicationTimeline statusHistory={app.status_history} currentStatus={app.status} />
          </div>

          {/* Cover Letter */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Cover Letter</h3>
              {isDraft && !isEditingCoverLetter && (
                <button
                  onClick={() => setIsEditingCoverLetter(true)}
                  className="text-xs font-medium text-cyan-700 hover:text-cyan-800 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>
            {isEditingCoverLetter && isDraft ? (
              <CoverLetterEditor
                value={app.cover_letter ?? ''}
                onChange={handleCoverLetterSave}
                maxLength={5000}
              />
            ) : (
              <CoverLetterDisplay
                content={app.cover_letter}
                showEditButton={isDraft}
                onEdit={() => setIsEditingCoverLetter(true)}
              />
            )}
          </div>

          {/* Status History */}
          {app.status_history.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Status History</h3>
              <div className="space-y-3">
                {app.status_history.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 text-sm">
                    <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-300 mt-2" />
                    <div>
                      <p className="text-slate-700">
                        <span className="font-medium">{entry.to_status.replace(/_/g, ' ')}</span>
                        {entry.actor_name && <span className="text-slate-400"> by {entry.actor_name}</span>}
                      </p>
                      {entry.notes && <p className="text-slate-500 text-xs mt-0.5">{entry.notes}</p>}
                      <p className="text-slate-400 text-xs mt-0.5">{formatRelativeDate(entry.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Match Score */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 text-center">Match Score</h3>
            <div className="flex justify-center mb-3">
              <MatchScoreGauge score={app.match_score} size="lg" />
            </div>
            {app.match_score_snapshot && (
              <div className="space-y-2 mt-4">
                {Object.entries(app.match_score_snapshot).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-20 capitalize">{key.replace(/_/g, ' ')}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-slate-800 to-cyan-500 transition-all duration-700"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-700 w-8 text-right">{value}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Documents</h3>
            <DocumentList
              documents={app.documents}
              canDelete={isDraft}
              onDelete={(docId) => deleteMutation.mutate(docId)}
            />
            {isDraft && (
              <div className="mt-4">
                <DocumentUploadZone
                  applicationId={applicationId}
                  currentDocumentCount={app.documents.length}
                  maxDocuments={5}
                  onUploadComplete={() => {}}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Actions</h3>
            <div className="space-y-3">
              {isDraft && (
                <button
                  onClick={() => {
                    updateMutation.mutate({ status: 'submitted', version: app.version });
                  }}
                  disabled={!app.cover_letter || app.documents.length === 0 || updateMutation.isPending}
                  className="w-full px-4 py-2.5 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updateMutation.isPending ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
              {canWithdraw && (
                <button
                  onClick={() => setWithdrawOpen(true)}
                  className="w-full px-4 py-2.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Withdraw Application
                </button>
              )}
              {!isDraft && !canWithdraw && (
                <p className="text-xs text-slate-400 text-center">
                  No actions available for this status
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Dialog */}
      <WithdrawalDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        applicationId={applicationId}
        applicationVersion={app.version}
        onWithdrawn={() => setWithdrawOpen(false)}
      />
    </>
  );
}
