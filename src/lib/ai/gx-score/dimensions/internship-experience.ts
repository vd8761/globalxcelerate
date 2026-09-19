/**
 * Score Internship Experience dimension.
 * Factors: total months, relevance, brand recognition.
 */
export function scoreInternshipExperience(profile: Record<string, unknown>): number {
  const experiences = (profile.experiences || profile.student_experiences || []) as Array<{
    type?: string;
    duration_months?: number;
    start_date?: string;
    end_date?: string;
    company?: string;
    relevance?: string;
  }>;

  const internships = experiences.filter(e =>
    e.type === 'internship' || e.type === 'work'
  );

  if (internships.length === 0) return 0;

  const PER_MONTH_BASE = 3;
  const RELEVANCE_MULTIPLIER: Record<string, number> = { low: 0.5, medium: 1, high: 1.5 };

  let total = 0;

  for (const internship of internships) {
    let months = internship.duration_months || 3;
    if (!months && internship.start_date && internship.end_date) {
      months = Math.ceil((new Date(internship.end_date).getTime() - new Date(internship.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30));
    }

    const relevance = RELEVANCE_MULTIPLIER[(internship.relevance || 'medium').toLowerCase()] || 1;
    total += PER_MONTH_BASE * months * relevance;
  }

  return Math.min(100, Math.max(0, Math.round(total)));
}
