'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  User,
  Mail,
  Award,
  FileText,
  MessageSquare,
  Send,
  CheckCircle,
  Clock,
  Star,
  Phone,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface ApplicationDetail {
  id: string;
  status: string;
  match_score?: number;
  cover_letter?: string;
  submitted_at: string;
  updated_at?: string;
  opportunity_id: string;
  opportunity_title: string;
  student_name?: string;
  student_email?: string;
  student_gx_score?: number;
  student_phone?: string;
  documents?: { name: string; url?: string; type: string }[];
  reviewer_notes?: { id: string; content: string; created_at: string; author?: string }[];
}

const statusSteps = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'interview', label: 'Interview' },
  { key: 'offered', label: 'Offered' },
];

const statusStyles: Record<string, string> = {
  submitted: 'bg-blue-600/20 text-blue-400 border-blue-700',
  under_review: 'bg-yellow-600/20 text-yellow-400 border-yellow-700',
  shortlisted: 'bg-purple-600/20 text-purple-400 border-purple-700',
  interview: 'bg-orange-600/20 text-orange-400 border-orange-700',
  offered: 'bg-green-600/20 text-green-400 border-green-700',
  rejected: 'bg-red-600/20 text-red-400 border-red-700',
  withdrawn: 'bg-gray-600/20 text-gray-500 border-gray-700',
};

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

function getStepIndex(status: string): number {
  const idx = statusSteps.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : -1;
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchApplication() {
      try {
        const res = await fetch(`/api/v1/employer/applications/${id}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.error?.message ?? 'Failed to fetch application');
        }
        const json = await res.json();
        setApplication(json.data ?? json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchApplication();
  }, [id]);

  async function handleStatusChange(newStatus: string) {
    setActionLoading(newStatus);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/v1/employer/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error?.message ?? 'Failed to update status');
      }

      setApplication((prev) => (prev ? { ...prev, status: newStatus } : prev));
      setSuccessMessage(`Application moved to "${newStatus.replace(/_/g, ' ')}"`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAddNote() {
    if (!noteContent.trim()) return;
    setAddingNote(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/employer/applications/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteContent.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error?.message ?? 'Failed to add note');
      }

      const json = await res.json();
      const newNote = json.data ?? json;

      setApplication((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          reviewer_notes: [...(prev.reviewer_notes ?? []), newNote],
        };
      });
      setNoteContent('');
      setSuccessMessage('Note added successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050607] p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-64 bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-700 rounded animate-pulse" style={{ width: `${70 - i * 10}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state (when fetch fails entirely)
  if (error && !application) {
    return (
      <div className="min-h-screen bg-[#050607] p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Link
            href="/employer/applications"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Applications
          </Link>
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!application) return null;

  const currentStepIndex = getStepIndex(application.status);
  const isRejected = application.status === 'rejected';
  const isWithdrawn = application.status === 'withdrawn';
  const isTerminal = isRejected || isWithdrawn;

  return (
    <div className="min-h-screen bg-[#050607] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/employer/applications"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Application Detail</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                {application.opportunity_title}
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={`text-sm px-3 py-1 capitalize ${statusStyles[application.status] ?? 'bg-gray-600/20 text-gray-400 border-gray-700'}`}
          >
            {application.status.replace(/_/g, ' ')}
          </Badge>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="bg-green-900/20 border border-green-800 rounded-xl p-4">
            <p className="text-green-400 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Error message */}
        {error && application && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Status Pipeline */}
        {!isTerminal && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-sm font-medium text-gray-400 mb-4">Application Progress</h2>
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => {
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;

                return (
                  <div key={step.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors ${
                          isCompleted
                            ? 'bg-green-600 border-green-600 text-white'
                            : isActive
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-gray-800 border-gray-700 text-gray-500'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span
                        className={`text-xs mt-2 text-center ${
                          isActive ? 'text-blue-400 font-medium' : isCompleted ? 'text-green-400' : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 mx-2 mt-[-1rem] ${
                          index < currentStepIndex ? 'bg-green-600' : 'bg-gray-700'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rejected/Withdrawn Banner */}
        {isTerminal && (
          <div className={`rounded-xl p-4 border ${isRejected ? 'bg-red-900/20 border-red-800' : 'bg-gray-900/50 border-gray-700'}`}>
            <p className={`text-sm ${isRejected ? 'text-red-400' : 'text-gray-400'}`}>
              This application has been {application.status.replace(/_/g, ' ')}.
            </p>
          </div>
        )}

        {/* Applicant Info */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Applicant Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="text-white font-medium">
                  {application.student_name ?? 'Anonymous Student'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-white font-medium">
                  {application.student_email ?? 'Not provided'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">GX Score</p>
                <p className="text-white font-medium">
                  {application.student_gx_score != null ? (
                    <span className="text-purple-400">{application.student_gx_score}/100</span>
                  ) : (
                    'Not available'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Match Score</p>
                <p className="text-white font-medium">
                  {application.match_score != null ? (
                    <span className="text-green-400">{Math.round(application.match_score * 100)}%</span>
                  ) : (
                    'Not calculated'
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Submitted {formatDate(application.submitted_at)}</span>
            </div>
          </div>
        </div>

        {/* Cover Letter */}
        {application.cover_letter && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              Cover Letter
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {application.cover_letter}
              </p>
            </div>
          </div>
        )}

        {/* Documents */}
        {application.documents && application.documents.length > 0 && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              Documents
            </h2>
            <div className="space-y-3">
              {application.documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-white text-sm">{doc.name}</span>
                    <Badge variant="outline" className="text-xs bg-gray-700/50 text-gray-400 border-gray-600">
                      {doc.type}
                    </Badge>
                  </div>
                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!isTerminal && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Actions</h2>
            <div className="flex flex-wrap gap-3">
              {application.status === 'submitted' && (
                <Button
                  onClick={() => handleStatusChange('under_review')}
                  disabled={actionLoading !== null}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  {actionLoading === 'under_review' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Clock className="w-4 h-4 mr-2" />
                  )}
                  Move to Review
                </Button>
              )}

              {(application.status === 'submitted' || application.status === 'under_review') && (
                <Button
                  onClick={() => handleStatusChange('shortlisted')}
                  disabled={actionLoading !== null}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {actionLoading === 'shortlisted' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Star className="w-4 h-4 mr-2" />
                  )}
                  Shortlist
                </Button>
              )}

              {(application.status === 'shortlisted' || application.status === 'under_review') && (
                <Button
                  onClick={() => handleStatusChange('interview')}
                  disabled={actionLoading !== null}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {actionLoading === 'interview' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Phone className="w-4 h-4 mr-2" />
                  )}
                  Schedule Interview
                </Button>
              )}

              {(application.status === 'interview' || application.status === 'shortlisted') && (
                <Button
                  onClick={() => handleStatusChange('offered')}
                  disabled={actionLoading !== null}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {actionLoading === 'offered' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Make Offer
                </Button>
              )}

              <Button
                onClick={() => handleStatusChange('rejected')}
                disabled={actionLoading !== null}
                variant="outline"
                className="border-red-700 text-red-400 hover:bg-red-900/20 hover:text-red-300"
              >
                {actionLoading === 'rejected' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Reject
              </Button>
            </div>
          </div>
        )}

        {/* Reviewer Notes */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gray-400" />
            Reviewer Notes
          </h2>

          {/* Existing Notes */}
          {application.reviewer_notes && application.reviewer_notes.length > 0 ? (
            <div className="space-y-3 mb-6">
              {application.reviewer_notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
                >
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    {note.author && <span>{note.author}</span>}
                    {note.author && <span>&middot;</span>}
                    <span>{formatDate(note.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-6">No notes yet. Add a note below.</p>
          )}

          {/* Add Note Form */}
          <div className="space-y-3">
            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Add a note about this application..."
              rows={3}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleAddNote}
                disabled={addingNote || !noteContent.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {addingNote ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Add Note
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
