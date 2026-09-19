import { SAFETY_TOPICS } from '../constants/copilot-prompts';

interface SafetyResult {
  safe: boolean;
  reason?: string;
}

/**
 * Check if a user message touches blocked safety topics.
 */
export function checkSafety(message: string): SafetyResult {
  const lower = message.toLowerCase();

  for (const topic of SAFETY_TOPICS) {
    if (lower.includes(topic)) {
      return {
        safe: false,
        reason: `I'm focused on career and learning guidance. For ${topic}, please consult a qualified professional.`,
      };
    }
  }

  // Check for harmful patterns
  const harmfulPatterns = [
    /ignore\s+(previous|all)\s+instructions/i,
    /system\s+prompt/i,
    /you\s+are\s+now/i,
    /pretend\s+you\s+are/i,
  ];

  for (const pattern of harmfulPatterns) {
    if (pattern.test(message)) {
      return {
        safe: false,
        reason: "I can only help with career and professional development questions. Let me know how I can assist with your career journey!",
      };
    }
  }

  return { safe: true };
}

/**
 * Sanitize AI output to remove leaked system prompts or PII patterns.
 */
export function sanitizeOutput(response: string): string {
  // Remove any potential system prompt leaks
  let cleaned = response.replace(/system\s*prompt[:\s].*/gi, '');
  cleaned = cleaned.replace(/\[SYSTEM\].*?\[\/SYSTEM\]/gs, '');

  // Remove email patterns that look like PII
  cleaned = cleaned.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email]');

  // Remove phone number patterns
  cleaned = cleaned.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[phone]');

  return cleaned.trim();
}
