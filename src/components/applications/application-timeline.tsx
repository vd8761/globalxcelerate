'use client';

import { cn } from '@/lib/utils';
import type { ApplicationStatus, StatusHistoryEntry } from '@/lib/applications/types';
import { PIPELINE_STAGES, STATUS_LABELS } from '@/lib/applications/constants';
import { isTerminalStatus } from '@/lib/applications/transitions';
import { formatRelativeDate } from '@/lib/applications/utils';

interface Props {
  statusHistory: StatusHistoryEntry[];
  currentStatus: ApplicationStatus;
}

export function ApplicationTimeline({ statusHistory, currentStatus }: Props) {
  const currentIdx = PIPELINE_STAGES.indexOf(currentStatus);
  const isTerminal = isTerminalStatus(currentStatus);
  // For terminal states not in pipeline (rejected/withdrawn), show where it branched
  const effectiveIdx = currentIdx >= 0 ? currentIdx : getTerminalBranchIndex(statusHistory);

  return (
    <div className="relative pl-6">
      {PIPELINE_STAGES.map((stage, idx) => {
        const historyEntry = statusHistory.find((h) => h.to_status === stage);
        const isReached = idx <= effectiveIdx;
        const isCurrent = stage === currentStatus;
        const isPast = isReached && !isCurrent;
        const isFuture = !isReached;

        return (
          <div key={stage} className="relative pb-6 last:pb-0">
            {/* Connecting line */}
            {idx < PIPELINE_STAGES.length - 1 && (
              <div
                className={cn(
                  'absolute left-[-16px] top-4 w-0.5 h-full',
                  isPast || isCurrent ? 'bg-slate-800' : 'bg-slate-200 border-dashed'
                )}
              />
            )}

            {/* Dot */}
            <div
              className={cn(
                'absolute left-[-20px] top-1 w-3 h-3 rounded-full border-2',
                isCurrent && 'bg-cyan-500 border-cyan-500 shadow-[0_0_0_4px_rgba(6,182,212,0.15)]',
                isPast && 'bg-slate-800 border-slate-800',
                isFuture && 'bg-white border-slate-300'
              )}
            >
              {isCurrent && (
                <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-40" />
              )}
            </div>

            {/* Content */}
            <div className="ml-2">
              <p
                className={cn(
                  'text-sm font-medium',
                  isCurrent && 'text-slate-900',
                  isPast && 'text-slate-700',
                  isFuture && 'text-slate-400'
                )}
              >
                {STATUS_LABELS[stage]}
              </p>
              {historyEntry && (
                <div className="mt-0.5">
                  <span className="text-xs text-slate-400">{formatRelativeDate(historyEntry.created_at)}</span>
                  {historyEntry.actor_name && (
                    <span className="text-xs text-slate-400"> · {historyEntry.actor_name}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Terminal branch node (Rejected/Withdrawn) */}
      {isTerminal && !PIPELINE_STAGES.includes(currentStatus) && (
        <div className="relative pb-0 mt-2">
          <div
            className={cn(
              'absolute left-[-20px] top-1 w-3 h-3 rounded-full border-2',
              currentStatus === 'rejected' && 'bg-red-500 border-red-500',
              currentStatus === 'withdrawn' && 'bg-gray-400 border-gray-400'
            )}
          />
          <div className="ml-2">
            <p className={cn(
              'text-sm font-medium',
              currentStatus === 'rejected' ? 'text-red-700' : 'text-gray-500'
            )}>
              {STATUS_LABELS[currentStatus]}
            </p>
            {statusHistory.find((h) => h.to_status === currentStatus) && (
              <span className="text-xs text-slate-400">
                {formatRelativeDate(statusHistory.find((h) => h.to_status === currentStatus)!.created_at)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getTerminalBranchIndex(history: StatusHistoryEntry[]): number {
  // Find the last non-terminal status to determine where in pipeline we branched
  const sorted = [...history].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  for (const entry of sorted) {
    const idx = PIPELINE_STAGES.indexOf(entry.from_status as ApplicationStatus);
    if (idx >= 0) return idx;
  }
  return 0;
}
