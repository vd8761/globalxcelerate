'use client';

import { CheckCircle2, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface VerificationSuccessProps {
  type: 'email-sent' | 'verified' | 'password-reset';
  title: string;
  message: string;
  email?: string;
  actionHref?: string;
  actionLabel?: string;
}

export function VerificationSuccess({
  type,
  title,
  message,
  email,
  actionHref,
  actionLabel,
}: VerificationSuccessProps) {
  return (
    <div className="text-center animate-scale-in py-6">
      <div className="flex justify-center mb-6">
        {type === 'email-sent' ? (
          <div className="w-16 h-16 rounded-full bg-[#06B6D4]/10 flex items-center justify-center">
            <Mail className="w-8 h-8 text-[#06B6D4]" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
        {title}
      </h2>
      <p className="text-sm text-[#64748B] mb-2 max-w-xs mx-auto">
        {message}
      </p>
      {email && (
        <p className="text-sm font-medium text-[#0F172A] mb-6">{email}</p>
      )}

      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white font-medium text-sm transition-all duration-200"
        >
          {actionLabel}
        </Link>
      )}

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
