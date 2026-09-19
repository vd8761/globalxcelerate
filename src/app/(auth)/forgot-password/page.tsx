import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Forgot Password | GlobalXcelerate',
  description: 'Reset your GlobalXcelerate account password.',
};

export default function ForgotPasswordPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          Forgot your password?
        </h1>
        <p className="text-[#64748B] text-sm">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <ForgotPasswordForm />

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          &larr; Back to login
        </Link>
      </div>
    </div>
  );
}
