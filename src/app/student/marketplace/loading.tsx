import { OpportunityCardSkeleton } from '@/components/marketplace/opportunity-card-skeleton';

export default function MarketplaceLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-8 bg-slate-200 rounded-lg w-64 mb-2 animate-pulse" />
        <div className="h-4 bg-slate-100 rounded w-96 animate-pulse" />
      </div>

      {/* Search skeleton */}
      <div className="mb-6">
        <div className="h-12 bg-slate-100 rounded-xl max-w-2xl mx-auto animate-pulse" />
      </div>

      {/* Tabs skeleton */}
      <div className="mb-6">
        <div className="h-12 bg-slate-800 rounded-xl animate-pulse" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <OpportunityCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
