import type { DimensionDefinition, GXDimension } from '../types';

export const DIMENSION_DEFINITIONS: DimensionDefinition[] = [
  { id: 'academic_readiness', label: 'Academic Readiness', description: 'GPA, degree level, and academic achievements', icon: 'GraduationCap' },
  { id: 'technical_skills', label: 'Technical Skills', description: 'Proficiency in relevant technical skills and tools', icon: 'Code2' },
  { id: 'communication', label: 'Communication', description: 'Language proficiency, writing, and presentation skills', icon: 'MessageSquare' },
  { id: 'leadership', label: 'Leadership', description: 'Leadership roles, team management, and initiative', icon: 'Users' },
  { id: 'project_experience', label: 'Project Experience', description: 'Complexity and variety of completed projects', icon: 'FolderKanban' },
  { id: 'internship_experience', label: 'Internship Experience', description: 'Duration and relevance of internship placements', icon: 'Briefcase' },
  { id: 'international_exposure', label: 'International Exposure', description: 'Cross-cultural experiences and global engagement', icon: 'Globe' },
  { id: 'certifications', label: 'Certifications', description: 'Professional certifications and credentials', icon: 'Award' },
  { id: 'portfolio_quality', label: 'Portfolio Quality', description: 'Quality and diversity of portfolio items', icon: 'Palette' },
  { id: 'interview_readiness', label: 'Interview Readiness', description: 'Preparation for professional interviews', icon: 'Video' },
  { id: 'languages', label: 'Languages', description: 'Number and proficiency of languages spoken', icon: 'Languages' },
  { id: 'industry_skills', label: 'Industry Skills', description: 'Alignment with high-demand industry skills', icon: 'TrendingUp' },
];

export const DIMENSION_WEIGHTS: Record<GXDimension, number> = {
  academic_readiness: 1 / 12,
  technical_skills: 1 / 12,
  communication: 1 / 12,
  leadership: 1 / 12,
  project_experience: 1 / 12,
  internship_experience: 1 / 12,
  international_exposure: 1 / 12,
  certifications: 1 / 12,
  portfolio_quality: 1 / 12,
  interview_readiness: 1 / 12,
  languages: 1 / 12,
  industry_skills: 1 / 12,
};
