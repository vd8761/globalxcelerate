'use client';

import { Check, X, ArrowUp } from 'lucide-react';

interface SkillChipProps {
  name: string;
  status: 'matched' | 'missing' | 'partial';
  priority?: 'high' | 'medium' | 'low';
  proficiencyRequired?: number;
  proficiencyCurrent?: number | null;
}

const STATUS_STYLES = {
  matched: 'border-solid border-cyan-300 text-cyan-700 bg-cyan-50',
  missing: 'border-dashed border-red-300 text-red-600 bg-red-50',
  partial: 'border-dashed border-amber-300 text-amber-700 bg-amber-50',
};

export function SkillChip({ name, status, proficiencyRequired, proficiencyCurrent }: SkillChipProps) {
  const styles = STATUS_STYLES[status];

  const tooltip = proficiencyRequired
    ? `Required: Level ${proficiencyRequired}${proficiencyCurrent ? `, Current: Level ${proficiencyCurrent}` : ', Not acquired'}`
    : undefined;

  return (
    <span
      className={`inline-flex items-center gap-1 border rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}
      title={tooltip}
    >
      {status === 'matched' && <Check className="h-3 w-3" />}
      {status === 'missing' && <X className="h-3 w-3" />}
      {status === 'partial' && <ArrowUp className="h-3 w-3" />}
      {name}
    </span>
  );
}
