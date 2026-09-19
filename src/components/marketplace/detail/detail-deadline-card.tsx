'use client';

import { useEffect, useState } from 'react';
import { Calendar, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDeadlineUrgency, getCountdown, isExpired, formatDeadline } from '@/lib/marketplace/deadline-utils';

interface DetailDeadlineCardProps {
  deadline: string | null;
}

export function DetailDeadlineCard({ deadline }: DetailDeadlineCardProps) {
  const [countdown, setCountdown] = useState(deadline ? getCountdown(deadline) : null);
  const urgency = getDeadlineUrgency(deadline);
  const expired = isExpired(deadline);

  useEffect(() => {
    if (!deadline || expired) return;
    const timer = setInterval(() => {
      setCountdown(getCountdown(deadline));
    }, 60000);
    return () => clearInterval(timer);
  }, [deadline, expired]);

  if (!deadline) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Calendar className="w-4 h-4" />
          <span>Rolling applications — No deadline</span>
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          <span>Applications closed</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'border rounded-2xl p-5',
      urgency === 'critical' ? 'bg-red-50 border-red-200' : urgency === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'
    )}>
      {urgency === 'critical' && (
        <div className="flex items-center gap-1.5 text-red-600 text-xs font-semibold mb-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          Closing soon!
        </div>
      )}

      {countdown && (urgency === 'critical' || urgency === 'warning') ? (
        <div className="flex items-center gap-3">
          <TimeBox value={countdown.days} label="Days" />
          <span className="text-slate-400 font-bold">:</span>
          <TimeBox value={countdown.hours} label="Hours" />
          <span className="text-slate-400 font-bold">:</span>
          <TimeBox value={countdown.minutes} label="Min" />
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{formatDeadline(deadline)}</span>
        </div>
      )}
    </div>
  );
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold text-slate-900">{String(value).padStart(2, '0')}</div>
      <div className="text-[10px] text-slate-500 uppercase">{label}</div>
    </div>
  );
}
