import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateExplanation } from '@/lib/ai/matching/explanation-generator';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'AUTH_001', message: 'Authentication required' } }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id') || user.id;
    const opportunityId = searchParams.get('opportunity_id');

    if (!opportunityId) {
      return NextResponse.json({ success: false, error: { code: 'VAL_001', message: 'opportunity_id is required' } }, { status: 400 });
    }

    // Check for cached explanation
    const { data: cached } = await supabase
      .from('match_scores')
      .select('explanation_text, explanation_generated_at, composite_score, dimension_scores, skill_gaps')
      .eq('student_id', studentId)
      .eq('opportunity_id', opportunityId)
      .single();

    if (cached?.explanation_text && cached.explanation_generated_at) {
      const generatedAt = new Date(cached.explanation_generated_at).getTime();
      const oneHourAgo = Date.now() - 3600000;
      if (generatedAt > oneHourAgo) {
        return NextResponse.json({
          success: true,
          data: { explanation: cached.explanation_text, from_cache: true },
        });
      }
    }

    if (!cached) {
      return NextResponse.json({ success: false, error: { code: 'RES_001', message: 'No match score found. Calculate score first.' } }, { status: 404 });
    }

    // Fetch profile and opportunity for explanation
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('first_name, last_name')
      .eq('user_id', studentId)
      .single();

    const { data: opportunity } = await supabase
      .from('opportunities')
      .select('title')
      .eq('id', opportunityId)
      .single();

    // Generate explanation
    const result = await generateExplanation(
      {
        composite_score: cached.composite_score,
        dimensions: cached.dimension_scores as Record<string, unknown> as import('@/lib/ai/types').MatchDimensions,
        skill_gaps: (cached.skill_gaps || []) as import('@/lib/ai/types').SkillGap[],
      },
      { name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() },
      { title: opportunity?.title }
    );

    // Cache the explanation
    await supabase
      .from('match_scores')
      .update({
        explanation_text: result.explanation,
        explanation_generated_at: new Date().toISOString(),
      })
      .eq('student_id', studentId)
      .eq('opportunity_id', opportunityId);

    return NextResponse.json({
      success: true,
      data: {
        explanation: result.explanation,
        improvement_suggestions: result.improvement_suggestions,
        from_cache: false,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SYS_001', message: 'Failed to generate explanation' } }, { status: 500 });
  }
}
