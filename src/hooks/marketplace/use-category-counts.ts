'use client';

import { useMemo } from 'react';
import type { CategoryCounts, OpportunityCategory } from '@/types/marketplace';

export function useCategoryCounts(rawCounts: CategoryCounts | undefined): CategoryCounts {
  return useMemo(() => {
    return rawCounts || {
      all: 0,
      internships: 0,
      global_immersion: 0,
      exchange: 0,
      industry_projects: 0,
      research: 0,
      scholarships: 0,
      graduate_careers: 0,
    };
  }, [rawCounts]);
}
