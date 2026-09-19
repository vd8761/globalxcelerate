import type { SupabaseClient } from '@supabase/supabase-js';
import type { PageContext } from '../types';
import { estimateTokens, truncateToTokenLimit } from '../shared/token-counter';
import { GX_SCORE_CONFIG } from '@/lib/config/scoring';

/**
 * Build context string for the AI copilot, implementing 4-layer strategy.
 */
export async function buildContext(
  studentId: string,
  sessionId: string,
  pageContext: PageContext,
  supabase: SupabaseClient
): Promise<string> {
  const TOKEN_BUDGET = GX_SCORE_CONFIG.copilot_token_budget.input;
  const layers: string[] = [];
  let tokensUsed = 0;

  // Layer 1: Core profile summary (~500 tokens, always included)
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('first_name, last_name, gx_score, current_country, field_of_study, profile_completion')
    .eq('user_id', studentId)
    .single();

  const { data: skills } = await supabase
    .from('student_skills')
    .select('skill_name, proficiency_level')
    .eq('student_id', studentId)
    .order('proficiency_level', { ascending: false })
    .limit(5);

  let layer1 = `Student: ${profile?.first_name || 'User'} ${profile?.last_name || ''}\n`;
  layer1 += `GX Score: ${profile?.gx_score || 'Not calculated'}\n`;
  layer1 += `Location: ${profile?.current_country || 'Unknown'}\n`;
  layer1 += `Field: ${profile?.field_of_study || 'Not specified'}\n`;
  layer1 += `Profile Completion: ${profile?.profile_completion || 0}%\n`;
  if (skills?.length) {
    layer1 += `Top Skills: ${skills.map(s => `${s.skill_name} (L${s.proficiency_level})`).join(', ')}\n`;
  }

  layers.push(layer1);
  tokensUsed += estimateTokens(layer1);

  // Layer 2: Conversation history (~1000 tokens)
  if (sessionId) {
    const { data: messages } = await supabase
      .from('copilot_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (messages?.length) {
      const historyStr = messages
        .reverse()
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');

      const historyTruncated = truncateToTokenLimit(historyStr, 1000);
      layers.push(`\nConversation History:\n${historyTruncated}`);
      tokensUsed += estimateTokens(historyTruncated);
    }
  }

  // Layer 3: Page-specific context (~500 tokens)
  if (pageContext.page_type === 'opportunity_detail' && pageContext.entity_id) {
    const { data: opp } = await supabase
      .from('opportunities')
      .select('title, category, description, location_country, requirements')
      .eq('id', pageContext.entity_id)
      .single();

    if (opp) {
      const oppContext = `\nCurrent Opportunity: ${opp.title}\nCategory: ${opp.category}\nLocation: ${opp.location_country}\nDescription: ${(opp.description || '').slice(0, 300)}`;
      layers.push(truncateToTokenLimit(oppContext, 500));
      tokensUsed += estimateTokens(oppContext);
    }
  } else if (pageContext.page_type === 'gx_score') {
    const { data: gxScore } = await supabase
      .from('gx_scores')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (gxScore) {
      const scoreContext = `\nGX Score: ${gxScore.composite_score} (${gxScore.grade_bracket})\nStrongest: academic_readiness=${gxScore.academic_readiness}, technical_skills=${gxScore.technical_skills}\nWeakest areas show room for growth.`;
      layers.push(truncateToTokenLimit(scoreContext, 500));
      tokensUsed += estimateTokens(scoreContext);
    }
  }

  // Layer 4: Extended profile (remaining budget)
  const remainingBudget = TOKEN_BUDGET - tokensUsed;
  if (remainingBudget > 100) {
    const { data: experiences } = await supabase
      .from('student_experiences')
      .select('title, type, description')
      .eq('student_id', studentId)
      .limit(3);

    if (experiences?.length) {
      const expStr = `\nRecent Experiences: ${experiences.map(e => `${e.title} (${e.type})`).join(', ')}`;
      layers.push(truncateToTokenLimit(expStr, remainingBudget));
    }
  }

  return layers.join('\n');
}
