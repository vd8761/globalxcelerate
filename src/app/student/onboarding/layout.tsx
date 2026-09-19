import { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complete Your Profile | GlobalXcelerate',
  description: 'Set up your GlobalXcelerate profile to unlock opportunities worldwide.',
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Minimal top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[hsl(174,60%,40%)] to-[hsl(187,96%,42%)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">GX</span>
            </div>
            <span className="font-display font-bold text-lg text-slate-900 hidden sm:inline">GlobalXcelerate</span>
          </div>
          <a
            href="/student/dashboard"
            className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            Save & Exit
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-10">
        <Suspense
          fallback={
            <div className="animate-pulse space-y-6">
              <div className="h-3 bg-slate-200 rounded-full w-full" />
              <div className="h-64 bg-white rounded-xl border border-slate-100" />
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
    </div>
  );
}
