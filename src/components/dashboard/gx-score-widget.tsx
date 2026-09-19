'use client';

import { useState, useEffect } from 'react';

interface GXScoreWidgetProps {
  score: number | null;
  grade: string | null;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#06B6D4';
  if (score >= 40) return '#F59E0B';
  return '#EF4444';
}

export function GXScoreWidget({ score, grade }: GXScoreWidgetProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (score === null) return;
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = 50;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;
  const strokeColor = score !== null ? getScoreColor(score) : '#D1D5DB';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-between">
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide self-start">
        GX Score
      </p>

      <div className="relative my-4">
        <svg height={radius * 2} width={radius * 2} className="-rotate-90">
          <circle
            stroke="#E5E7EB"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {score !== null && (
            <circle
              stroke={strokeColor}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="transition-all duration-1000 ease-out"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {score !== null ? (
            <>
              <span className="text-2xl font-bold text-slate-900">{score}</span>
              <span className="text-sm text-gray-400">/100</span>
            </>
          ) : (
            <span className="text-sm text-gray-400">N/A</span>
          )}
        </div>
      </div>

      {score !== null && grade ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
          Grade: {grade}
        </span>
      ) : (
        <p className="text-xs text-gray-500 text-center">
          Complete your profile to calculate your GX Score
        </p>
      )}

      <a
        href="#"
        className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
      >
        Improve My Score →
      </a>
    </div>
  );
}
