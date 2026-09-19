import type { DurationUnit } from '@/types/marketplace';

export function normalizeDurationToWeeks(value: number, unit: DurationUnit): number {
  switch (unit) {
    case 'weeks': return value;
    case 'months': return Math.round(value * 4.33);
    case 'years': return Math.round(value * 52);
    default: return value;
  }
}

export function formatDuration(value: number | null, unit: DurationUnit | null): string {
  if (!value || !unit) return 'Flexible';
  const label = value === 1 ? unit.slice(0, -1) : unit;
  return `${value} ${label}`;
}

export function getDurationRange(
  minWeeks: number,
  maxWeeks: number
): { min: number; max: number; unit: DurationUnit } {
  if (maxWeeks <= 12) {
    return { min: minWeeks, max: maxWeeks, unit: 'weeks' };
  }
  if (maxWeeks <= 104) {
    return {
      min: Math.round(minWeeks / 4.33),
      max: Math.round(maxWeeks / 4.33),
      unit: 'months',
    };
  }
  return {
    min: Math.round(minWeeks / 52),
    max: Math.round(maxWeeks / 52),
    unit: 'years',
  };
}
