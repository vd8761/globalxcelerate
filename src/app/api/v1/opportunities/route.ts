import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { parseFilterParams } from '@/validators/marketplace/filter-params.schema';
import type { OpportunityCategory, CategoryCounts } from '@/types/marketplace';

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const { searchParams } = new URL(request.url);
    const filters = parseFilterParams(searchParams);

    const supabase = await createServerSupabaseClient();

    // Check authentication for personalized features
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // Build the main query
    let query = supabase
      .from('opportunities')
      .select(`
        id, title, slug, category, location_country, location_city,
        work_mode, duration_value, duration_unit,
        compensation_type, compensation_min, compensation_max,
        compensation_currency, compensation_period,
        start_date, application_deadline, visa_support, industry,
        spots_available, spots_filled, featured, published_at,
        organizations(id, name, logo_url, industry, size, location_country, location_city),
        opportunity_skills(id, importance, min_proficiency, skill_id, skills_master(id, name))
      `, { count: 'exact' })
      .eq('status', 'published');

    // Full-text search
    if (filters.q) {
      const sanitized = filters.q.replace(/[&|!:*()\\<>]/g, ' ').trim();
      if (sanitized.length >= 2) {
        const tsQuery = sanitized.split(/\s+/).filter(w => w.length >= 2).map(w => `${w}:*`).join(' & ');
        if (tsQuery) {
          query = query.textSearch('search_vector', tsQuery);
        }
      }
    }

    // Category filter
    if (filters.category && filters.category.length > 0) {
      query = query.in('category', filters.category);
    }

    // Location filters
    if (filters.country) query = query.eq('location_country', filters.country);
    if (filters.city) query = query.eq('location_city', filters.city);

    // Work mode
    if (filters.workMode) query = query.eq('work_mode', filters.workMode);

    // Compensation type
    if (filters.compensationType && filters.compensationType.length > 0) {
      query = query.in('compensation_type', filters.compensationType);
    }

    // Compensation range
    if (filters.compensationMin !== undefined) query = query.gte('compensation_max', filters.compensationMin);
    if (filters.compensationMax !== undefined) query = query.lte('compensation_min', filters.compensationMax);

    // Visa support
    if (filters.visaSupport) query = query.eq('visa_support', true);

    // Industry
    if (filters.industry && filters.industry.length > 0) {
      query = query.in('industry', filters.industry);
    }

    // Start date range
    if (filters.startDateFrom) query = query.gte('start_date', filters.startDateFrom);
    if (filters.startDateTo) query = query.lte('start_date', filters.startDateTo);

    // Deadline within N days
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
      case 'compensation':
        query = query.order('compensation_max', { ascending: false, nullsFirst: false });
        break;
      case 'newest':
        query = query.order('published_at', { ascending: false });
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

    // Execute main query
    const { data: opportunities, error, count } = await query;

    if (error) {
      console.error('Opportunities query error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'SYS_001', message: 'Failed to fetch opportunities' }, meta: { request_id: requestId } },
        { status: 500 }
      );
    }

    // Get category counts
    const { data: countData } = await supabase
      .from('opportunities')
      .select('category')
      .eq('status', 'published');

    const categoryCounts: CategoryCounts = {
      all: countData?.length || 0,
      internships: 0,
      global_immersion: 0,
      exchange: 0,
      industry_projects: 0,
      research: 0,
      scholarships: 0,
      graduate_careers: 0,
    };

    countData?.forEach((row: { category: string }) => {
      const cat = row.category as OpportunityCategory;
      if (cat in categoryCounts) categoryCounts[cat]++;
    });

    // Get saved status for authenticated users
    let savedIds = new Set<string>();
    if (userId) {
      const { data: savedData } = await supabase
        .from('saved_opportunities')
        .select('opportunity_id')
        .eq('student_id', userId);
      savedData?.forEach((s: { opportunity_id: string }) => savedIds.add(s.opportunity_id));
    }

    // Get match scores for authenticated users
    let matchScoreMap = new Map<string, number>();
    if (userId && opportunities?.length) {
      const oppIds = opportunities.map((o: { id: string }) => o.id);
      const { data: matchData } = await supabase
        .from('match_scores')
        .select('opportunity_id, total_score')
        .eq('student_id', userId)
        .in('opportunity_id', oppIds);
      matchData?.forEach((m: { opportunity_id: string; total_score: number }) => {
        matchScoreMap.set(m.opportunity_id, m.total_score);
      });
    }

    // Transform response
    const transformed = (opportunities || []).map((opp: any) => ({
      id: opp.id,
      title: opp.title,
      slug: opp.slug,
      category: opp.category,
      organization: opp.organizations,
      location_country: opp.location_country,
      location_city: opp.location_city,
      work_mode: opp.work_mode,
      duration_value: opp.duration_value,
      duration_unit: opp.duration_unit,
      compensation_type: opp.compensation_type,
      compensation_min: opp.compensation_min,
      compensation_max: opp.compensation_max,
      compensation_currency: opp.compensation_currency,
      compensation_period: opp.compensation_period,
      start_date: opp.start_date,
      application_deadline: opp.application_deadline,
      visa_support: opp.visa_support,
      industry: opp.industry,
      skills: (opp.opportunity_skills || []).slice(0, 5).map((os: any) => ({
        id: os.skills_master?.id || os.skill_id,
        name: os.skills_master?.name || 'Unknown',
        importance: os.importance,
        min_proficiency: os.min_proficiency,
      })),
      match_score: matchScoreMap.get(opp.id) ?? null,
      is_saved: savedIds.has(opp.id),
      spots_available: opp.spots_available,
      spots_filled: opp.spots_filled,
      featured: opp.featured,
      published_at: opp.published_at,
    }));

    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    return NextResponse.json({
      success: true,
      data: {
        opportunities: transformed,
        category_counts: categoryCounts,
        pagination: {
          page,
          per_page: pageSize,
          total_items: totalItems,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
      },
      meta: { request_id: requestId },
    });
  } catch (err) {
    console.error('Opportunities API error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'Internal server error' }, meta: { request_id: requestId } },
      { status: 500 }
    );
  }
}
