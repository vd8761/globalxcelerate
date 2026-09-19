'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { LogOut, ArrowLeft, Mail, MapPin, Calendar, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProfileContentProps {
  profile: {
    first_name: string | null;
    last_name: string | null;
    username: string | null;
    date_of_birth: string | null;
    nationality: string | null;
    current_country: string | null;
    current_city: string | null;
    profile_photo_url: string | null;
    bio: string | null;
    profile_completion: number;
    gx_score: number | null;
  };
  email: string;
}

export function ProfileContent({ profile, email }: ProfileContentProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const initials = profile.first_name ? profile.first_name.charAt(0).toUpperCase() : 'S';
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Student';

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
      }
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <Card className="border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-gray-900">My Profile</CardTitle>
              <Button
                onClick={handleLogout}
                disabled={loggingOut}
                variant="destructive"
                size="sm"
                data-testid="profile-logout-button"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {loggingOut ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              {profile.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt={`${fullName}'s avatar`}
                  className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl">
                  {initials}
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{fullName}</h2>
                {profile.username && (
                  <p className="text-gray-500 text-sm">@{profile.username}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{email}</span>
              </div>
              {profile.current_country && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {[profile.current_city, profile.current_country].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              {profile.nationality && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{profile.nationality}</span>
                </div>
              )}
              {profile.date_of_birth && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{profile.date_of_birth}</span>
                </div>
              )}
            </div>

            {profile.bio && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Bio</h3>
                <p className="text-gray-700 text-sm">{profile.bio}</p>
              </div>
            )}

            <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
              <div>
                <p className="text-sm text-gray-500">Profile Completion</p>
                <p className="text-lg font-semibold text-gray-900">{profile.profile_completion}%</p>
              </div>
              {profile.gx_score !== null && (
                <div>
                  <p className="text-sm text-gray-500">GX Score</p>
                  <p className="text-lg font-semibold text-gray-900">{profile.gx_score}</p>
                </div>
              )}
            </div>

            <div className="pt-4">
              <Link
                href="/student/onboarding"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Edit Profile
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
