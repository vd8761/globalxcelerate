import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ApplicationList } from '@/components/applications/application-list';

export const metadata = {
  title: 'My Applications | GlobX',
  description: 'Track and manage your opportunity applications',
};

export default async function ApplicationsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Applications</h1>
        <p className="text-sm text-slate-500 mt-1">Track your progress and manage applications</p>
      </div>
      <Suspense fallback={<ApplicationListSkeleton />}>
        <ApplicationList />
      </Suspense>
    </div>
  );
}

function ApplicationListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-full rounded-lg bg-slate-100 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[140px] rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
