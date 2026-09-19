import { createAIClient } from '../shared/ai-client';
import { DIMENSION_DEFINITIONS } from '../constants/gx-dimensions';
import type { GXScoreRecommendation, GXDimension } from '../types';

/**
 * Generate improvement recommendations based on score dimensions.
 */
export async function generateRecommendations(
  dimensionScores: Record<string, number>,
  profile: Record<string, unknown>
): Promise<GXScoreRecommendation[]> {
  // Find weakest dimensions
  const sorted = Object.entries(dimensionScores)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 5); // Focus on 5 weakest

  const recommendations: GXScoreRecommendation[] = [];
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

  // Rule-based recommendations (always available)
  const RULE_BASED: Record<string, { title: string; description: string; action_url: string | null }> = {
    international_exposure: {
      title: 'Gain international experience',
      description: 'Apply for exchange programs or international internships to boost your global exposure.',
      action_url: '/student/marketplace?category=exchange',
    },
    technical_skills: {
      title: 'Develop in-demand technical skills',
      description: 'Focus on high-demand technologies like cloud computing, AI/ML, or data science.',
      action_url: null,
    },
    certifications: {
      title: 'Earn a professional certification',
      description: 'Industry certifications from AWS, Google, or Microsoft significantly boost your profile.',
      action_url: null,
    },
    leadership: {
      title: 'Take on leadership responsibilities',
      description: 'Lead a project team, join student government, or start a club to build leadership evidence.',
      action_url: null,
    },
    internship_experience: {
      title: 'Complete an industry internship',
      description: 'Hands-on professional experience is one of the strongest signals to employers.',
      action_url: '/student/marketplace?category=internship',
    },
    project_experience: {
      title: 'Build diverse projects',
      description: 'Create projects across different domains to demonstrate versatility and initiative.',
      action_url: null,
    },
    portfolio_quality: {
      title: 'Enhance your portfolio',
      description: 'Add detailed project write-ups, include live demos, and document your process.',
      action_url: '/student/onboarding/portfolio',
    },
    communication: {
      title: 'Strengthen communication skills',
      description: 'Improve language proficiency, write blog posts, or practice public speaking.',
      action_url: null,
    },
    interview_readiness: {
      title: 'Practice interview skills',
      description: 'Complete mock interviews and behavioral assessments to boost confidence.',
      action_url: null,
    },
    languages: {
      title: 'Learn a new language',
      description: 'Adding a language — especially a high-demand one — enhances your global mobility.',
      action_url: null,
    },
    industry_skills: {
      title: 'Align skills with market demand',
      description: 'Research industry trends and develop skills in emerging fields.',
      action_url: null,
    },
    academic_readiness: {
      title: 'Strengthen academic foundations',
      description: 'Focus on improving GPA or pursuing advanced coursework in your field.',
      action_url: null,
    },
  };

  for (let i = 0; i < sorted.length && recommendations.length < 5; i++) {
    const [dimension, score] = sorted[i];
    const rule = RULE_BASED[dimension];
    if (!rule) continue;

    const estimatedImpact = Math.max(3, Math.round((100 - score) * 0.15));
    const priority = score < 30 ? 'high' : score < 50 ? 'medium' : 'low';

    recommendations.push({
      id: crypto.randomUUID(),
      student_id: (profile.user_id as string) || '',
      dimension: dimension as GXDimension,
      title: rule.title,
      description: rule.description,
      action_url: rule.action_url,
      priority,
      estimated_impact: estimatedImpact,
      is_completed: false,
      is_dismissed: false,
      completed_at: null,
      dismissed_at: null,
      expires_at: expiresAt,
      created_at: now,
    });
  }

  return recommendations;
}
