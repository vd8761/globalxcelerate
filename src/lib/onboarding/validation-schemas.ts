import { z } from 'zod';
import type { StepName } from './types';

const nameRegex = /^[\p{L}\s'\-]+$/u;
const phoneRegex = /^\+[1-9]\d{1,14}$/;

function getAgeFromDate(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// Step 1: Identity
export const identitySchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50).regex(nameRegex, 'Only letters, hyphens, apostrophes and spaces allowed'),
  last_name: z.string().min(1, 'Last name is required').max(50).regex(nameRegex, 'Only letters, hyphens, apostrophes and spaces allowed'),
  middle_name: z.string().max(50).regex(nameRegex, 'Invalid characters').optional().or(z.literal('')),
  preferred_name: z.string().max(50).optional().or(z.literal('')),
  date_of_birth: z.string().min(1, 'Date of birth is required').refine((val) => {
    if (!val) return false;
    const age = getAgeFromDate(val);
    return age >= 14 && age <= 80;
  }, 'Must be between 14 and 80 years old'),
  gender: z.string().max(20).optional().or(z.literal('')),
  pronouns: z.string().max(30).optional().or(z.literal('')),
  nationality: z.string().min(2, 'Nationality is required').max(2),
  country_of_residence: z.string().min(2, 'Country is required').max(2),
  city: z.string().min(1, 'City is required').max(100),
  phone_number: z.string().regex(phoneRegex, 'Must be E.164 format (e.g., +1234567890)').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional().or(z.literal('')),
  profile_photo_url: z.string().url().optional().or(z.literal('')),
  profile_photo_thumbnail_url: z.string().url().optional().or(z.literal('')),
});

// Step 2: Education
export const educationEntrySchema = z.object({
  id: z.string().optional(),
  institution_name: z.string().min(2, 'Institution name required').max(200),
  institution_id: z.string().nullable().optional(),
  degree_level: z.enum(['high_school', 'associate', 'bachelor', 'master', 'doctorate', 'professional', 'certificate', 'diploma'], { required_error: 'Degree level is required' }),
  field_of_study: z.string().min(2, 'Field of study required').max(100),
  field_of_study_id: z.string().nullable().optional(),
  gpa_value: z.number().min(0).max(100).nullable().optional(),
  gpa_scale: z.number().nullable().optional(),
  gpa_normalized: z.number().nullable().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().nullable().optional(),
  is_current: z.boolean().default(false),
  description: z.string().max(1000).optional().or(z.literal('')),
  honors: z.string().max(200).optional().or(z.literal('')),
  thesis_title: z.string().max(300).optional().or(z.literal('')),
  display_order: z.number().default(0),
}).refine((data) => {
  if (data.is_current && data.end_date) return false;
  return true;
}, { message: 'End date must be empty if currently studying', path: ['end_date'] })
.refine((data) => {
  if (data.end_date && data.start_date && new Date(data.end_date) < new Date(data.start_date)) return false;
  return true;
}, { message: 'End date must be after start date', path: ['end_date'] });

export const educationStepSchema = z.object({
  entries: z.array(educationEntrySchema).min(1, 'At least one education entry is required'),
});

// Step 3: Skills
export const skillEntrySchema = z.object({
  id: z.string().optional(),
  skill_id: z.string().nullable().optional(),
  skill_name: z.string().min(2, 'Skill name required').max(60),
  category: z.enum(['technical', 'soft_skill', 'language', 'tool', 'domain']),
  proficiency: z.number().int().min(1).max(5),
  is_custom: z.boolean().default(false),
  is_verified: z.boolean().default(true),
  source: z.string().default('catalog'),
  display_order: z.number().default(0),
});

export const skillsStepSchema = z.object({
  skills: z.array(skillEntrySchema).min(3, 'Minimum 3 skills required').max(50, 'Maximum 50 skills allowed'),
});

// Step 4: Experience
export const experienceEntrySchema = z.object({
  id: z.string().optional(),
  type: z.enum(['internship', 'full_time', 'part_time', 'freelance', 'volunteering', 'research', 'student_org', 'personal_project', 'other']),
  title: z.string().min(2, 'Title is required').max(100),
  organization_name: z.string().min(2, 'Organization name is required').max(150),
  description: z.string().max(2000).optional().or(z.literal('')),
  location: z.string().max(150).optional().or(z.literal('')),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().nullable().optional(),
  is_current: z.boolean().default(false),
  skills_used: z.array(z.string()).optional().default([]),
  outcomes: z.array(z.string().max(200)).max(10).optional().default([]),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  display_order: z.number().default(0),
}).refine((data) => {
  if (data.is_current && data.end_date) return false;
  return true;
}, { message: 'End date must be empty if currently working here', path: ['end_date'] })
.refine((data) => {
  if (data.end_date && data.start_date && new Date(data.end_date) < new Date(data.start_date)) return false;
  return true;
}, { message: 'End date must be after start date', path: ['end_date'] });

export const experienceStepSchema = z.object({
  entries: z.array(experienceEntrySchema),
});

// Step 5: Career Goals
export const careerGoalsSchema = z.object({
  preferred_industries: z.array(z.string().max(100)).max(5).optional().default([]),
  preferred_functions: z.array(z.string().max(100)).max(5).optional().default([]),
  preferred_countries: z.array(z.string().min(2).max(2)).max(10).optional().default([]),
  work_mode: z.enum(['remote', 'hybrid', 'on_site', 'no_preference']).optional().or(z.literal('')),
  salary_min: z.number().int().min(0).nullable().optional(),
  salary_max: z.number().int().min(0).nullable().optional(),
  salary_currency: z.string().max(3).optional().or(z.literal('')),
  salary_period: z.enum(['hourly', 'monthly', 'annual']).optional().or(z.literal('')),
  availability_date: z.string().optional().or(z.literal('')),
  mobility_readiness: z.number().int().min(1).max(5).nullable().optional(),
  visa_sponsorship_needed: z.boolean().nullable().optional(),
  visa_details: z.string().max(200).optional().or(z.literal('')),
}).refine((data) => {
  if (data.salary_min && data.salary_max && data.salary_max < data.salary_min) return false;
  return true;
}, { message: 'Maximum salary must be greater than minimum', path: ['salary_max'] });

// Step 6: Global Preferences
export const languageEntrySchema = z.object({
  id: z.string().optional(),
  language_code: z.string().min(2).max(10),
  language_name: z.string().min(2).max(60),
  proficiency: z.enum(['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'native']),
  is_native: z.boolean().default(false),
  display_order: z.number().default(0),
});

export const globalPreferencesSchema = z.object({
  languages: z.array(languageEntrySchema).max(15).optional().default([]),
  preferred_program_types: z.array(z.enum(['study_abroad', 'exchange', 'international_internship', 'global_immersion', 'research_abroad', 'volunteer_abroad', 'short_term', 'long_term'])).optional().default([]),
  relocation_willingness: z.enum(['yes', 'yes_with_conditions', 'no', 'undecided']).optional().or(z.literal('')),
  relocation_conditions: z.string().max(500).optional().or(z.literal('')),
  cultural_interests: z.array(z.string().min(2).max(50)).max(10).optional().default([]),
  travel_experience: z.enum(['none', '1_2_countries', '3_5_countries', '6_10_countries', '10_plus_countries']).optional().or(z.literal('')),
});

// Step 7: Portfolio
export const portfolioItemSchema = z.object({
  id: z.string().optional(),
  section: z.enum(['project', 'publication', 'achievement']),
  title: z.string().min(2, 'Title is required').max(300),
  description: z.string().max(2000).optional().or(z.literal('')),
  url: z.string().url().optional().or(z.literal('')),
  doi: z.string().max(100).optional().or(z.literal('')),
  venue: z.string().max(200).optional().or(z.literal('')),
  issuer: z.string().max(150).optional().or(z.literal('')),
  co_authors: z.string().max(500).optional().or(z.literal('')),
  date_value: z.string().optional().or(z.literal('')),
  end_date: z.string().optional().or(z.literal('')),
  skills_used: z.array(z.string()).optional().default([]),
  credential_url: z.string().url().optional().or(z.literal('')),
  media_urls: z.array(z.string().url()).max(5).optional().default([]),
  display_order: z.number().default(0),
});

export const externalLinkSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(2, 'Label is required').max(50),
  url: z.string().url('Must be a valid URL'),
  display_order: z.number().default(0),
});

export const portfolioStepSchema = z.object({
  items: z.array(portfolioItemSchema).optional().default([]),
  external_links: z.array(externalLinkSchema).max(10).optional().default([]),
});

// Schema Resolver
const schemaMap: Record<string, z.ZodSchema> = {
  identity: identitySchema,
  education: educationStepSchema,
  skills: skillsStepSchema,
  experience: experienceStepSchema,
  'career-goals': careerGoalsSchema,
  'global-preferences': globalPreferencesSchema,
  portfolio: portfolioStepSchema,
};

export function getSchemaForStep(stepName: string): z.ZodSchema | undefined {
  return schemaMap[stepName];
}

export function validateStepData(stepName: string, data: unknown) {
  const schema = getSchemaForStep(stepName);
  if (!schema) return { success: true, data, error: null };
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data, error: null };
  }
  return {
    success: false,
    data: null,
    error: result.error.flatten(),
  };
}
