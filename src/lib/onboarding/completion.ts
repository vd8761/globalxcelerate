import {
  IDENTITY_FIELD_WEIGHTS,
  EDUCATION_THRESHOLDS,
  SKILLS_THRESHOLDS,
  EXPERIENCE_THRESHOLDS,
  PORTFOLIO_THRESHOLDS,
  STEP_WEIGHTS,
} from './constants';
import type {
  IdentityData,
  EducationEntry,
  SkillEntry,
  ExperienceEntry,
  CareerGoalsData,
  GlobalPreferencesData,
  PortfolioItem,
} from './types';

function interpolateThreshold(count: number, thresholds: Record<number, number>): number {
  const keys = Object.keys(thresholds).map(Number).sort((a, b) => a - b);
  if (count <= 0) return 0;
  if (count >= keys[keys.length - 1]) return 1;
  for (let i = 0; i < keys.length; i++) {
    if (count <= keys[i]) {
      if (i === 0) return thresholds[keys[0]] * (count / keys[0]);
      const prevKey = keys[i - 1];
      const currKey = keys[i];
      const prevVal = thresholds[prevKey];
      const currVal = thresholds[currKey];
      const ratio = (count - prevKey) / (currKey - prevKey);
      return prevVal + ratio * (currVal - prevVal);
    }
  }
  return 1;
}

export function calculateIdentityCompletion(data: Partial<IdentityData>): number {
  let total = 0;
  for (const [field, weight] of Object.entries(IDENTITY_FIELD_WEIGHTS)) {
    const value = data[field as keyof IdentityData];
    if (value && String(value).trim().length > 0) {
      total += weight;
    }
  }
  return Math.min(total, 1);
}

export function calculateEducationCompletion(entries: EducationEntry[]): number {
  const validEntries = entries.filter(
    (e) => e.institution_name && e.degree_level && e.field_of_study && e.start_date
  );
  return interpolateThreshold(validEntries.length, EDUCATION_THRESHOLDS);
}

export function calculateSkillsCompletion(skills: SkillEntry[]): number {
  const validSkills = skills.filter((s) => s.skill_name && s.proficiency >= 1);
  return interpolateThreshold(validSkills.length, SKILLS_THRESHOLDS);
}

export function calculateExperienceCompletion(entries: ExperienceEntry[]): number {
  const valid = entries.filter((e) => e.title && e.organization_name && e.start_date);
  return interpolateThreshold(valid.length, EXPERIENCE_THRESHOLDS);
}

export function calculateCareerGoalsCompletion(data: Partial<CareerGoalsData>): number {
  const sections = [
    (data.preferred_industries?.length ?? 0) > 0,
    (data.preferred_functions?.length ?? 0) > 0,
    (data.preferred_countries?.length ?? 0) > 0,
    !!data.work_mode,
    data.salary_min != null || data.salary_max != null,
    !!data.availability_date,
    data.mobility_readiness != null,
    data.visa_sponsorship_needed != null,
  ];
  const completed = sections.filter(Boolean).length;
  return completed / sections.length;
}

export function calculateGlobalPreferencesCompletion(data: Partial<GlobalPreferencesData>): number {
  let total = 0;
  // Languages 40%
  if ((data.languages?.length ?? 0) > 0) total += 0.4;
  // Program types 30%
  if ((data.preferred_program_types?.length ?? 0) > 0) total += 0.3;
  // Relocation 20%
  if (data.relocation_willingness) total += 0.2;
  // Cultural + travel 10%
  if ((data.cultural_interests?.length ?? 0) > 0 || data.travel_experience) total += 0.1;
  return Math.min(total, 1);
}

export function calculatePortfolioCompletion(items: PortfolioItem[]): number {
  const valid = items.filter((i) => i.title && i.section);
  return interpolateThreshold(valid.length, PORTFOLIO_THRESHOLDS);
}

export function calculateStepCompletion(stepName: string, data: unknown): number {
  switch (stepName) {
    case 'identity':
      return calculateIdentityCompletion(data as Partial<IdentityData>);
    case 'education': {
      const ed = data as { entries?: EducationEntry[] };
      return calculateEducationCompletion(ed?.entries ?? []);
    }
    case 'skills': {
      const sk = data as { skills?: SkillEntry[] };
      return calculateSkillsCompletion(sk?.skills ?? []);
    }
    case 'experience': {
      const ex = data as { entries?: ExperienceEntry[] };
      return calculateExperienceCompletion(ex?.entries ?? []);
    }
    case 'career-goals':
      return calculateCareerGoalsCompletion(data as Partial<CareerGoalsData>);
    case 'global-preferences':
      return calculateGlobalPreferencesCompletion(data as Partial<GlobalPreferencesData>);
    case 'portfolio': {
      const pf = data as { items?: PortfolioItem[] };
      return calculatePortfolioCompletion(pf?.items ?? []);
    }
    default:
      return 0;
  }
}

export function calculateOverallCompletion(allStepsData: Record<string, unknown>): number {
  let total = 0;
  for (const [stepName, weight] of Object.entries(STEP_WEIGHTS)) {
    const stepData = allStepsData[stepName];
    if (stepData) {
      total += weight * calculateStepCompletion(stepName, stepData);
    }
  }
  return Math.round(total * 100);
}

export function getGrade(score: number): string {
  if (score >= 90) return 'Exceptional';
  if (score >= 75) return 'Strong';
  if (score >= 50) return 'Developing';
  if (score >= 25) return 'Emerging';
  return 'Beginner';
}
