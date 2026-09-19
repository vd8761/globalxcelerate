export type GreetingTimeOfDay = 'morning' | 'afternoon' | 'evening';

export interface DashboardProfile {
  first_name: string;
  last_name: string;
  profile_photo_url: string | null;
  profile_completion_percentage: number;
  gx_score: number | null;
  gx_grade: string | null;
  onboarding_completed: boolean;
}

export interface OpportunityRecommendation {
  id: string;
  title: string;
  organization_name: string;
  country: string;
  duration: string | null;
  match_percentage: number;
  category: string;
  deadline: string;
}

export interface ApplicationCounts {
  draft: number;
  submitted: number;
  under_review: number;
  shortlisted: number;
  assessment: number;
  interview: number;
  selected: number;
  total: number;
}

export interface UpcomingDeadline {
  id: string;
  opportunity_title: string;
  organization_name: string;
  deadline_date: string;
  days_remaining: number;
  urgency: 'critical' | 'warning' | 'normal';
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface SavedOpportunityItem {
  id: string;
  title: string;
  organization_name: string;
  country: string;
  category: string;
  deadline: string;
}

export interface DashboardData {
  profile: DashboardProfile;
  recommendations: OpportunityRecommendation[];
  applications: ApplicationCounts;
  deadlines: UpcomingDeadline[];
  notifications: DashboardNotification[];
  savedOpportunities: SavedOpportunityItem[];
}
