'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useOpportunityFilters } from '@/hooks/marketplace/use-opportunity-filters';
import { useCategoryCounts } from '@/hooks/marketplace/use-category-counts';
import { CATEGORIES } from '@/lib/marketplace/constants';
import type { CategoryCounts, OpportunityCategory } from '@/types/marketplace';
import {
  LayoutGrid, Briefcase, Globe, ArrowLeftRight,
  Building2, FlaskConical, GraduationCap, Rocket
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutGrid, Briefcase, Globe, ArrowLeftRight,
  Building2, FlaskConical, GraduationCap, Rocket,
};

interface CategoryTabsProps {
  categoryCounts?: CategoryCounts;
}

export function CategoryTabs({ categoryCounts }: CategoryTabsProps) {
  const { filters, setFilter } = useOpportunityFilters();
  const counts = useCategoryCounts(categoryCounts);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeCategory = filters.category?.length === 1 ? filters.category[0] : 'all';

  const handleTabClick = (value: string) => {
    if (value === 'all') {
      setFilter('category', []);
    } else {
      setFilter('category', [value]);
    }
  };

  return (
    <div className="w-full">
      <div
        ref={scrollRef}
        className="flex items-center gap-1 bg-slate-800 rounded-xl px-3 py-2 overflow-x-auto scrollbar-hide"
        role="tablist"
        aria-label="Opportunity categories"
      >
        {CATEGORIES.map((cat) => {
          const IconComponent = ICON_MAP[cat.icon];
          const isActive = activeCategory === cat.value;
          const count = counts[cat.value as keyof CategoryCounts] || 0;

          return (
            <button
              key={cat.value}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabClick(cat.value)}
              className={cn(
                'relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200',
                isActive
                  ? 'text-white bg-slate-700/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
              )}
            >
              {IconComponent && <IconComponent className="w-4 h-4 flex-shrink-0" />}
              <span className="hidden sm:inline">{cat.label}</span>
              {count > 0 && (
                <span className={cn(
                  'ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold min-w-[20px] text-center',
                  isActive ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-300'
                )}>
                  {count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-3 right-3 h-[3px] bg-cyan-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
