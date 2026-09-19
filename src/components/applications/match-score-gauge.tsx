'use client';

import { cn } from '@/lib/utils';

interface Props {
  score: number | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeDimensions = {
  sm: { width: 32, stroke: 3, fontSize: 'text-[9px]' },
  md: { width: 48, stroke: 4, fontSize: 'text-xs' },
  lg: { width: 80, stroke: 5, fontSize: 'text-base' },
};

export function MatchScoreGauge({ score, size = 'md' }: Props) {
  const { width, stroke, fontSize } = sizeDimensions[size];
  const radius = (width - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score !== null ? (score / 100) * circumference : 0;
  const offset = circumference - progress;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width, height: width }}>
      <svg width={width} height={width} className="-rotate-90">
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-gray-200"
        />
        {score !== null && (
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
            style={{ stroke: 'url(#gauge-gradient)' }}
          />
        )}
        <defs>
          <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
      <span className={cn('absolute font-semibold text-slate-800', fontSize)}>
        {score !== null ? `${Math.round(score)}%` : '\u2014'}
      </span>
    </div>
  );
}
