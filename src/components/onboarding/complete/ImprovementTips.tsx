'use client';

import { Lightbulb } from 'lucide-react';

interface ImprovementTipsProps {
  tips: { category: string; message: string; priority: number }[];
}

export function ImprovementTips({ tips }: ImprovementTipsProps) {
  const sorted = [...tips].sort((a, b) => a.priority - b.priority).slice(0, 5);

  if (sorted.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-700">Tips to Improve Your Score</h4>
      <div className="space-y-2">
        {sorted.map((tip, i) => (
          <div key={i} className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-700">{tip.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
