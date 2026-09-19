import { z } from 'zod';

export const documentSchema = z.object({
  name: z.string().min(1).max(255),
  storage_path: z.string().min(1),
  type: z.enum(['resume', 'transcript', 'cover_letter_pdf', 'portfolio', 'other']),
  size_bytes: z.number().int().positive().max(10 * 1024 * 1024),
});

export const applicationSchema = z.object({
  cover_letter: z.string().max(5000).optional().default(''),
  documents: z.array(documentSchema).max(10).default([]),
  additional_answers: z.record(z.string(), z.string().max(2000)).optional().default({}),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export function validateApplication(data: unknown) {
  return applicationSchema.safeParse(data);
}
