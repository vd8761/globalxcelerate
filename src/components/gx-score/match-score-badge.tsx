'use client';

interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const SIZE_MAP = {
  sm: { diameter: 32, stroke: 3, fontSize: 'text-xs' },
  md: { diameter: 40, stroke: 3.5, fontSize: 'text-sm font-bold' },
  lg: { diameter: 56, stroke: 4, fontSize: 'text-lg font-bold' },
};

function getScoreColors(score: number) {
  if (score >= 75) return { start: '#22D3EE', end: '#0891B2' };
  if (score >= 50) return { start: '#FBBF24', end: '#F59E0B' };
  return { start: '#F87171', end: '#EF4444' };
}

export function MatchScoreBadge({ score, size = 'md', onClick }: MatchScoreBadgeProps) {
  const { diameter, stroke, fontSize } = SIZE_MAP[size];
  const radius = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (Math.min(score, 100) / 100) * circumference;
  const colors = getScoreColors(score);
  const gradientId = `match-gradient-${score}-${size}`;

  return (
    <button
      onClick={onClick}
      className="relative inline-flex items-center justify-center group cursor-pointer"
      title={`Match Score: ${score}% — Click for details`}
      aria-label={`Match score ${score} percent`}
    >
      <svg width={diameter} height={diameter} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={stroke}
        />
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className={`absolute ${fontSize} text-slate-900`}>
        {Math.round(score)}
      </span>
    </button>
  );
}
