const TSQUERY_SPECIAL_CHARS = /[&|!:*()\\<>]/g;
const SEARCH_STORAGE_KEY = 'gx-recent-searches';
const MAX_RECENT = 5;
const MAX_QUERY_LENGTH = 200;

export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(TSQUERY_SPECIAL_CHARS, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_QUERY_LENGTH);
}

export function highlightSearchTerms(text: string, query: string): string {
  if (!query || !text) return text;
  const sanitized = sanitizeSearchQuery(query);
  const words = sanitized.split(/\s+/).filter((w) => w.length >= 2);
  if (words.length === 0) return text;

  const pattern = new RegExp(`(${words.map(escapeRegex).join('|')})`, 'gi');
  return text.replace(pattern, '<mark class="bg-yellow-100 rounded px-0.5">$1</mark>');
}

export function buildTsQuery(query: string): string {
  const sanitized = sanitizeSearchQuery(query);
  const words = sanitized.split(/\s+/).filter((w) => w.length >= 2);
  if (words.length === 0) return '';
  return words.map((w) => `${w}:*`).join(' & ');
}

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(SEARCH_STORAGE_KEY);
    return stored ? JSON.parse(stored).slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(query: string): void {
  if (typeof window === 'undefined' || !query.trim()) return;
  try {
    const existing = getRecentSearches();
    const filtered = existing.filter((s) => s.toLowerCase() !== query.toLowerCase());
    const updated = [query.trim(), ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Silently fail
  }
}

export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SEARCH_STORAGE_KEY);
  } catch {
    // Silently fail
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
