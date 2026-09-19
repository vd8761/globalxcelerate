'use client';

import { useOpportunityFilters } from '@/hooks/marketplace/use-opportunity-filters';
import { CATEGORIES } from '@/lib/marketplace/constants';
import { cn } from '@/lib/utils';
import type { OpportunityCategory } from '@/types/marketplace';

export function FilterCategory() {
  const { filters, setFilter } = useOpportunityFilters();
  const selectedCategories = filters.category || [];

  const toggleCategory = (category: OpportunityCategory) => {
    const current = [...selectedCategories];
    const index = current.indexOf(category);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(category);
    }
    setFilter('category', current);
  };

  return (
    <div className="space-y-2">
      {CATEGORIES.filter((c) => c.value !== 'all').map((cat) => {
        const isChecked = selectedCategories.includes(cat.value as OpportunityCategory);
        return (
          <label
            key={cat.value}
            className="flex items-center gap-3 py-1 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => toggleCategory(cat.value as OpportunityCategory)}
              className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
            />
            <span className={cn(
              'w-2.5 h-2.5 rounded-full',
              cat.color.split(' ')[0]
            )} />
            <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
              {cat.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
