export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'shortlisted'
  | 'assessment'
  | 'interview'
  | 'selected'
  | 'rejected'
  | 'withdrawn';

export type DocumentType = 'resume' | 'transcript' | 'certificate' | 'portfolio' | 'other';

export type UploadStatus = 'pending' | 'completed' | 'failed';

export interface Application {
  id: string;
  student_id: string;
  opportunity_id: string;
  organization_id: string;
  status: ApplicationStatus;
  cover_letter: string | null;
  cover_letter_plain: string | null;
  match_score: number | null;
  match_score_snapshot: Record<string, number> | null;
  withdrawal_reason: string | null;
  rejection_reason: string | null;
  rejection_feedback: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  decided_at: string | null;
  version: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationListItem {
  id: string;
  opportunity: {
    id: string;
    title: string;
    organization: {
      id: string;
      name: string;
      logo_url: string | null;
    };
    location: string | null;
    type: string | null;
    deadline: string | null;
  };
  status: ApplicationStatus;
  match_score: number | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  document_count: number;
  has_cover_letter: boolean;
}

export interface ApplicationDetail extends Application {
  opportunity: {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    location_country: string | null;
    location_city: string | null;
    work_mode: string | null;
    duration_months: number | null;
    compensation_type: string | null;
    deadline: string | null;
    organization: {
      id: string;
      name: string;
      logo_url: string | null;
      website: string | null;
    };
  };
  documents: ApplicationDocument[];
  status_history: StatusHistoryEntry[];
  reviewer_notes: ReviewerNote[];
}

export interface ApplicationDocument {
  id: string;
  application_id: string;
  student_id: string;
  document_type: DocumentType;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  storage_bucket: string;
  upload_status: UploadStatus;
  created_at: string;
  updated_at: string;
  download_url?: string;
}

export interface StatusHistoryEntry {
  id: string;
  from_status: ApplicationStatus | null;
  to_status: ApplicationStatus;
  actor_name: string | null;
  actor_role: string | null;
  notes: string | null;
  created_at: string;
}

export interface ReviewerNote {
  id: string;
  application_id: string;
  reviewer_id: string;
  reviewer_name: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  } | null;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}
