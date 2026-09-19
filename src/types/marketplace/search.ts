export interface SearchResult {
  id: string;
  title: string;
  highlighted_title?: string;
  highlighted_description?: string;
  rank: number;
}

export interface SearchSuggestion {
  query: string;
  timestamp: number;
}

export type SearchState = 'idle' | 'typing' | 'searching' | 'results' | 'no_results' | 'error';
