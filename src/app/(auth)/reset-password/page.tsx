import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata: Metadata = {
  title: 'Reset Password | GlobalXcelerate',
  description: 'Set a new password for your GlobalXcelerate account.',
};

export default function ResetPasswordPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          Set a new password
        </h1>
        <p className="text-[#64748B] text-sm">
          Enter your new password below. Make sure it&apos;s strong and unique.
        </p>
      </div>

      <ResetPasswordForm />
    </div>
  );
}
