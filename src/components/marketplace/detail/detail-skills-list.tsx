import { cn } from '@/lib/utils';
import type { OpportunitySkill } from '@/types/marketplace';

interface DetailSkillsListProps {
  skills: OpportunitySkill[];
}

export function DetailSkillsList({ skills }: DetailSkillsListProps) {
  if (!skills || skills.length === 0) {
    return <p className="text-sm text-slate-500 italic">No specific skills listed.</p>;
  }

  const required = skills.filter((s) => s.importance === 'required');
  const preferred = skills.filter((s) => s.importance === 'preferred');
  const niceToHave = skills.filter((s) => s.importance === 'nice_to_have');

  return (
    <div className="space-y-6">
      {required.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Required Skills</h4>
          <div className="flex flex-wrap gap-2">
            {required.map((skill) => (
              <SkillTag key={skill.id} skill={skill} variant="required" />
            ))}
          </div>
        </div>
      )}
      {preferred.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Preferred Skills</h4>
          <div className="flex flex-wrap gap-2">
            {preferred.map((skill) => (
              <SkillTag key={skill.id} skill={skill} variant="preferred" />
            ))}
          </div>
        </div>
      )}
      {niceToHave.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Nice to Have</h4>
          <div className="flex flex-wrap gap-2">
            {niceToHave.map((skill) => (
              <SkillTag key={skill.id} skill={skill} variant="nice" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SkillTag({ skill, variant }: { skill: OpportunitySkill; variant: 'required' | 'preferred' | 'nice' }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border',
      variant === 'required' && 'bg-red-50 text-red-700 border-red-200',
      variant === 'preferred' && 'bg-blue-50 text-blue-700 border-blue-200',
      variant === 'nice' && 'bg-slate-50 text-slate-600 border-slate-200',
    )}>
      {skill.name}
      <span className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              i < skill.min_proficiency ? 'bg-current' : 'bg-current/20'
            )}
          />
        ))}
      </span>
    </span>
  );
}
