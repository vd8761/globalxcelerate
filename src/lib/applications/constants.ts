import type { ApplicationStatus } from './types';

export const STATUS_COLORS: Record<ApplicationStatus, { bg: string; text: string; border: string }> = {
  draft: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  submitted: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  under_review: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  shortlisted: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  assessment: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  interview: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  selected: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  withdrawn: { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-300' },
};

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  assessment: 'Assessment',
  interview: 'Interview',
  selected: 'Selected',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

export const STATUS_ORDER: ApplicationStatus[] = [
  'draft',
  'submitted',
  'under_review',
  'shortlisted',
  'assessment',
  'interview',
  'selected',
  'rejected',
  'withdrawn',
];

export const PIPELINE_STAGES: ApplicationStatus[] = [
  'draft',
  'submitted',
  'under_review',
  'shortlisted',
  'assessment',
  'interview',
  'selected',
];

export const FILTER_TABS: { id: string; label: string; statuses: ApplicationStatus[] }[] = [
  { id: 'all', label: 'All', statuses: [] },
  { id: 'active', label: 'Active', statuses: ['submitted', 'under_review', 'shortlisted', 'assessment', 'interview'] },
  { id: 'draft', label: 'Draft', statuses: ['draft'] },
  { id: 'selected', label: 'Selected', statuses: ['selected'] },
  { id: 'rejected', label: 'Rejected', statuses: ['rejected'] },
  { id: 'withdrawn', label: 'Withdrawn', statuses: ['withdrawn'] },
];

export const MAX_DOCUMENTS = 5;
export const MAX_COVER_LETTER_LENGTH = 5000;
export const MAX_FILE_SIZE = 10485760; // 10MB

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
] as const;

export const ITEMS_PER_PAGE = 12;
export const SEARCH_DEBOUNCE_MS = 300;

export const SORT_OPTIONS = [
  { value: 'submitted_at:desc', label: 'Newest First' },
  { value: 'submitted_at:asc', label: 'Oldest First' },
  { value: 'status:asc', label: 'Status' },
  { value: 'match_score:desc', label: 'Match Score' },
] as const;
