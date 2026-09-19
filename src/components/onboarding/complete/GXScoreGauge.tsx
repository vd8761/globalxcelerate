'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface GXScoreGaugeProps {
  score: number;
  grade: string;
  isLoading: boolean;
}

export function GXScoreGauge({ score, grade, isLoading }: GXScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (isLoading || score === 0) return;
    let current = 0;
    const duration = 1500;
    const step = score / (duration / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= score) {
        current = score;
        clearInterval(timer);
      }
      setDisplayScore(Math.round(current));
    }, 16);
    return () => clearInterval(timer);
  }, [score, isLoading]);

  const circumference = 2 * Math.PI * 56;
  const offset = circumference - (displayScore / 100) * circumference;

  const gradeColors: Record<string, string> = {
    Exceptional: 'text-amber-500',
    Strong: 'text-cyan-500',
    Developing: 'text-blue-500',
    Emerging: 'text-slate-500',
    Beginner: 'text-slate-400',
  };

  if (isLoading) {
    return (
      <div className="w-36 h-36 rounded-full bg-slate-100 animate-pulse flex items-center justify-center">
        <span className="text-sm text-slate-400">Calculating...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle cx="60" cy="60" r="56" fill="none" stroke="#e2e8f0" strokeWidth="8" />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r="56"
            fill="none"
            stroke="url(#gauge-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-300"
          />
          <defs>
            <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-slate-800">{displayScore}</span>
          <span className="text-xs text-slate-500">GX Score</span>
        </div>
      </div>
      <span className={cn('text-sm font-semibold', gradeColors[grade] ?? 'text-slate-600')}>
        {grade}
      </span>
    </div>
  );
}
