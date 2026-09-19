'use client';

import { useEffect, useState, useRef } from 'react';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { useStepNavigation } from '@/hooks/onboarding/useStepNavigation';
import { useCompletionPercentage } from '@/hooks/onboarding/useCompletionPercentage';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { ConfettiAnimation } from '@/components/onboarding/complete/ConfettiAnimation';
import { GXScoreGauge } from '@/components/onboarding/complete/GXScoreGauge';
import { ProfileSummaryCard } from '@/components/onboarding/complete/ProfileSummaryCard';
import { CompletionBreakdown } from '@/components/onboarding/complete/CompletionBreakdown';
import { ImprovementTips } from '@/components/onboarding/complete/ImprovementTips';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Share2 } from 'lucide-react';
import type { GXScoreResult } from '@/lib/onboarding/types';

export default function CompletePage() {
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);
  const stepStatuses = useOnboardingStore((s) => s.stepStatuses);
  const { goBack } = useStepNavigation(8);
  const { overall, perStep } = useCompletionPercentage();
  const router = useRouter();

  const [showConfetti, setShowConfetti] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [scoreResult, setScoreResult] = useState<GXScoreResult | null>(null);
  const [isLoadingScore, setIsLoadingScore] = useState(true);
  const completedRef = useRef(false);

  useEffect(() => { setCurrentStep(8); }, [setCurrentStep]);

  // Check mandatory steps
  const mandatoryComplete = ['identity', 'education', 'skills'].every(
    (s) => stepStatuses[s] === 'completed'
  );

  useEffect(() => {
    if (!mandatoryComplete) return;
    if (completedRef.current) return;
    completedRef.current = true;

    // Show confetti on first visit
    const key = 'gx-onboarding-confetti-shown';
    if (!sessionStorage.getItem(key)) {
      setShowConfetti(true);
      sessionStorage.setItem(key, 'true');
      setTimeout(() => setShowConfetti(false), 4000);
    }

    // Calculate score
    const calculateScore = async () => {
      try {
        const res = await fetch('/api/v1/students/onboarding/complete', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          setScoreResult(data.data);
        } else {
          // Use fallback score from completion
          setScoreResult({
            gx_score: overall,
            gx_grade: overall >= 75 ? 'Strong' : overall >= 50 ? 'Developing' : 'Emerging',
            gx_score_dimensions: {},
            improvement_tips: [],
          });
        }
      } catch {
        setScoreResult({
          gx_score: overall,
          gx_grade: 'Developing',
          gx_score_dimensions: {},
          improvement_tips: [],
        });
      } finally {
        setIsLoadingScore(false);
      }
    };
    calculateScore();
  }, [mandatoryComplete, overall]);

  const handleComplete = async () => {
    setIsCompleting(true);
    // Redirect to dashboard
    router.push('/student/dashboard');
  };

  if (!mandatoryComplete) {
    return (
      <OnboardingShell title="Profile Complete" subtitle="Almost there!">
        <div className="text-center py-8">
          <p className="text-slate-600 mb-4">Please complete all mandatory steps first:</p>
          <ul className="space-y-2 text-sm">
            {['identity', 'education', 'skills'].map((s) => (
              <li key={s} className={stepStatuses[s] === 'completed' ? 'text-emerald-600' : 'text-red-500'}>
                {stepStatuses[s] === 'completed' ? '✓' : '✗'} {s.charAt(0).toUpperCase() + s.slice(1)}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={goBack}
            className="mt-6 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700"
          >
            Go Back
          </button>
        </div>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell title="Profile Complete! 🎉" subtitle="Your GlobalXcelerate profile is ready">
      {showConfetti && <ConfettiAnimation />}

      <div className="space-y-8">
        {/* GX Score */}
        <div className="flex justify-center">
          <GXScoreGauge
            score={scoreResult?.gx_score ?? 0}
            grade={scoreResult?.gx_grade ?? ''}
            isLoading={isLoadingScore}
          />
        </div>

        {/* Profile Summary */}
        <ProfileSummaryCard />

        {/* Completion Breakdown */}
        <CompletionBreakdown perStepCompletion={perStep} />

        {/* Improvement Tips */}
        {scoreResult?.improvement_tips && scoreResult.improvement_tips.length > 0 && (
          <ImprovementTips tips={scoreResult.improvement_tips} />
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={handleComplete}
            disabled={isCompleting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isCompleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 text-sm font-medium hover:text-slate-800"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </OnboardingShell>
  );
}
