import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'AUTH_001', message: 'Authentication required' } }, { status: 401 });
    }

    const role = user.user_metadata?.role;
    if (role !== 'admin' && role !== 'employer') {
      return NextResponse.json({ success: false, error: { code: 'AUTH_003', message: 'Insufficient permissions' } }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const opportunityId = searchParams.get('opportunity_id');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = Math.min(parseInt(searchParams.get('per_page') || '20'), 100);
    const minScore = parseInt(searchParams.get('min_score') || '0');

    if (!opportunityId) {
      return NextResponse.json({ success: false, error: { code: 'VAL_001', message: 'opportunity_id is required' } }, { status: 400 });
    }

    const offset = (page - 1) * perPage;

    // Get total count
    const { count } = await supabase
      .from('match_scores')
      .select('*', { count: 'exact', head: true })
      .eq('opportunity_id', opportunityId)
      .gte('composite_score', minScore);

    // Get paginated candidates
    const { data: scores, error } = await supabase
      .from('match_scores')
      .select('student_id, composite_score, dimension_scores, skill_gaps, calculated_at')
      .eq('opportunity_id', opportunityId)
      .gte('composite_score', minScore)
      .order('composite_score', { ascending: false })
      .range(offset, offset + perPage - 1);

    if (error) {
      return NextResponse.json({ success: false, error: { code: 'SYS_001', message: 'Failed to fetch candidates' } }, { status: 500 });
    }

    // Enrich with student profile data
    const studentIds = (scores || []).map(s => s.student_id);
    const { data: profiles } = await supabase
      .from('student_profiles')
      .select('user_id, first_name, last_name, profile_photo_url')
      .in('user_id', studentIds);

    const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

    const candidates = (scores || []).map(score => {
      const profile = profileMap.get(score.student_id);
      return {
        student_id: score.student_id,
        student_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown',
        avatar_url: profile?.profile_photo_url || null,
        composite_score: score.composite_score,
        dimensions: score.dimension_scores,
        skill_gaps_count: Array.isArray(score.skill_gaps) ? score.skill_gaps.length : 0,
        calculated_at: score.calculated_at,
      };
    });

    return NextResponse.json({
      success: true,
      data: candidates,
      pagination: {
        page,
        per_page: perPage,
        total_items: count || 0,
        total_pages: Math.ceil((count || 0) / perPage),
        has_next: offset + perPage < (count || 0),
        has_prev: page > 1,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SYS_001', message: 'Internal server error' } }, { status: 500 });
  }
}
