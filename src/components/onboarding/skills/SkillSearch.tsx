'use client';

import { Search } from 'lucide-react';
import { useSkillSearch } from '@/hooks/onboarding/useSkillSearch';
import { SkillResults } from './SkillResults';
import { SkillCategoryFilter } from './SkillCategoryFilter';

interface SkillSearchProps {
  onSelectSkill: (skill: { id: string; name: string; category: string }) => void;
  excludeIds: string[];
}

export function SkillSearch({ onSelectSkill, excludeIds }: SkillSearchProps) {
  const { query, setQuery, category, setCategory, results, isSearching, clearSearch } = useSkillSearch();

  const filteredResults = results.filter((s: { id: string }) => !excludeIds.includes(s.id));

  const handleSelect = (skill: { id: string; name: string; category: string }) => {
    onSelectSkill(skill);
    clearSearch();
  };

  return (
    <div className="space-y-3">
      <SkillCategoryFilter activeCategory={category} onSelect={setCategory} />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
          placeholder="Search skills (e.g., Python, Project Management...)"
        />
        {query.length >= 2 && (
          <SkillResults
            results={filteredResults}
            isLoading={isSearching}
            onSelect={handleSelect}
            query={query}
          />
        )}
      </div>
    </div>
  );
}
