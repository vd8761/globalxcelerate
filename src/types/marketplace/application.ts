export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'shortlisted'
  | 'interview'
  | 'offered'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export interface ApplicationDocument {
  name: string;
  storage_path: string;
  type: 'resume' | 'transcript' | 'cover_letter_pdf' | 'portfolio' | 'other';
  size_bytes: number;
}

export interface ApplicationSubmission {
  cover_letter?: string;
  documents: ApplicationDocument[];
  additional_answers?: Record<string, string>;
}

export interface ApplicationResponse {
  id: string;
  reference_number: string;
  opportunity_id: string;
  status: ApplicationStatus;
  submitted_at: string;
  match_score_at_submission: number | null;
}
