import type { DimensionScore } from '../types';

interface StudentAvailability {
  available_from?: string;
  available_to?: string;
}

interface OpportunityDates {
  start_date?: string;
  end_date?: string;
  duration_months?: number;
}

/**
 * Calculate availability dimension score based on date overlap.
 */
export function calculateAvailabilityScore(
  studentAvailability: StudentAvailability,
  opportunityDates: OpportunityDates
): DimensionScore {
  // If dates not specified, default to neutral
  if (!studentAvailability.available_from || !opportunityDates.start_date) {
    return { score: 60, weight: 0, weighted_score: 0, label: 'Availability' };
  }

  const studentStart = new Date(studentAvailability.available_from).getTime();
  const studentEnd = studentAvailability.available_to
    ? new Date(studentAvailability.available_to).getTime()
    : studentStart + 365 * 24 * 60 * 60 * 1000; // Default 1 year

  const oppStart = new Date(opportunityDates.start_date).getTime();
  const oppEnd = opportunityDates.end_date
    ? new Date(opportunityDates.end_date).getTime()
    : oppStart + (opportunityDates.duration_months || 3) * 30 * 24 * 60 * 60 * 1000;

  // Calculate overlap
  const overlapStart = Math.max(studentStart, oppStart);
  const overlapEnd = Math.min(studentEnd, oppEnd);
  const overlap = Math.max(0, overlapEnd - overlapStart);

  const oppDuration = oppEnd - oppStart;
  if (oppDuration <= 0) {
    return { score: 60, weight: 0, weighted_score: 0, label: 'Availability' };
  }

  const overlapPercentage = overlap / oppDuration;

  let score: number;
  if (overlapPercentage >= 1.0) score = 100;
  else if (overlapPercentage >= 0.75) score = 80;
  else if (overlapPercentage >= 0.5) score = 60;
  else if (overlapPercentage >= 0.25) score = 40;
  else score = 20;

  return { score, weight: 0, weighted_score: 0, label: 'Availability' };
}
