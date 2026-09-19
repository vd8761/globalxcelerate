import type { Metadata } from 'next';
import { GXScoreDashboard } from '@/components/gx-score/gx-score-dashboard';

export const metadata: Metadata = {
  title: 'GX Score - GlobalXcelerate',
  description: 'Track your Global Employability Score across 12 dimensions',
};

export default function GXScorePage() {
  return <GXScoreDashboard />;
}
