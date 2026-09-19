export type OpportunityCategory =
  | 'internships'
  | 'global_immersion'
  | 'exchange'
  | 'industry_projects'
  | 'research'
  | 'scholarships'
  | 'graduate_careers';

export type WorkMode = 'on_site' | 'remote' | 'hybrid';

export type DurationUnit = 'weeks' | 'months' | 'years';

export type CompensationType = 'paid' | 'stipend' | 'unpaid' | 'scholarship';

export type CompensationPeriod = 'hourly' | 'weekly' | 'monthly' | 'annual' | 'total';

export type OpportunityStatus = 'draft' | 'pending_review' | 'published' | 'closed' | 'archived';

export type SkillImportance = 'required' | 'preferred' | 'nice_to_have';

export interface OpportunitySkill {
  id: string;
  name: string;
  importance: SkillImportance;
  min_proficiency: number;
}

export interface Organization {
  id: string;
  name: string;
  logo_url: string | null;
  industry?: string;
  size?: string;
  location_country?: string;
  location_city?: string;
  description?: string;
  opportunities_count?: number;
}

export interface OpportunityListItem {
  id: string;
  title: string;
  slug: string;
  category: OpportunityCategory;
  organization: Organization;
  location_country: string;
  location_city: string | null;
  work_mode: WorkMode;
  duration_value: number | null;
  duration_unit: DurationUnit | null;
  compensation_type: CompensationType | null;
  compensation_min: number | null;
  compensation_max: number | null;
  compensation_currency: string | null;
  compensation_period: CompensationPeriod | null;
  start_date: string | null;
  application_deadline: string | null;
  visa_support: boolean;
  industry: string | null;
  skills: OpportunitySkill[];
  match_score: number | null;
  is_saved: boolean;
  spots_available: number | null;
  spots_filled: number;
  featured: boolean;
  published_at: string | null;
}

export interface OpportunityRequirements {
  min_gpa?: number;
  degree_levels?: string[];
  fields_of_study?: string[];
  required_skills?: string[];
  preferred_skills?: string[];
  min_experience_months?: number;
  nationality_restrictions?: string[];
  language_requirements?: string[];
  other?: string[];
}

export interface Benefit {
  type: string;
  description: string;
}

export interface ApplicationField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'select';
  required: boolean;
  max_length?: number;
  options?: string[];
}

export interface RelatedOpportunity {
  id: string;
  title: string;
  slug: string;
  category: OpportunityCategory;
  organization: Pick<Organization, 'id' | 'name' | 'logo_url'>;
  location_country: string;
  work_mode: WorkMode;
  compensation_type: CompensationType | null;
  match_score: number | null;
  application_deadline: string | null;
}

export interface OpportunityDetail extends OpportunityListItem {
  description: string;
  description_plain: string | null;
  requirements: OpportunityRequirements;
  benefits: Benefit[];
  responsibilities: string[];
  application_fields: ApplicationField[];
  end_date: string | null;
  match_analysis: import('./match-score').MatchAnalysis | null;
  eligibility: import('./match-score').EligibilityCheck | null;
  has_applied: boolean;
  related_opportunities: RelatedOpportunity[];
  view_count: number;
}

export type CategoryCounts = Record<'all' | OpportunityCategory, number>;
