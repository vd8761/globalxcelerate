'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTimeOfDay } from '@/lib/dashboard/constants';
import type { GreetingTimeOfDay } from '@/types/dashboard';
import { LogOut, User, ChevronDown } from 'lucide-react';

interface GreetingHeaderProps {
  firstName: string;
  profilePhotoUrl?: string | null;
}

const GREETINGS: Record<GreetingTimeOfDay, string> = {
  morning: 'Good morning',
  afternoon: 'Good afternoon',
  evening: 'Good evening',
};

export function GreetingHeader({ firstName, profilePhotoUrl }: GreetingHeaderProps) {
  const router = useRouter();
  const [timeOfDay, setTimeOfDay] = useState<GreetingTimeOfDay>('morning');
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeOfDay(getTimeOfDay());
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = firstName ? firstName.charAt(0).toUpperCase() : 'S';
  const greeting = mounted ? GREETINGS[timeOfDay] : 'Welcome back';

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
    <div className="col-span-full flex items-center justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          {greeting}, {firstName || 'there'}! 👋
        </h1>
        <p className="text-base text-gray-500 mt-1">
          Your global career journey starts here.
        </p>
      </div>
      <div className="hidden sm:block relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Profile menu"
          data-testid="profile-menu-button"
        >
          {profilePhotoUrl ? (
            <img
              src={profilePhotoUrl}
              alt={`${firstName}'s avatar`}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
              {initials}
            </div>
          )}
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50" data-testid="profile-dropdown">
            <Link
              href="/student/profile"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setDropdownOpen(false)}
              data-testid="profile-link"
            >
              <User className="w-4 h-4" />
              My Profile
            </Link>
            <hr className="my-1 border-gray-100" />
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              data-testid="logout-button"
            >
              <LogOut className="w-4 h-4" />
              {loggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
