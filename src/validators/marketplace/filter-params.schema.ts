import { z } from 'zod';

const commaSeparatedArray = z.string().transform((val) =>
  val ? val.split(',').map((s) => s.trim()).filter(Boolean) : []
);

const categoryEnum = z.enum([
  'internships', 'global_immersion', 'exchange', 'industry_projects',
  'research', 'scholarships', 'graduate_careers',
]);

const sortEnum = z.enum(['relevance', 'match_score', 'deadline', 'newest', 'compensation']);
const orderEnum = z.enum(['asc', 'desc']);

export const filterParamsSchema = z.object({
  q: z.string().max(200).optional().default(''),
  category: commaSeparatedArray.pipe(z.array(categoryEnum)).optional().default([]),
  country: z.string().optional().default(''),
  city: z.string().optional().default(''),
  workMode: z.enum(['on_site', 'remote', 'hybrid', '']).optional().default(''),
  durationMin: z.coerce.number().int().positive().optional(),
  durationMax: z.coerce.number().int().positive().optional(),
  durationUnit: z.enum(['weeks', 'months', 'years']).optional().default('months'),
  compensationType: commaSeparatedArray.pipe(
    z.array(z.enum(['paid', 'stipend', 'unpaid', 'scholarship']))
  ).optional().default([]),
  compensationMin: z.coerce.number().min(0).optional(),
  compensationMax: z.coerce.number().min(0).optional(),
  startDateFrom: z.string().optional().default(''),
  startDateTo: z.string().optional().default(''),
  deadlineWithin: z.coerce.number().int().positive().optional(),
  matchMin: z.coerce.number().min(0).max(100).optional(),
  skills: commaSeparatedArray.optional().default([]),
  visaSupport: z.enum(['true', 'false', '']).optional().transform((v) => v === 'true' ? true : v === 'false' ? false : undefined),
  industry: commaSeparatedArray.optional().default([]),
  sort: sortEnum.optional().default('newest'),
  order: orderEnum.optional().default('desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type FilterParamsInput = z.input<typeof filterParamsSchema>;
export type FilterParamsOutput = z.output<typeof filterParamsSchema>;

export function parseFilterParams(searchParams: URLSearchParams): FilterParamsOutput {
  const raw: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    raw[key] = value;
  });
  const result = filterParamsSchema.safeParse(raw);
  if (result.success) return result.data;
  return {
    q: '',
    category: [],
    country: '',
    city: '',
    workMode: '',
    durationUnit: 'months',
    compensationType: [],
    startDateFrom: '',
    startDateTo: '',
    skills: [],
    visaSupport: undefined,
    industry: [],
    sort: 'newest',
    order: 'desc',
    page: 1,
    pageSize: 20,
  } as FilterParamsOutput;
}
