'use client';

import { useState, useEffect, use } from 'react';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { VerificationSuccess } from './verification-success';

interface VerifyEmailContentProps {
  searchParamsPromise: Promise<{ verified?: string; email?: string }>;
}

export function VerifyEmailContent({ searchParamsPromise }: VerifyEmailContentProps) {
  const searchParams = use(searchParamsPromise);
  const isVerified = searchParams?.verified === 'true';
  const email = searchParams?.email || '';
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    setIsResending(true);

    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setCooldown(60);
    } catch {
      // Silently handle
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="animate-fade-in">
        <VerificationSuccess
          type="verified"
          title="Email verified!"
          message="Your email has been successfully verified. You can now continue setting up your account."
          actionHref="/role-select"
          actionLabel="Continue"
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in text-center py-6">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-[#06B6D4]/10 flex items-center justify-center">
          <Mail className="w-8 h-8 text-[#06B6D4]" />
        </div>
      </div>

      <h1 className="text-xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
        Check your email
      </h1>
      <p className="text-sm text-[#64748B] mb-2 max-w-xs mx-auto">
        We&apos;ve sent a verification link to your email address. Click the link to verify your account.
      </p>
      {email && (
        <p className="text-sm font-medium text-[#0F172A] mb-6">{email}</p>
      )}

      <button
        type="button"
        onClick={handleResend}
        disabled={cooldown > 0 || isResending}
        className="inline-flex items-center justify-center h-10 px-5 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:text-[#0F172A] hover:border-[#CBD5E1] disabled:opacity-50 disabled:cursor-not-allowed transition-all gap-2"
      >
        {isResending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : cooldown > 0 ? (
          `Resend in ${cooldown}s`
        ) : (
          'Resend verification email'
        )}
      </button>

      <div className="mt-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </div>
    </div>
  );
}
