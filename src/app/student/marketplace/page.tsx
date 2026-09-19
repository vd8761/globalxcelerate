'use client';

import { Suspense, useState } from 'react';
import { useOpportunitiesQuery } from '@/hooks/marketplace/use-opportunities-query';
import { useOpportunityFilters } from '@/hooks/marketplace/use-opportunity-filters';
import { SearchBar } from '@/components/marketplace/search-bar';
import { CategoryTabs } from '@/components/marketplace/category-tabs';
import { FilterPanel, FilterTriggerButton } from '@/components/marketplace/filter-panel';
import { ActiveFilterChips } from '@/components/marketplace/active-filter-chips';
import { OpportunityGrid } from '@/components/marketplace/opportunity-grid';
import { SortDropdown } from '@/components/marketplace/sort-dropdown';
import { ResultsCount } from '@/components/marketplace/results-count';
import { PaginationControls } from '@/components/marketplace/pagination-controls';
import { PageSizeSelector } from '@/components/marketplace/page-size-selector';
import { X } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function MarketplacePage() {
  const { data, isLoading, error } = useOpportunitiesQuery();
  const { filters, setPage, activeCount } = useOpportunityFilters();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const opportunities = data?.data?.opportunities || [];
  const pagination = data?.data?.pagination;
  const categoryCounts = data?.data?.category_counts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Opportunity Marketplace</h1>
        <p className="text-sm text-slate-500">Discover and apply to global opportunities that match your profile</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar />
      </div>

      {/* Category Tabs */}
      <div className="mb-6">
        <CategoryTabs categoryCounts={categoryCounts} />
      </div>

      {/* Active Filters */}
      <ActiveFilterChips />

      {/* Main layout */}
      <div className="flex gap-6">
        {/* Desktop filter sidebar */}
        <aside className="hidden lg:block w-[280px] flex-shrink-0">
          <div className="sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto bg-white border border-slate-200 rounded-2xl">
            <FilterPanel />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Sort + Results bar */}
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-3">
              <FilterTriggerButton onClick={() => setMobileFilterOpen(true)} count={activeCount} />
              {pagination && (
                <ResultsCount
                  page={pagination.page}
                  pageSize={pagination.per_page}
                  totalItems={pagination.total_items}
                />
              )}
            </div>
            <div className="flex items-center gap-3">
              <SortDropdown hasSearch={!!filters.q} />
              <div className="hidden sm:block">
                <PageSizeSelector />
              </div>
            </div>
          </div>

          {/* Grid */}
          <OpportunityGrid
            opportunities={opportunities}
            isLoading={isLoading}
            isEmpty={!isLoading && opportunities.length === 0}
            searchQuery={filters.q}
          />

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <PaginationControls
              currentPage={pagination.page}
              totalPages={pagination.total_pages}
              onPageChange={(page) => {
                setPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilterOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-white shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-sm">Filters</span>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 rounded hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto h-full pb-20">
              <FilterPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
