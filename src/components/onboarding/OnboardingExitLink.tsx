'use client';

import { useOnboardingStore } from '@/stores/onboarding-store';
import Link from 'next/link';

export function OnboardingExitLink() {
  const { stepStatuses } = useOnboardingStore();
  const isEditing = stepStatuses['complete'] === 'completed';
  
  return (
    <Link
      href="/student/dashboard"
      className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
    >
      {isEditing ? 'Return to Dashboard' : 'Save & Exit'}
    </Link>
  );
}
