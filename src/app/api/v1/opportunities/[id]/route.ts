import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID();

  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // Fetch opportunity
    const { data: opportunity, error } = await supabase
      .from('opportunities')
      .select(`
        *,
        organizations(id, name, logo_url, industry, size, location_country, location_city, website, description),
        opportunity_skills(id, importance, min_proficiency, skill_id, skills_master(id, name))
      `)
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (error || !opportunity) {
      return NextResponse.json(
        { success: false, error: { code: 'RES_001', message: 'Opportunity not found' }, meta: { request_id: requestId } },
        { status: 404 }
      );
    }

    // Check saved and applied status for authenticated user
    let isSaved = false;
    let hasApplied = false;

    if (userId) {
      const [savedResult, appliedResult] = await Promise.all([
        supabase
          .from('saved_opportunities')
          .select('id')
          .eq('student_id', userId)
          .eq('opportunity_id', id)
          .maybeSingle(),
        supabase
          .from('applications')
          .select('id')
          .eq('student_id', userId)
          .eq('opportunity_id', id)
          .maybeSingle(),
      ]);
      isSaved = !!savedResult.data;
      hasApplied = !!appliedResult.data;
    }

    // Get related opportunities
    const { data: related } = await supabase
      .from('opportunities')
      .select(`
        id, title, slug, category, location_country, work_mode,
        compensation_type, application_deadline,
        organizations(id, name, logo_url)
      `)
      .eq('status', 'published')
      .eq('category', opportunity.category)
      .neq('id', id)
      .limit(3);

    // Increment view count (fire and forget)
    supabase
      .from('opportunities')
      .update({ view_count: (opportunity.view_count || 0) + 1 })
      .eq('id', id)
      .then(() => {});

    // Transform
    const transformed = {
      id: opportunity.id,
      title: opportunity.title,
      slug: opportunity.slug,
      category: opportunity.category,
      organization: opportunity.organizations,
      location_country: opportunity.location_country,
      location_city: opportunity.location_city,
      work_mode: opportunity.work_mode,
      duration_value: opportunity.duration_value,
      duration_unit: opportunity.duration_unit,
      compensation_type: opportunity.compensation_type,
      compensation_min: opportunity.compensation_min,
      compensation_max: opportunity.compensation_max,
      compensation_currency: opportunity.compensation_currency,
      compensation_period: opportunity.compensation_period,
      start_date: opportunity.start_date,
      end_date: opportunity.end_date,
      application_deadline: opportunity.application_deadline,
      visa_support: opportunity.visa_support,
      industry: opportunity.industry,
      description: opportunity.description,
      description_plain: opportunity.description_plain,
      requirements: opportunity.requirements || {},
      benefits: opportunity.benefits || [],
      responsibilities: opportunity.responsibilities || [],
      application_fields: opportunity.application_fields || [],
      skills: (opportunity.opportunity_skills || []).map((os: any) => ({
        id: os.skills_master?.id || os.skill_id,
        name: os.skills_master?.name || 'Unknown',
        importance: os.importance,
        min_proficiency: os.min_proficiency,
      })),
      match_score: null,
      match_analysis: null,
      eligibility: null,
      is_saved: isSaved,
      has_applied: hasApplied,
      spots_available: opportunity.spots_available,
      spots_filled: opportunity.spots_filled,
      featured: opportunity.featured,
      published_at: opportunity.published_at,
      view_count: opportunity.view_count,
      related_opportunities: (related || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        category: r.category,
        organization: r.organizations,
        location_country: r.location_country,
        work_mode: r.work_mode,
        compensation_type: r.compensation_type,
        application_deadline: r.application_deadline,
        match_score: null,
      })),
    };

    return NextResponse.json({
      success: true,
      data: transformed,
      meta: { request_id: requestId },
    });
  } catch (err) {
    console.error('Opportunity detail error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'Internal server error' }, meta: { request_id: requestId } },
      { status: 500 }
    );
  }
}
