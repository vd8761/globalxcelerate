import { Calendar, AlertTriangle } from 'lucide-react';
import type { UpcomingDeadline } from '@/types/dashboard';
import { MAX_DEADLINES } from '@/lib/dashboard/constants';

interface DeadlinesWidgetProps {
  deadlines: UpcomingDeadline[];
}

function getUrgencyStyles(urgency: UpcomingDeadline['urgency']) {
  switch (urgency) {
    case 'critical':
      return { bar: 'bg-red-500', badge: 'text-red-600 bg-red-50' };
    case 'warning':
      return { bar: 'bg-amber-500', badge: 'text-amber-600 bg-amber-50' };
    default:
      return { bar: 'bg-green-500', badge: 'text-gray-600 bg-gray-100' };
  }
}

function formatDeadlineDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDaysLabel(days: number): string {
  if (days <= 0) return 'Today!';
  if (days === 1) return 'Tomorrow';
  return `${days} days left`;
}

export function DeadlinesWidget({ deadlines }: DeadlinesWidgetProps) {
  const sorted = [...deadlines]
    .sort((a, b) => a.days_remaining - b.days_remaining)
    .slice(0, MAX_DEADLINES);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-slate-700" />
        <h2 className="text-lg font-semibold text-slate-900">Upcoming Deadlines</h2>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Calendar className="w-10 h-10 text-gray-200 mb-2" />
          <p className="text-sm text-gray-500">No upcoming deadlines</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((deadline) => {
            const styles = getUrgencyStyles(deadline.urgency);
            return (
              <div key={deadline.id} className="flex items-start gap-3">
                <div className={`w-0.5 self-stretch rounded-full ${styles.bar} min-h-[40px]`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 line-clamp-1">
                    {deadline.opportunity_title}
                  </p>
                  <p className="text-xs text-gray-500">{deadline.organization_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDeadlineDate(deadline.deadline_date)}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${styles.badge}`}>
                  {deadline.urgency === 'critical' && <AlertTriangle className="w-3 h-3 inline mr-0.5" />}
                  {getDaysLabel(deadline.days_remaining)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
