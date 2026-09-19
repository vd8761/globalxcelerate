'use client';

import { getGradeBracket } from '@/lib/ai/constants/grade-brackets';
import type { DimensionDefinition } from '@/lib/ai/types';
import {
  GraduationCap,
  Code2,
  MessageSquare,
  Users,
  FolderKanban,
  Briefcase,
  Globe,
  Award,
  Palette,
  Video,
  Languages,
  TrendingUp,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  Code2,
  MessageSquare,
  Users,
  FolderKanban,
  Briefcase,
  Globe,
  Award,
  Palette,
  Video,
  Languages,
  TrendingUp,
};

const COLOR_MAP: Record<string, { border: string; bg: string; bar: string }> = {
  'cyan-500': { border: 'border-l-cyan-500', bg: 'bg-cyan-500', bar: 'bg-cyan-500' },
  'emerald-500': { border: 'border-l-emerald-500', bg: 'bg-emerald-500', bar: 'bg-emerald-500' },
  'amber-500': { border: 'border-l-amber-500', bg: 'bg-amber-500', bar: 'bg-amber-500' },
  'orange-500': { border: 'border-l-orange-500', bg: 'bg-orange-500', bar: 'bg-orange-500' },
  'red-500': { border: 'border-l-red-500', bg: 'bg-red-500', bar: 'bg-red-500' },
};

interface GXScoreDimensionCardProps {
  dimension: DimensionDefinition;
  score: number;
}

export function GXScoreDimensionCard({ dimension, score }: GXScoreDimensionCardProps) {
  const bracket = getGradeBracket(score);
  const colors = COLOR_MAP[bracket.color] || COLOR_MAP['red-500'];
  const Icon = ICON_MAP[dimension.icon];

  return (
    <div className={`bg-white rounded-xl border border-slate-200 border-l-4 ${colors.border} p-4 hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-slate-500" />}
          <span className="text-sm font-medium text-slate-800 truncate">{dimension.label}</span>
        </div>
        <span className="text-sm font-bold text-slate-900">{score}</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colors.bar} transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 mt-1.5 truncate">{dimension.description}</p>
    </div>
  );
}
