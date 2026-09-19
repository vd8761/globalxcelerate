import { redirect, notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ApplicationDetailContent } from '@/components/applications/application-detail-content';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('applications')
    .select('opportunities(title)')
    .eq('id', id)
    .single();

  const title = (data as unknown as { opportunities: { title: string } })?.opportunities?.title ?? 'Application';
  return { title: `${title} - Application | GlobX` };
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch application with related data
  const { data: application, error } = await supabase
    .from('applications')
    .select(`
      *,
      opportunities (
        id, title, description, category,
        location_country, location_city, work_mode,
        duration_months, compensation_type, deadline,
        organizations (id, name, logo_url, website)
      ),
      application_documents (*),
      application_status_history (*)
    `)
    .eq('id', id)
    .single();

  if (error || !application) {
    notFound();
  }

  // Verify ownership
  if (application.student_id !== user.id) {
    redirect('/student/applications');
  }

  // Transform to expected shape
  const opp = application.opportunities as unknown as {
    id: string; title: string; description: string | null;
    category: string | null; location_country: string | null;
    location_city: string | null; work_mode: string | null;
    duration_months: number | null; compensation_type: string | null;
    deadline: string | null;
    organizations: { id: string; name: string; logo_url: string | null; website: string | null };
  };

  const initialData = {
    ...application,
    opportunity: {
      id: opp?.id ?? '',
      title: opp?.title ?? '',
      description: opp?.description ?? null,
      category: opp?.category ?? null,
      location_country: opp?.location_country ?? null,
      location_city: opp?.location_city ?? null,
      work_mode: opp?.work_mode ?? null,
      duration_months: opp?.duration_months ?? null,
      compensation_type: opp?.compensation_type ?? null,
      deadline: opp?.deadline ?? null,
      organization: opp?.organizations ?? { id: '', name: 'Unknown', logo_url: null, website: null },
    },
    documents: (application.application_documents as unknown[]) ?? [],
    status_history: ((application.application_status_history as unknown[]) ?? []).sort(
      (a: unknown, b: unknown) => new Date((b as { created_at: string }).created_at).getTime() - new Date((a as { created_at: string }).created_at).getTime()
    ),
    reviewer_notes: [],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ApplicationDetailContent initialData={initialData as never} applicationId={id} />
    </div>
  );
}
