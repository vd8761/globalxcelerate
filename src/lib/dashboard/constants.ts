import type { GreetingTimeOfDay } from '@/types/dashboard';

export const APPLICATION_STAGES = [
  { key: 'draft', label: 'Draft', color: 'gray' },
  { key: 'submitted', label: 'Submitted', color: 'blue' },
  { key: 'under_review', label: 'Under Review', color: 'yellow' },
  { key: 'shortlisted', label: 'Shortlisted', color: 'purple' },
  { key: 'assessment', label: 'Assessment', color: 'orange' },
  { key: 'interview', label: 'Interview', color: 'cyan' },
  { key: 'selected', label: 'Selected', color: 'green' },
] as const;

export const QUICK_ACTION_ITEMS = [
  { label: 'Browse Opportunities', href: '/student/marketplace', icon: 'Search' },
  { label: 'Edit Profile', href: '/student/onboarding', icon: 'User' },
  { label: 'View Applications', href: '/student/applications', icon: 'FileText' },
  { label: 'GX Score', href: '/student/gx-score', icon: 'Award' },
] as const;

export function getTimeOfDay(): GreetingTimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  return 'evening';
}

export const DASHBOARD_REFRESH_INTERVAL = 60000;
export const MAX_RECOMMENDATIONS = 4;
export const MAX_DEADLINES = 5;
export const MAX_NOTIFICATIONS = 5;
export const MAX_SAVED = 5;

export const STAGE_DOT_COLORS: Record<string, string> = {
  gray: 'bg-gray-400',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  cyan: 'bg-cyan-500',
  green: 'bg-green-500',
};
