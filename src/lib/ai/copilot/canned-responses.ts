import { CANNED_RESPONSES, SUGGESTED_PROMPTS } from '../constants/copilot-prompts';
import type { PageContext } from '../types';

/**
 * Get an appropriate canned response when circuit breaker is open.
 */
export function getCannedResponse(pageContext: PageContext, messageContent: string): string {
  const lower = messageContent.toLowerCase();

  // Try to match against keywords for specific FAQ responses
  if (lower.includes('gx score') || lower.includes('score')) {
    return CANNED_RESPONSES.what_is_gx_score;
  }
  if (lower.includes('improve') || lower.includes('better') || lower.includes('increase')) {
    return CANNED_RESPONSES.how_to_improve;
  }
  if (lower.includes('match') || lower.includes('fit')) {
    return CANNED_RESPONSES.what_is_matching;
  }
  if (lower.includes('application') || lower.includes('apply') || lower.includes('cover letter')) {
    return CANNED_RESPONSES.application_tips;
  }
  if (lower.includes('interview') || lower.includes('prepare')) {
    return CANNED_RESPONSES.interview_prep;
  }

  // Generic fallback
  return CANNED_RESPONSES.error_fallback;
}
