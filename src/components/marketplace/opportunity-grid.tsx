'use client';

import type { OpportunityListItem } from '@/types/marketplace';
import { OpportunityCard } from './opportunity-card';
import { OpportunityCardSkeleton } from './opportunity-card-skeleton';
import { EmptyState } from './empty-state';

interface OpportunityGridProps {
  opportunities: OpportunityListItem[];
  isLoading: boolean;
  isEmpty: boolean;
  searchQuery?: string;
}

export function OpportunityGrid({ opportunities, isLoading, isEmpty, searchQuery }: OpportunityGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <OpportunityCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return <EmptyState searchQuery={searchQuery} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-start">
      {opportunities.map((opp) => (
        <OpportunityCard key={opp.id} opportunity={opp} />
      ))}
    </div>
  );
}
