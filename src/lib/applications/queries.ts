import type { ApplicationStatus } from './types';

type SupabaseClient = {
  from: (table: string) => unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

interface ListFilters {
  status?: string;
  search?: string;
  sort_by: string;
  sort_order: 'asc' | 'desc';
  page: number;
  per_page: number;
}

export function buildApplicationListQuery(
  supabase: SupabaseClient,
  userId: string,
  filters: ListFilters
) {
  let query = supabase
    .from('applications')
    .select(`
      id, status, submitted_at, created_at, updated_at, cover_letter,
      opportunities!inner (
        id, title, deadline, category, location_country, location_city,
        organizations (id, name, logo_url)
      )
    `, { count: 'exact' })
    .eq('student_id', userId);

  if (filters.status) {
    const statuses = filters.status.split(',').map((s) => s.trim()).filter(Boolean);
    const validDbStatuses = ['submitted', 'under_review', 'shortlisted', 'interview', 'offered', 'accepted', 'rejected', 'withdrawn'];
    const validStatuses = statuses.filter(s => validDbStatuses.includes(s));
    
    if (validStatuses.length > 0) {
      query = query.in('status', validStatuses);
    } else if (statuses.length > 0) {
      // They ONLY requested invalid statuses. Return empty.
      // We can't return empty array directly from this query builder, so we force a false condition
      query = query.eq('id', '00000000-0000-0000-0000-000000000000');
    }
  }

  if (filters.search) {
    query = query.or(`opportunities.title.ilike.%${filters.search}%`);
  }

  query = query.order(filters.sort_by, { ascending: filters.sort_order === 'asc', nullsFirst: false });

  const from = (filters.page - 1) * filters.per_page;
  const to = from + filters.per_page - 1;
  query = query.range(from, to);

  return query;
}

export function buildApplicationDetailQuery(
  supabase: SupabaseClient,
  applicationId: string
) {
  return supabase
    .from('applications')
    .select(`
      *,
      opportunities (
        id, title, description, category,
        location_country, location_city, work_mode,
        duration_months, compensation_type, deadline,
        organizations (id, name, logo_url, website)
      ),
      application_status_history (*)
    `)
    .eq('id', applicationId)
    .single();
}

export async function getApplicationWithVersion(
  supabase: SupabaseClient,
  id: string,
  version: number
): Promise<{ data: { id: string; status: ApplicationStatus; version: number } | null; error: string | null }> {
  const { data, error } = await supabase
    .from('applications')
    .select('id, status, version, student_id, organization_id')
    .eq('id', id)
    .single();

  if (error || !data) {
    return { data: null, error: 'Application not found' };
  }

  if (data.version !== version) {
    return { data: null, error: 'Version mismatch - application was modified' };
  }

  return { data, error: null };
}
