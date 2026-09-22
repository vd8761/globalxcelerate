import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { RoleSelectGrid } from '@/components/auth/role-select-grid';
import { ROLE_DASHBOARDS } from '@/lib/auth/constants';
import type { UserRole } from '@/types/auth';

export const metadata: Metadata = {
  title: 'Choose Your Role | GlobalXcelerate',
  description: 'Select your primary role on GlobalXcelerate.',
};

export default async function RoleSelectPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const existingRole = user.user_metadata?.role as UserRole | undefined;
  if (existingRole) {
    redirect(ROLE_DASHBOARDS[existingRole]);
  }

  // Platform Admin is hidden from the UI entirely
  const isAdminEligible = false;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          How will you use GlobalXcelerate?
        </h1>
        <p className="text-[#64748B] text-sm">
          Choose your primary role. You can always contact support to change this later.
        </p>
      </div>

      <RoleSelectGrid isAdminEligible={isAdminEligible} />
    </div>
  );
}
