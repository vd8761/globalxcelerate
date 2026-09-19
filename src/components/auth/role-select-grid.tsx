'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Building2,
  School,
  Globe,
  Shield,
  Check,
  Loader2,
} from 'lucide-react';
import type { UserRole } from '@/types/auth';

interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const roles: RoleOption[] = [
  {
    id: 'student',
    title: 'Student / Job Seeker',
    description: 'Explore global internships, exchanges, and career opportunities tailored to your profile.',
    icon: <GraduationCap className="w-6 h-6" />,
  },
  {
    id: 'employer',
    title: 'Employer',
    description: 'Access a global talent pool, post opportunities, and manage applications.',
    icon: <Building2 className="w-6 h-6" />,
  },
  {
    id: 'university_admin',
    title: 'University Administrator',
    description: 'Manage student mobility programs, track outcomes, and connect with partners.',
    icon: <School className="w-6 h-6" />,
  },
  {
    id: 'program_provider',
    title: 'Program Provider',
    description: 'List experiential learning programs and connect with universities and students.',
    icon: <Globe className="w-6 h-6" />,
  },
  {
    id: 'platform_admin',
    title: 'Platform Administrator',
    description: 'Manage platform operations, users, and system configuration.',
    icon: <Shield className="w-6 h-6" />,
    adminOnly: true,
  },
];

interface RoleSelectGridProps {
  isAdminEligible: boolean;
}

export function RoleSelectGrid({ isAdminEligible }: RoleSelectGridProps) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleRoles = roles.filter(
    (role) => !role.adminOnly || isAdminEligible
  );

  const handleSubmit = async () => {
    if (!selectedRole) return;
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/role-select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || 'Failed to set role. Please try again.');
        return;
      }

      router.push(data.data?.redirectTo || '/student/dashboard');
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visibleRoles.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => setSelectedRole(role.id)}
            disabled={isLoading}
            className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/50 focus:ring-offset-2 ${
              selectedRole === role.id
                ? 'border-[#06B6D4] bg-[#06B6D4]/5 shadow-md'
                : 'border-[#E2E8F0] bg-white hover:border-[#06B6D4]/50 hover:shadow-sm'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {selectedRole === role.id && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#06B6D4] flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
              selectedRole === role.id ? 'bg-[#06B6D4] text-white' : 'bg-[#F8FAFC] text-[#64748B]'
            } transition-colors`}>
              {role.icon}
            </div>
            <h3 className="font-semibold text-sm text-[#0F172A] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              {role.title}
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              {role.description}
            </p>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selectedRole || isLoading}
        className="mt-6 w-full h-11 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/50 focus:ring-offset-2"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          'Continue'
        )}
      </button>
    </div>
  );
}
