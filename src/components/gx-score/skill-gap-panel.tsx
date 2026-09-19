'use client';

import { useMemo } from 'react';
import { SkillChip } from './skill-chip';
import type { SkillGap } from '@/lib/ai/types';

interface MatchedSkill {
  name: string;
  status: 'matched';
}

interface SkillGapPanelProps {
  skillGaps: SkillGap[];
  matchedSkills?: MatchedSkill[];
}

export function SkillGapPanel({ skillGaps, matchedSkills = [] }: SkillGapPanelProps) {
  const grouped = useMemo(() => {
    const high = skillGaps.filter(g => g.priority === 'high');
    const medium = skillGaps.filter(g => g.priority === 'medium');
    const low = skillGaps.filter(g => g.priority === 'low');
    return { high, medium, low };
  }, [skillGaps]);

  const totalMissing = skillGaps.filter(g => !g.proficiency_current).length;
  const totalPartial = skillGaps.filter(g => g.proficiency_current !== null && g.proficiency_current < g.proficiency_required).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Skills to Develop</h3>
        <div className="flex gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            {matchedSkills.length} matched
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            {totalMissing} missing
          </span>
          {totalPartial > 0 && (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {totalPartial} partial
            </span>
          )}
        </div>
      </div>

      {/* Matched Skills */}
      {matchedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {matchedSkills.map(skill => (
            <SkillChip key={skill.name} name={skill.name} status="matched" />
          ))}
        </div>
      )}

      {/* High Priority Gaps */}
      {grouped.high.length > 0 && (
        <div>
          <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-2">High Priority</p>
          <div className="flex flex-wrap gap-2">
            {grouped.high.map(gap => (
              <SkillChip
                key={gap.skill_name}
                name={gap.skill_name}
                status={gap.proficiency_current ? 'partial' : 'missing'}
                priority="high"
                proficiencyRequired={gap.proficiency_required}
                proficiencyCurrent={gap.proficiency_current}
              />
            ))}
          </div>
        </div>
      )}

      {/* Medium Priority */}
      {grouped.medium.length > 0 && (
        <div>
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-2">Medium Priority</p>
          <div className="flex flex-wrap gap-2">
            {grouped.medium.map(gap => (
              <SkillChip
                key={gap.skill_name}
                name={gap.skill_name}
                status={gap.proficiency_current ? 'partial' : 'missing'}
                priority="medium"
                proficiencyRequired={gap.proficiency_required}
                proficiencyCurrent={gap.proficiency_current}
              />
            ))}
          </div>
        </div>
      )}

      {/* Low Priority */}
      {grouped.low.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Nice to Have</p>
          <div className="flex flex-wrap gap-2">
            {grouped.low.map(gap => (
              <SkillChip
                key={gap.skill_name}
                name={gap.skill_name}
                status={gap.proficiency_current ? 'partial' : 'missing'}
                priority="low"
                proficiencyRequired={gap.proficiency_required}
                proficiencyCurrent={gap.proficiency_current}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
