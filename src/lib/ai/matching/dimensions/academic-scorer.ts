import type { DimensionScore } from '../types';

interface AcademicProfile {
  gpa?: number;
  gpa_scale?: number;
  field_of_study?: string;
  degree_level?: string;
}

interface AcademicRequirements {
  gpa_min?: number;
  field_of_study?: string;
  related_fields?: string[];
}

/**
 * Calculate academic dimension score based on GPA threshold and field match.
 */
export function calculateAcademicScore(
  studentAcademics: AcademicProfile,
  requirements: AcademicRequirements
): DimensionScore {
  let score = 40; // Default if GPA not provided

  // GPA scoring
  if (studentAcademics.gpa != null && requirements.gpa_min != null) {
    const scale = studentAcademics.gpa_scale || 4.0;
    const normalizedGPA = (studentAcademics.gpa / scale) * 4.0;
    const normalizedReq = (requirements.gpa_min / scale) * 4.0;
    const diff = normalizedGPA - normalizedReq;

    if (diff >= 1.0) score = 100;
    else if (diff >= 0.5) score = 85;
    else if (diff >= 0) score = 70;
    else if (diff >= -0.5) score = 40;
    else score = 20;
  } else if (studentAcademics.gpa != null) {
    // No requirement, score based on raw GPA quality
    const scale = studentAcademics.gpa_scale || 4.0;
    score = Math.round((studentAcademics.gpa / scale) * 80);
  }

  // Field of study match bonus
  if (studentAcademics.field_of_study && requirements.field_of_study) {
    const studentField = studentAcademics.field_of_study.toLowerCase();
    const reqField = requirements.field_of_study.toLowerCase();

    if (studentField === reqField || studentField.includes(reqField) || reqField.includes(studentField)) {
      score += 20; // Exact match
    } else if (requirements.related_fields?.some(f => studentField.includes(f.toLowerCase()))) {
      score += 10; // Related field
    }
  }

  return { score: Math.min(100, Math.max(0, score)), weight: 0, weighted_score: 0, label: 'Academic' };
}
