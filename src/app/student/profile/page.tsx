import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ProfileContent } from './profile-content';

export const metadata = {
  title: 'My Profile | GlobalXcelerate',
  description: 'View and manage your student profile',
};

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    redirect('/student/onboarding');
  }

  return (
    <ProfileContent
      profile={profile}
      email={user.email || ''}
    />
  );
}
