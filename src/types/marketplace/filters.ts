import type { OpportunityCategory, WorkMode, CompensationType, DurationUnit } from './opportunity';

export type SortOption = 'relevance' | 'match_score' | 'deadline' | 'newest' | 'compensation';
export type SortOrder = 'asc' | 'desc';

export interface MarketplaceFilters {
  q: string;
  category: OpportunityCategory[];
  country: string;
  city: string;
  workMode: WorkMode | '';
  durationMin: number;
  durationMax: number;
  durationUnit: DurationUnit;
  compensationType: CompensationType[];
  compensationMin: number;
  compensationMax: number;
  startDateFrom: string;
  startDateTo: string;
  deadlineWithin: number;
  matchMin: number;
  skills: string[];
  visaSupport: boolean;
  industry: string[];
  sort: SortOption;
  order: SortOrder;
  page: number;
  pageSize: number;
}

export interface FilterChip {
  key: string;
  label: string;
  value: string;
}

export type FilterParam<T> = T | undefined;
