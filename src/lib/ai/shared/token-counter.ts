/**
 * Lightweight token estimation without tiktoken dependency.
 * Heuristic: words × 1.3 (accounts for subword tokenization)
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  const words = text.split(/\s+/).filter(Boolean);
  return Math.ceil(words.length * 1.3);
}

/**
 * Truncate text to fit approximately within a token budget.
 */
export function truncateToTokenLimit(text: string, maxTokens: number): string {
  if (!text) return '';
  const estimated = estimateTokens(text);
  if (estimated <= maxTokens) return text;

  // Approximate character limit from token limit
  const avgCharsPerToken = text.length / estimated;
  const charLimit = Math.floor(maxTokens * avgCharsPerToken);

  // Truncate at word boundary
  const truncated = text.slice(0, charLimit);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...';
}
