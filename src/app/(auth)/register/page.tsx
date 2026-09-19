import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Account | GlobalXcelerate',
  description: 'Create your GlobalXcelerate account and start your global career journey.',
};

export default function RegisterPage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          Create your account
        </h1>
        <p className="text-[#64748B] text-sm">
          Start your global career journey today
        </p>
      </div>

      {/* Register Form */}
      <RegisterForm />

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
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-[#06B6D4] hover:text-[#0891B2] transition-colors"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
