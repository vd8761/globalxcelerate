'use client';

import { useState } from 'react';
import { GXScoreHeader } from './gx-score-header';
import { GXScoreRadarChart } from './gx-score-radar-chart';
import { GXScoreDimensionGrid } from './gx-score-dimension-grid';
import { GXScoreHistoryChart } from './gx-score-history-chart';
import { GXScoreRecommendations } from './gx-score-recommendations';
import type { GXGradeBracket, GXScoreRecommendation } from '@/lib/ai/types';

const MOCK_DIMENSIONS: Record<string, number> = {
  academic_readiness: 78,
  technical_skills: 65,
  communication: 72,
  leadership: 45,
  project_experience: 58,
  internship_experience: 40,
  international_exposure: 30,
  certifications: 55,
  portfolio_quality: 62,
  interview_readiness: 48,
  languages: 70,
  industry_skills: 52,
};

const MOCK_HISTORY = [
  { date: '2024-01-01', score: 42 },
  { date: '2024-01-15', score: 45 },
  { date: '2024-02-01', score: 48 },
  { date: '2024-02-15', score: 50 },
  { date: '2024-03-01', score: 52 },
  { date: '2024-03-15', score: 54 },
  { date: '2024-04-01', score: 55 },
  { date: '2024-04-15', score: 56 },
  { date: '2024-05-01', score: 56.25 },
];

const MOCK_RECOMMENDATIONS: GXScoreRecommendation[] = [
  {
    id: '1',
    student_id: 's1',
    dimension: 'international_exposure',
    title: 'Apply for a cultural exchange program',
    description: 'Your international exposure is your weakest dimension. Consider applying to exchange programs in the marketplace to gain cross-cultural experience.',
    action_url: '/student/marketplace?category=exchange',
    priority: 'high',
    estimated_impact: 12,
    is_completed: false,
    is_dismissed: false,
    completed_at: null,
    dismissed_at: null,
    expires_at: '2025-06-01',
    created_at: '2024-05-01',
  },
  {
    id: '2',
    student_id: 's1',
    dimension: 'internship_experience',
    title: 'Complete an industry internship',
    description: 'Gaining hands-on internship experience in your target industry would significantly boost your score and open doors to full-time opportunities.',
    action_url: '/student/marketplace?category=internship',
    priority: 'high',
    estimated_impact: 10,
    is_completed: false,
    is_dismissed: false,
    completed_at: null,
    dismissed_at: null,
    expires_at: '2025-06-01',
    created_at: '2024-05-01',
  },
  {
    id: '3',
    student_id: 's1',
    dimension: 'leadership',
    title: 'Take on a leadership role in a student org',
    description: 'Leading a student club or project team will strengthen your leadership dimension and demonstrate initiative to employers.',
    action_url: null,
    priority: 'medium',
    estimated_impact: 8,
    is_completed: false,
    is_dismissed: false,
    completed_at: null,
    dismissed_at: null,
    expires_at: '2025-06-01',
    created_at: '2024-05-01',
  },
  {
    id: '4',
    student_id: 's1',
    dimension: 'certifications',
    title: 'Earn a cloud computing certification',
    description: 'An AWS or Google Cloud certification would boost both your certifications and industry skills dimensions simultaneously.',
    action_url: null,
    priority: 'medium',
    estimated_impact: 7,
    is_completed: false,
    is_dismissed: false,
    completed_at: null,
    dismissed_at: null,
    expires_at: '2025-06-01',
    created_at: '2024-05-01',
  },
];

export function GXScoreDashboard() {
  const compositeScore = 56.25;
  const gradeBracket: GXGradeBracket = 'developing';
  const dailyChange = 1.5;

  const [recommendations, setRecommendations] = useState(MOCK_RECOMMENDATIONS);

  const handleComplete = (id: string) => {
    setRecommendations(prev => prev.filter(r => r.id !== id));
  };

  const handleDismiss = (id: string) => {
    setRecommendations(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <GXScoreHeader
        compositeScore={compositeScore}
        gradeBracket={gradeBracket}
        dailyChange={dailyChange}
      />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="space-y-6">
          <GXScoreRadarChart dimensions={MOCK_DIMENSIONS} />
          <GXScoreHistoryChart history={MOCK_HISTORY} />
        </div>

        <div className="space-y-6">
          <GXScoreDimensionGrid dimensions={MOCK_DIMENSIONS} />
          <GXScoreRecommendations
            recommendations={recommendations}
            onComplete={handleComplete}
            onDismiss={handleDismiss}
          />
        </div>
      </div>
    </div>
  );
}
