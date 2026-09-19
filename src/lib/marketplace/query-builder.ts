import type { SupabaseClient } from '@supabase/supabase-js';
import type { FilterParamsOutput } from '@/validators/marketplace/filter-params.schema';
import { buildTsQuery, sanitizeSearchQuery } from './search-utils';

export function buildOpportunityQuery(
  supabase: SupabaseClient,
  filters: FilterParamsOutput,
  userId?: string
) {
  let query = supabase
    .from('opportunities')
    .select(`
      id, title, slug, category, location_country, location_city,
      work_mode, duration_value, duration_unit,
      compensation_type, compensation_min, compensation_max,
      compensation_currency, compensation_period,
      start_date, application_deadline, visa_support, industry,
      spots_available, spots_filled, featured, published_at, view_count,
      organizations!inner(id, name, logo_url, industry, size, location_country, location_city),
      opportunity_skills(id, importance, min_proficiency, skills_master(id, name))
    `, { count: 'exact' })
    .eq('status', 'published');

  // Full-text search
  if (filters.q) {
    const tsQuery = buildTsQuery(sanitizeSearchQuery(filters.q));
    if (tsQuery) {
      query = query.textSearch('search_vector', tsQuery, { type: 'websearch' });
    }
  }

  // Category filter
  if (filters.category && filters.category.length > 0) {
    query = query.in('category', filters.category);
  }

  // Location filters
  if (filters.country) {
    query = query.eq('location_country', filters.country);
  }
  if (filters.city) {
    query = query.eq('location_city', filters.city);
  }

  // Work mode
  if (filters.workMode) {
    query = query.eq('work_mode', filters.workMode);
  }

  // Compensation type
  if (filters.compensationType && filters.compensationType.length > 0) {
    query = query.in('compensation_type', filters.compensationType);
  }

  // Compensation range
  if (filters.compensationMin !== undefined) {
    query = query.gte('compensation_max', filters.compensationMin);
  }
  if (filters.compensationMax !== undefined) {
    query = query.lte('compensation_min', filters.compensationMax);
  }

  // Visa support
  if (filters.visaSupport) {
    query = query.eq('visa_support', true);
  }

  // Industry
  if (filters.industry && filters.industry.length > 0) {
    query = query.in('industry', filters.industry);
  }

  // Start date
  if (filters.startDateFrom) {
    query = query.gte('start_date', filters.startDateFrom);
  }
  if (filters.startDateTo) {
    query = query.lte('start_date', filters.startDateTo);
  }

  // Deadline
  if (filters.deadlineWithin) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + filters.deadlineWithin);
    query = query.gte('application_deadline', new Date().toISOString());
    query = query.lte('application_deadline', futureDate.toISOString());
  }

  // Sort
  switch (filters.sort) {
    case 'deadline':
      query = query.order('application_deadline', { ascending: true, nullsFirst: false });
      break;
    case 'newest':
      query = query.order('published_at', { ascending: filters.order === 'asc' });
      break;
    case 'compensation':
      query = query.order('compensation_max', { ascending: false, nullsFirst: false });
      break;
    default:
      query = query.order('featured', { ascending: false }).order('published_at', { ascending: false });
  }

  // Pagination
  const pageSize = filters.pageSize || 20;
  const page = filters.page || 1;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  return query;
}

export function buildCategoryCountQuery(
  supabase: SupabaseClient,
  filters: Omit<FilterParamsOutput, 'category' | 'page' | 'pageSize' | 'sort' | 'order'>
) {
  // Simple count per category - using RPC or separate queries
  return supabase
    .from('opportunities')
    .select('category', { count: 'exact', head: false })
    .eq('status', 'published');
}
