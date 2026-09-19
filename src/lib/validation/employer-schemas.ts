import { z } from 'zod';

const opportunityCategories = [
  'internships', 'global_immersion', 'exchange', 'industry_projects',
  'research', 'scholarships', 'graduate_careers',
] as const;

const workModes = ['on_site', 'remote', 'hybrid'] as const;

const durationUnits = ['weeks', 'months', 'years'] as const;

const compensationTypes = ['paid', 'stipend', 'unpaid', 'scholarship'] as const;

const compensationPeriods = ['hourly', 'weekly', 'monthly', 'annual', 'total'] as const;

const opportunityStatuses = ['draft', 'pending_review', 'published', 'closed', 'archived'] as const;

export const createOpportunitySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
  category: z.enum(opportunityCategories),
  description: z.string().min(50, 'Description must be at least 50 characters').max(10000),
  location_country: z.string().min(2).max(100),
  location_city: z.string().max(100).optional(),
  work_mode: z.enum(workModes),
  duration_value: z.number().int().positive().optional(),
  duration_unit: z.enum(durationUnits).optional(),
  compensation_type: z.enum(compensationTypes).optional(),
  compensation_min: z.number().min(0).optional(),
  compensation_max: z.number().min(0).optional(),
  compensation_currency: z.string().length(3).optional(),
  compensation_period: z.enum(compensationPeriods).optional(),
  start_date: z.string().datetime().optional(),
  application_deadline: z.string().datetime().optional(),
  visa_support: z.boolean().default(false),
  industry: z.string().max(100).optional(),
  spots_available: z.number().int().positive().optional(),
  requirements: z.record(z.string(), z.unknown()).optional(),
  benefits: z.array(z.object({ type: z.string(), description: z.string() })).optional(),
  responsibilities: z.array(z.string().max(500)).optional(),
}).refine(
  (data) => {
    if (data.compensation_min !== undefined && data.compensation_max !== undefined) {
      return data.compensation_max >= data.compensation_min;
    }
    return true;
  },
  { message: 'Maximum compensation must be >= minimum', path: ['compensation_max'] }
);

export const updateOpportunitySchema = z.object({
  title: z.string().min(3).max(200).optional(),
  category: z.enum(opportunityCategories).optional(),
  description: z.string().min(50).max(10000).optional(),
  location_country: z.string().min(2).max(100).optional(),
  location_city: z.string().max(100).optional().nullable(),
  work_mode: z.enum(workModes).optional(),
  duration_value: z.number().int().positive().optional().nullable(),
  duration_unit: z.enum(durationUnits).optional().nullable(),
  compensation_type: z.enum(compensationTypes).optional().nullable(),
  compensation_min: z.number().min(0).optional().nullable(),
  compensation_max: z.number().min(0).optional().nullable(),
  compensation_currency: z.string().length(3).optional().nullable(),
  compensation_period: z.enum(compensationPeriods).optional().nullable(),
  start_date: z.string().datetime().optional().nullable(),
  application_deadline: z.string().datetime().optional().nullable(),
  visa_support: z.boolean().optional(),
  industry: z.string().max(100).optional().nullable(),
  spots_available: z.number().int().positive().optional().nullable(),
  requirements: z.record(z.string(), z.unknown()).optional().nullable(),
  benefits: z.array(z.object({ type: z.string(), description: z.string() })).optional().nullable(),
  responsibilities: z.array(z.string().max(500)).optional().nullable(),
});

export const employerOpportunityListQuerySchema = z.object({
  status: z.string().optional(),
  search: z.string().max(100).optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'title', 'application_deadline']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().min(1).max(50).default(20),
});

export const employerApplicationListQuerySchema = z.object({
  status: z.string().optional(),
  opportunity_id: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  sort_by: z.enum(['submitted_at', 'created_at', 'match_score', 'status']).default('submitted_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().min(1).max(50).default(20),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum([
    'under_review', 'shortlisted', 'assessment', 'interview', 'selected', 'rejected',
  ]),
  reviewer_notes: z.string().max(2000).optional(),
}).refine(
  (data) => {
    if (data.status === 'rejected') {
      return data.reviewer_notes && data.reviewer_notes.trim().length >= 20;
    }
    return true;
  },
  { message: 'Rejection notes are required (at least 20 characters)', path: ['reviewer_notes'] }
);

// Inferred types
export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;
export type UpdateOpportunityInput = z.infer<typeof updateOpportunitySchema>;
export type EmployerOpportunityListQuery = z.infer<typeof employerOpportunityListQuerySchema>;
export type EmployerApplicationListQuery = z.infer<typeof employerApplicationListQuerySchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
