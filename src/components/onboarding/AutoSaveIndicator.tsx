'use client';

import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt?: string | null;
  onRetry?: () => void;
}

export function AutoSaveIndicator({ status, lastSavedAt, onRetry }: AutoSaveIndicatorProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status === 'saving' || status === 'error') {
      setVisible(true);
    } else if (status === 'saved') {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [status]);

  if (!visible && status === 'idle') return null;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300',
        status === 'saving' && 'bg-slate-100 text-slate-500',
        status === 'saved' && 'bg-emerald-50 text-emerald-600',
        status === 'error' && 'bg-red-50 text-red-600',
        !visible && 'opacity-0',
        visible && 'opacity-100',
      )}
    >
      {status === 'saving' && (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          Saving...
        </>
      )}
      {status === 'saved' && (
        <>
          <CheckCircle className="w-3 h-3" />
          Saved
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="w-3 h-3" />
          Failed
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="underline ml-1 hover:text-red-700"
            >
              Retry
            </button>
          )}
        </>
      )}
    </div>
  );
}
