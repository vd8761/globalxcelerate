// Onboarding Module Types

export type StepStatus = 'pending' | 'active' | 'completed' | 'skipped';

export type StepName = 
  | 'identity' 
  | 'education' 
  | 'skills' 
  | 'experience' 
  | 'career-goals' 
  | 'global-preferences' 
  | 'portfolio' 
  | 'complete';

export type SaveAction = 'save' | 'next' | 'skip';

// Enums
export type DegreeLevelEnum = 
  | 'high_school' 
  | 'associate' 
  | 'bachelor' 
  | 'master' 
  | 'doctorate' 
  | 'professional' 
  | 'certificate' 
  | 'diploma';

export type SkillCategoryEnum = 
  | 'technical' 
  | 'soft_skill' 
  | 'language' 
  | 'tool' 
  | 'domain';

export type ExperienceTypeEnum = 
  | 'internship' 
  | 'full_time' 
  | 'part_time' 
  | 'freelance' 
  | 'volunteering' 
  | 'research' 
  | 'student_org' 
  | 'personal_project' 
  | 'other';

export type WorkModeEnum = 'remote' | 'hybrid' | 'on_site' | 'no_preference';

export type SalaryPeriodEnum = 'hourly' | 'monthly' | 'annual';

export type RelocationEnum = 'yes' | 'yes_with_conditions' | 'no' | 'undecided';

export type TravelExperienceEnum = 'none' | '1_2_countries' | '3_5_countries' | '6_10_countries' | '10_plus_countries';

export type LanguageProficiencyEnum = 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2' | 'native';

export type PortfolioSectionEnum = 'project' | 'publication' | 'achievement';

export type ProgramTypeEnum = 
  | 'study_abroad' 
  | 'exchange' 
  | 'international_internship' 
  | 'global_immersion' 
  | 'research_abroad' 
  | 'volunteer_abroad' 
  | 'short_term' 
  | 'long_term';

// Step Data Interfaces
export interface IdentityData {
  first_name: string;
  last_name: string;
  middle_name: string;
  preferred_name: string;
  date_of_birth: string;
  gender: string;
  pronouns: string;
  nationality: string;
  country_of_residence: string;
  city: string;
  phone_number: string;
  bio: string;
  profile_photo_url: string;
  profile_photo_thumbnail_url: string;
}

export interface EducationEntry {
  id: string;
  institution_name: string;
  institution_id: string | null;
  degree_level: DegreeLevelEnum | '';
  field_of_study: string;
  field_of_study_id: string | null;
  gpa_value: number | null;
  gpa_scale: number | null;
  gpa_normalized: number | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string;
  honors: string;
  thesis_title: string;
  display_order: number;
}

export interface SkillEntry {
  id: string;
  skill_id: string | null;
  skill_name: string;
  category: SkillCategoryEnum;
  proficiency: number;
  is_custom: boolean;
  is_verified: boolean;
  source: string;
  display_order: number;
}

export interface ExperienceEntry {
  id: string;
  type: ExperienceTypeEnum;
  title: string;
  organization_name: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  skills_used: string[];
  outcomes: string[];
  url: string;
  display_order: number;
}

export interface CareerGoalsData {
  preferred_industries: string[];
  preferred_functions: string[];
  preferred_countries: string[];
  work_mode: WorkModeEnum | '';
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  salary_period: SalaryPeriodEnum | '';
  availability_date: string;
  mobility_readiness: number | null;
  visa_sponsorship_needed: boolean | null;
  visa_details: string;
}

export interface LanguageEntry {
  id: string;
  language_code: string;
  language_name: string;
  proficiency: LanguageProficiencyEnum;
  is_native: boolean;
  display_order: number;
}

export interface GlobalPreferencesData {
  languages: LanguageEntry[];
  preferred_program_types: ProgramTypeEnum[];
  relocation_willingness: RelocationEnum | '';
  relocation_conditions: string;
  cultural_interests: string[];
  travel_experience: TravelExperienceEnum | '';
}

export interface PortfolioItem {
  id: string;
  section: PortfolioSectionEnum;
  title: string;
  description: string;
  url: string;
  doi: string;
  venue: string;
  issuer: string;
  co_authors: string;
  date_value: string;
  end_date: string;
  skills_used: string[];
  credential_url: string;
  media_urls: string[];
  display_order: number;
}

export interface ExternalLinkEntry {
  id: string;
  label: string;
  url: string;
  display_order: number;
}

export interface PortfolioData {
  items: PortfolioItem[];
  external_links: ExternalLinkEntry[];
}

export interface OnboardingProgress {
  student_id: string;
  current_step: number;
  step_statuses: Record<string, StepStatus>;
  completion_percentage: number;
  started_at: string | null;
  last_saved_at: string | null;
  completed_at: string | null;
}

export interface OnboardingApiResponse<T = unknown> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
  meta?: {
    request_id: string;
    timestamp: string;
  };
}

export interface GXScoreResult {
  gx_score: number;
  gx_grade: string;
  gx_score_dimensions: Record<string, number>;
  improvement_tips: { category: string; message: string; priority: number }[];
}

export interface StepConfig {
  number: number;
  name: StepName;
  slug: string;
  path: string;
  label: string;
  description: string;
  weight: number;
  required: boolean;
  icon: string;
}
