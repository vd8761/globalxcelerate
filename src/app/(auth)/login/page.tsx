import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In | GlobalXcelerate',
  description: 'Sign in to your GlobalXcelerate account to access global career opportunities.',
};

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function LoginPage({ searchParams }: Props) {
  const error = searchParams?.error as string | undefined;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          Welcome back
        </h1>
        <p className="text-[#64748B] text-sm">
          Sign in to your account to continue
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

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E2E8F0]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-[#64748B]">
            Or continue with
          </span>
        </div>
      </div>

      {/* OAuth Buttons */}
      <OAuthButtons />

      {/* Footer Link */}
      <p className="mt-8 text-center text-sm text-[#64748B]">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-medium text-[#06B6D4] hover:text-[#0891B2] transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
