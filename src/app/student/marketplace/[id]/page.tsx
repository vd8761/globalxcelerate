import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DetailHeader } from '@/components/marketplace/detail/detail-header';
import { DetailContentTabs } from '@/components/marketplace/detail/detail-content-tabs';
import { DetailSidebar } from '@/components/marketplace/detail/detail-sidebar';
import { RelatedOpportunities } from '@/components/marketplace/detail/related-opportunities';
import { ExpiredBanner } from '@/components/marketplace/detail/expired-banner';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('opportunities')
    .select('title, organizations(name)')
    .eq('id', id)
    .single();

  if (!data) return { title: 'Opportunity Not Found' };
  return {
    title: `${data.title} | GlobalXcelerate`,
    description: `Apply to ${data.title} at ${(data as any).organizations?.name}`,
  };
}

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: opportunity, error } = await supabase
    .from('opportunities')
    .select(`
      *,
      organizations(id, name, logo_url, industry, size, location_country, location_city, website, description),
      opportunity_skills(id, importance, min_proficiency, skill_id, skills_master(id, name))
    `)
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (error || !opportunity) {
    notFound();
  }

  // Get related
  const { data: related } = await supabase
    .from('opportunities')
    .select(`
      id, title, slug, category, location_country, work_mode,
      compensation_type, application_deadline,
      organizations(id, name, logo_url)
    `)
    .eq('status', 'published')
    .eq('category', opportunity.category)
    .neq('id', id)
    .limit(3);

  const isExpired = opportunity.application_deadline
    ? new Date(opportunity.application_deadline) < new Date()
    : false;

  const skills = (opportunity.opportunity_skills || []).map((os: any) => ({
    id: os.skills_master?.id || os.skill_id,
    name: os.skills_master?.name || 'Unknown',
    importance: os.importance,
    min_proficiency: os.min_proficiency,
  }));

  return (
    <div className="min-h-screen">
      {isExpired && <ExpiredBanner />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-4" aria-label="Breadcrumb">
          <a href="/student/marketplace" className="hover:text-slate-700 transition-colors">Marketplace</a>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">{opportunity.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Left column */}
          <div className="space-y-6">
            <DetailHeader
              title={opportunity.title}
              organization={opportunity.organizations as any}
              publishedAt={opportunity.published_at}
              location_country={opportunity.location_country}
              location_city={opportunity.location_city}
              work_mode={opportunity.work_mode}
              duration_value={opportunity.duration_value}
              duration_unit={opportunity.duration_unit}
              category={opportunity.category}
            />

            <DetailContentTabs
              description={opportunity.description}
              requirements={opportunity.requirements as any}
              benefits={opportunity.benefits as any}
              responsibilities={opportunity.responsibilities as any}
              application_fields={opportunity.application_fields as any}
              skills={skills}
            />
          </div>

          {/* Right column */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Suspense fallback={<div className="space-y-4"><div className="h-40 bg-slate-100 rounded-xl animate-pulse" /><div className="h-32 bg-slate-100 rounded-xl animate-pulse" /></div>}>
              <DetailSidebar
                opportunityId={opportunity.id}
                opportunity={opportunity as any}
                organization={opportunity.organizations as any}
                isExpired={isExpired}
                skills={skills}
              />
            </Suspense>
          </div>
        </div>

        {/* Related opportunities */}
        {related && related.length > 0 && (
          <div className="mt-12">
            <RelatedOpportunities opportunities={related as any} />
          </div>
        )}
      </div>
    </div>
  );
}
