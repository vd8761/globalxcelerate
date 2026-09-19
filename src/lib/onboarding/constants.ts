// Onboarding Constants

import type { StepName } from './types';

export const STEP_NAMES: StepName[] = [
  'identity',
  'education',
  'skills',
  'experience',
  'career-goals',
  'global-preferences',
  'portfolio',
  'complete',
];

export const STEP_NUMBERS: Record<string, number> = {
  identity: 1,
  education: 2,
  skills: 3,
  experience: 4,
  'career-goals': 5,
  'global-preferences': 6,
  portfolio: 7,
  complete: 8,
};

export const STEP_WEIGHTS: Record<string, number> = {
  identity: 0.15,
  education: 0.20,
  skills: 0.20,
  experience: 0.15,
  'career-goals': 0.10,
  'global-preferences': 0.10,
  portfolio: 0.10,
};

export const REQUIRED_STEPS = [1, 2, 3];
export const OPTIONAL_STEPS = [4, 5, 6, 7];

export const IDENTITY_FIELD_WEIGHTS: Record<string, number> = {
  first_name: 0.20,
  last_name: 0.20,
  date_of_birth: 0.15,
  nationality: 0.15,
  country_of_residence: 0.10,
  city: 0.10,
  profile_photo_url: 0.05,
  bio: 0.05,
};

export const EDUCATION_THRESHOLDS: Record<number, number> = {
  1: 0.60,
  2: 0.80,
  3: 1.0,
};

export const SKILLS_THRESHOLDS: Record<number, number> = {
  3: 0.50,
  5: 0.70,
  8: 0.85,
  12: 1.0,
};

export const EXPERIENCE_THRESHOLDS: Record<number, number> = {
  1: 0.50,
  2: 0.75,
  3: 1.0,
};

export const PORTFOLIO_THRESHOLDS: Record<number, number> = {
  1: 0.30,
  3: 0.60,
  5: 1.0,
};

export const MAX_SKILLS = 50;
export const MIN_SKILLS = 3;
export const MAX_EDUCATION_ENTRIES = 10;
export const MAX_EXPERIENCE_ENTRIES = 30;
export const MAX_PORTFOLIO_ITEMS = 80;
export const MAX_EXTERNAL_LINKS = 10;
export const MAX_LANGUAGES = 15;

export const AUTOSAVE_DEBOUNCE_MS = 500;
export const TEXTAREA_DEBOUNCE_MS = 2000;
export const LOCALSTORAGE_BACKUP_INTERVAL = 10000;

export const DEGREE_LEVELS = [
  { value: 'high_school', label: 'High School Diploma' },
  { value: 'associate', label: 'Associate Degree' },
  { value: 'bachelor', label: "Bachelor's Degree" },
  { value: 'master', label: "Master's Degree" },
  { value: 'doctorate', label: 'Doctorate / PhD' },
  { value: 'professional', label: 'Professional Degree' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'diploma', label: 'Diploma' },
] as const;

export const EXPERIENCE_TYPES = [
  { value: 'internship', label: 'Internship', icon: 'Briefcase', description: 'Company internship' },
  { value: 'full_time', label: 'Full-time', icon: 'Building2', description: 'Full-time employment' },
  { value: 'part_time', label: 'Part-time', icon: 'Clock', description: 'Part-time work' },
  { value: 'freelance', label: 'Freelance', icon: 'Laptop', description: 'Freelance or contract' },
  { value: 'volunteering', label: 'Volunteering', icon: 'Heart', description: 'Volunteer work' },
  { value: 'research', label: 'Research', icon: 'FlaskConical', description: 'Academic research' },
  { value: 'student_org', label: 'Student Org', icon: 'Users', description: 'Club or organization' },
  { value: 'personal_project', label: 'Project', icon: 'Lightbulb', description: 'Personal project' },
  { value: 'other', label: 'Other', icon: 'MoreHorizontal', description: 'Other experience' },
] as const;

export const PROGRAM_TYPES = [
  { value: 'study_abroad', label: 'Study Abroad', description: 'Academic semester or year abroad' },
  { value: 'exchange', label: 'Exchange Program', description: 'Student exchange with partner university' },
  { value: 'international_internship', label: 'International Internship', description: 'Work experience abroad' },
  { value: 'global_immersion', label: 'Global Immersion', description: 'Short-term cultural immersion' },
  { value: 'research_abroad', label: 'Research Abroad', description: 'International research collaboration' },
  { value: 'volunteer_abroad', label: 'Volunteer Abroad', description: 'International volunteering' },
  { value: 'short_term', label: 'Short-term (<3 months)', description: 'Programs under 3 months' },
  { value: 'long_term', label: 'Long-term (>6 months)', description: 'Programs over 6 months' },
] as const;

export const PROFICIENCY_LABELS: Record<number, string> = {
  1: 'Beginner',
  2: 'Elementary',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};

export const CEFR_LEVELS = [
  { value: 'a1', label: 'A1 - Beginner', description: 'Basic phrases and introductions' },
  { value: 'a2', label: 'A2 - Elementary', description: 'Routine tasks and direct exchanges' },
  { value: 'b1', label: 'B1 - Intermediate', description: 'Deal with most travel situations' },
  { value: 'b2', label: 'B2 - Upper Intermediate', description: 'Complex texts and technical discussions' },
  { value: 'c1', label: 'C1 - Advanced', description: 'Flexible use for academic/professional' },
  { value: 'c2', label: 'C2 - Proficient', description: 'Near-native comprehension and expression' },
  { value: 'native', label: 'Native Speaker', description: 'First language or equivalent' },
] as const;

export const GPA_SCALES = [
  { value: 4.0, label: '4.0 Scale' },
  { value: 5.0, label: '5.0 Scale' },
  { value: 7.0, label: '7.0 Scale' },
  { value: 10.0, label: '10.0 Scale' },
  { value: 100, label: 'Percentage (100)' },
] as const;

export const SKILL_CATEGORIES = [
  { value: 'technical', label: 'Technical', color: 'bg-blue-100 text-blue-700' },
  { value: 'soft_skill', label: 'Soft Skills', color: 'bg-purple-100 text-purple-700' },
  { value: 'language', label: 'Languages', color: 'bg-green-100 text-green-700' },
  { value: 'tool', label: 'Tools', color: 'bg-orange-100 text-orange-700' },
  { value: 'domain', label: 'Domain', color: 'bg-teal-100 text-teal-700' },
] as const;

export const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance & Banking', 'Education', 'Consulting',
  'Energy & Utilities', 'Manufacturing', 'Retail & E-commerce', 'Media & Entertainment',
  'Legal', 'Government', 'Non-profit', 'Real Estate', 'Telecommunications',
  'Automotive', 'Aerospace & Defense', 'Pharmaceuticals', 'Agriculture',
  'Hospitality & Tourism', 'Transportation & Logistics', 'Insurance',
  'Construction', 'Mining', 'Food & Beverage', 'Fashion & Luxury',
  'Sports & Recreation', 'Environmental Services', 'Biotechnology',
  'Cybersecurity', 'Artificial Intelligence', 'Blockchain & Web3',
  'Venture Capital & PE', 'Architecture & Design', 'Market Research',
  'Public Relations', 'Human Resources', 'Supply Chain',
  'Data Analytics', 'Cloud Computing', 'Gaming',
  'Social Impact', 'International Development', 'Marine & Maritime',
  'Space & Satellite', 'Renewable Energy', 'FinTech',
  'EdTech', 'HealthTech', 'CleanTech', 'Other',
];

export const JOB_FUNCTIONS = [
  'Software Engineering', 'Data Science & Analytics', 'Product Management',
  'Marketing', 'Design (UI/UX)', 'Sales', 'Finance & Accounting',
  'Operations', 'Human Resources', 'Research & Development',
  'Consulting', 'Business Development', 'Project Management',
  'Quality Assurance', 'Customer Success', 'Legal',
  'Supply Chain & Logistics', 'Content & Communications',
  'Strategy', 'Information Technology', 'Cybersecurity',
  'Machine Learning & AI', 'DevOps & Infrastructure',
  'Investment Banking', 'Management Consulting',
  'Public Policy', 'Teaching & Education',
  'Healthcare Administration', 'Environmental Science',
  'Mechanical Engineering', 'Electrical Engineering',
  'Civil Engineering', 'Chemical Engineering',
  'Biomedical Engineering', 'Architecture',
  'Journalism', 'Creative Writing', 'Graphic Design',
  'Photography & Film', 'Music & Performing Arts', 'Other',
];

export const COMMON_CURRENCIES = [
  { code: 'USD', label: 'USD ($)', symbol: '$' },
  { code: 'EUR', label: 'EUR (€)', symbol: '€' },
  { code: 'GBP', label: 'GBP (£)', symbol: '£' },
  { code: 'AED', label: 'AED (د.إ)', symbol: 'د.إ' },
  { code: 'SAR', label: 'SAR (﷼)', symbol: '﷼' },
  { code: 'INR', label: 'INR (₹)', symbol: '₹' },
  { code: 'CAD', label: 'CAD (C$)', symbol: 'C$' },
  { code: 'AUD', label: 'AUD (A$)', symbol: 'A$' },
  { code: 'SGD', label: 'SGD (S$)', symbol: 'S$' },
  { code: 'JPY', label: 'JPY (¥)', symbol: '¥' },
  { code: 'CNY', label: 'CNY (¥)', symbol: '¥' },
  { code: 'CHF', label: 'CHF (Fr)', symbol: 'Fr' },
];
