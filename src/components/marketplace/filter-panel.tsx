'use client';

import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOpportunityFilters } from '@/hooks/marketplace/use-opportunity-filters';
import { FilterSection } from './filter-section';
import { FilterCategory } from './filter-category';
import { FilterLocation } from './filter-location';
import { FilterWorkMode } from './filter-work-mode';
import { FilterDuration } from './filter-duration';
import { FilterCompensation } from './filter-compensation';
import { FilterSkills } from './filter-skills';
import { FilterVisa } from './filter-visa';
import { FilterIndustry } from './filter-industry';

interface FilterPanelProps {
  isAuthenticated?: boolean;
  className?: string;
}

export function FilterPanel({ isAuthenticated = false, className }: FilterPanelProps) {
  const { activeCount, clearAll } = useOpportunityFilters();

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-600" />
          <h3 className="font-semibold text-sm text-slate-900">Filters</h3>
          {activeCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500 text-white text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Filter Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        <FilterSection title="Category" defaultOpen>
          <FilterCategory />
        </FilterSection>

        <FilterSection title="Location" defaultOpen>
          <FilterLocation />
        </FilterSection>

        <FilterSection title="Work Mode" defaultOpen>
          <FilterWorkMode />
        </FilterSection>

        <FilterSection title="Duration">
          <FilterDuration />
        </FilterSection>

        <FilterSection title="Compensation">
          <FilterCompensation />
        </FilterSection>

        <FilterSection title="Skills">
          <FilterSkills />
        </FilterSection>

        <FilterSection title="Visa Support">
          <FilterVisa />
        </FilterSection>

        <FilterSection title="Industry">
          <FilterIndustry />
        </FilterSection>
      </div>
    </div>
  );
}

// Mobile trigger button
export function FilterTriggerButton({ onClick, count }: { onClick: () => void; count: number }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors md:hidden"
    >
      <SlidersHorizontal className="w-4 h-4" />
      Filters
      {count > 0 && (
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500 text-white text-[10px] font-bold">
          {count}
        </span>
      )}
    </button>
  );
}
