import { z } from 'zod';

const applicationStatuses = [
  'draft', 'submitted', 'under_review', 'shortlisted',
  'assessment', 'interview', 'selected', 'rejected', 'withdrawn',
] as const;

const documentTypes = ['resume', 'transcript', 'certificate', 'portfolio', 'other'] as const;

const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
] as const;

export const createApplicationSchema = z.object({
  opportunity_id: z.string().uuid('Invalid opportunity ID'),
  cover_letter: z.string().max(5000, 'Cover letter cannot exceed 5000 characters').optional(),
  status: z.enum(['draft', 'submitted']).default('draft'),
}).refine(
  (data) => {
    if (data.status === 'submitted') {
      const plainText = data.cover_letter?.replace(/<[^>]*>/g, '').trim();
      return plainText && plainText.length > 0;
    }
    return true;
  },
  { message: 'Cover letter is required when submitting', path: ['cover_letter'] }
);

export const updateApplicationSchema = z.object({
  cover_letter: z.string().max(5000, 'Cover letter cannot exceed 5000 characters').optional(),
  status: z.enum(['submitted']).optional(),
  version: z.number().int().positive('Version must be a positive integer'),
});

export const statusTransitionSchema = z.object({
  to_status: z.enum(applicationStatuses),
  notes: z.string().max(1000).optional(),
  rejection_feedback: z.string().max(500).optional(),
  withdrawal_reason: z.string().min(10, 'Withdrawal reason must be at least 10 characters').max(500).optional(),
  version: z.number().int().positive(),
}).refine(
  (data) => {
    if (data.to_status === 'rejected') {
      return data.notes && data.notes.trim().length >= 20;
    }
    return true;
  },
  { message: 'Rejection notes are required and must be at least 20 characters', path: ['notes'] }
).refine(
  (data) => {
    if (data.to_status === 'withdrawn') {
      return data.withdrawal_reason && data.withdrawal_reason.trim().length >= 10;
    }
    return true;
  },
  { message: 'Withdrawal reason is required (min 10 characters)', path: ['withdrawal_reason'] }
);

export const documentUploadSchema = z.object({
  file_name: z.string().min(1, 'File name is required').max(255),
  document_type: z.enum(documentTypes),
  file_size: z.number().int().positive().max(10485760, 'File size cannot exceed 10MB'),
  mime_type: z.enum(allowedMimeTypes, { errorMap: () => ({ message: 'Unsupported file type' }) }),
});

export const reviewerNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required').max(2000, 'Note cannot exceed 2000 characters'),
});

export const batchStatusSchema = z.object({
  application_ids: z.array(z.string().uuid()).min(1, 'At least one application is required').max(50, 'Maximum 50 applications per batch'),
  to_status: z.enum(applicationStatuses),
  notes: z.string().max(1000).optional(),
});

export const applicationListQuerySchema = z.object({
  status: z.string().optional(),
  opportunity_id: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  sort_by: z.enum(['submitted_at', 'created_at', 'status', 'match_score']).default('submitted_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().min(1).max(50).default(12),
});

// Inferred types
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type StatusTransitionInput = z.infer<typeof statusTransitionSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
export type ReviewerNoteInput = z.infer<typeof reviewerNoteSchema>;
export type BatchStatusInput = z.infer<typeof batchStatusSchema>;
export type ApplicationListQuery = z.infer<typeof applicationListQuerySchema>;
