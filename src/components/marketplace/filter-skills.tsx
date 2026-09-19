'use client';

import { useState, useMemo } from 'react';
import { X, Plus } from 'lucide-react';
import { useOpportunityFilters } from '@/hooks/marketplace/use-opportunity-filters';
import { useFilterOptions } from '@/hooks/marketplace/use-filter-options';
import { MAX_SKILLS_FILTER } from '@/lib/marketplace/constants';

export function FilterSkills() {
  const { filters, setFilter } = useOpportunityFilters();
  const { data: options } = useFilterOptions();
  const [query, setQuery] = useState('');
  const selectedSkills = filters.skills || [];

  const suggestions = useMemo(() => {
    if (!query || !options?.skills) return [];
    return options.skills
      .filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase()) &&
        !selectedSkills.includes(s.name)
      )
      .slice(0, 5);
  }, [query, options?.skills, selectedSkills]);

  const addSkill = (name: string) => {
    if (selectedSkills.length >= MAX_SKILLS_FILTER) return;
    setFilter('skills', [...selectedSkills, name]);
    setQuery('');
  };

  const removeSkill = (name: string) => {
    setFilter('skills', selectedSkills.filter((s) => s !== name));
  };

  return (
    <div className="space-y-2">
      {/* Selected skills */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedSkills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-50 text-cyan-700 rounded-full text-xs font-medium"
            >
              {skill}
              <button onClick={() => removeSkill(skill)} className="hover:text-cyan-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      {selectedSkills.length < MAX_SKILLS_FILTER && (
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills..."
            className="w-full h-8 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-sm z-10 max-h-32 overflow-y-auto">
              {suggestions.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => addSkill(skill.name)}
                  className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-3 h-3 text-slate-400" />
                  {skill.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="text-[10px] text-slate-400">
        {selectedSkills.length}/{MAX_SKILLS_FILTER} skills selected
      </p>
    </div>
  );
}
