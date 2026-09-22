import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Login | GlobalXcelerate',
  description: 'Secure sign in for Platform Administrators.',
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const error = resolvedParams?.error as string | undefined;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          Platform Admin Portal
        </h1>
        <p className="text-[#64748B] text-sm max-w-xs mx-auto">
          Secure access for GlobalXcelerate administrators
        </p>
      </div>

      {/* URL Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700 font-medium">Authentication Error</p>
          <p className="text-sm text-red-600 mt-1">
            {error === 'Email link is invalid or has expired' 
              ? 'Your email verification link has expired or was already used. Please log in to request a new one.' 
              : error}
          </p>
        </div>
      )}

      {/* Login Form */}
      <LoginForm />

      {/* Footer Link */}
      <p className="mt-8 text-center text-sm text-[#64748B]">
        Are you a regular user?{' '}
        <Link
          href="/login"
          className="font-medium text-[#06B6D4] hover:text-[#0891B2] transition-colors"
        >
          Go to Standard Login
        </Link>
      </p>
    </div>
  );
}
