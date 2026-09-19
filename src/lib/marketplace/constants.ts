import type { OpportunityCategory } from '@/types/marketplace';

export const CATEGORIES = [
  { value: 'all' as const, label: 'All', icon: 'LayoutGrid', color: 'bg-gray-100 text-gray-800' },
  { value: 'internships' as const, label: 'Internships', icon: 'Briefcase', color: 'bg-blue-100 text-blue-800' },
  { value: 'global_immersion' as const, label: 'Global Immersion', icon: 'Globe', color: 'bg-purple-100 text-purple-800' },
  { value: 'exchange' as const, label: 'Exchange', icon: 'ArrowLeftRight', color: 'bg-green-100 text-green-800' },
  { value: 'industry_projects' as const, label: 'Industry Projects', icon: 'Building2', color: 'bg-orange-100 text-orange-800' },
  { value: 'research' as const, label: 'Research', icon: 'FlaskConical', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'scholarships' as const, label: 'Scholarships', icon: 'GraduationCap', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'graduate_careers' as const, label: 'Graduate Careers', icon: 'Rocket', color: 'bg-rose-100 text-rose-800' },
] as const;

export const CATEGORY_COLORS: Record<OpportunityCategory | 'all', { bg: string; text: string }> = {
  all: { bg: 'bg-gray-100', text: 'text-gray-800' },
  internships: { bg: 'bg-blue-100', text: 'text-blue-800' },
  global_immersion: { bg: 'bg-purple-100', text: 'text-purple-800' },
  exchange: { bg: 'bg-green-100', text: 'text-green-800' },
  industry_projects: { bg: 'bg-orange-100', text: 'text-orange-800' },
  research: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  scholarships: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  graduate_careers: { bg: 'bg-rose-100', text: 'text-rose-800' },
};

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance', requiresSearch: true },
  { value: 'match_score', label: 'Best Match', requiresAuth: true },
  { value: 'deadline', label: 'Deadline: Soonest' },
  { value: 'newest', label: 'Newest First' },
  { value: 'compensation', label: 'Compensation: High to Low' },
] as const;

export const WORK_MODE_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'on_site', label: 'On-site' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
] as const;

export const DURATION_RANGE = { min: 1, max: 104, defaultUnit: 'weeks' as const };
export const COMPENSATION_RANGE = { min: 0, max: 10000 };

export const PAGE_SIZE_OPTIONS = [12, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_SAVED = 100;
export const MAX_SKILLS_FILTER = 10;
export const MAX_INDUSTRIES_FILTER = 5;
export const SEARCH_MIN_CHARS = 2;
export const SEARCH_DEBOUNCE_MS = 300;

export const MATCH_SCORE_COLORS = [
  { min: 85, gradient: 'from-emerald-500 to-cyan-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  { min: 70, gradient: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50', text: 'text-cyan-700' },
  { min: 50, gradient: 'from-amber-400 to-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  { min: 0, gradient: 'from-gray-300 to-gray-400', bg: 'bg-gray-50', text: 'text-gray-600' },
] as const;

export const DEADLINE_URGENCY = {
  critical: { days: 3, color: 'text-red-600', bg: 'bg-red-50' },
  warning: { days: 7, color: 'text-amber-600', bg: 'bg-amber-50' },
  normal: { color: 'text-gray-600', bg: '' },
} as const;

export const CATEGORY_LABELS: Record<OpportunityCategory, string> = {
  internships: 'Internship',
  global_immersion: 'Global Immersion',
  exchange: 'Exchange Program',
  industry_projects: 'Industry Project',
  research: 'Research Collaboration',
  scholarships: 'Scholarship',
  graduate_careers: 'Graduate Career',
};
