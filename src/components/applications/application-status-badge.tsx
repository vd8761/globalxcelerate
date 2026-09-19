'use client';

import { cn } from '@/lib/utils';
import type { ApplicationStatus } from '@/lib/applications/types';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/applications/constants';

interface Props {
  status: ApplicationStatus;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

const dotSizes = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

export function ApplicationStatusBadge({ status, size = 'md' }: Props) {
  const colors = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap',
        colors.bg,
        colors.text,
        colors.border,
        sizeClasses[size]
      )}
    >
      <span className={cn('rounded-full', dotSizes[size], getDotColor(status))} />
      {label}
    </span>
  );
}

function getDotColor(status: ApplicationStatus): string {
  const map: Record<ApplicationStatus, string> = {
    draft: 'bg-slate-500',
    submitted: 'bg-cyan-500',
    under_review: 'bg-blue-500',
    shortlisted: 'bg-indigo-500',
    assessment: 'bg-purple-500',
    interview: 'bg-amber-500',
    selected: 'bg-emerald-500',
    rejected: 'bg-red-500',
    withdrawn: 'bg-gray-400',
  };
  return map[status];
}
