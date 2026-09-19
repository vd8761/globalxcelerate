'use client';

import { Suspense } from 'react';
import { Shield } from 'lucide-react';
import { MfaVerifyForm } from '@/components/auth/mfa-verify-form';

export default function MfaVerifyPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-[#06B6D4]/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-[#06B6D4]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Two-Factor Authentication
          </h1>
          <p className="text-sm text-[#64748B]">
            Enter the code from your authenticator app
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-sm text-[#64748B]">Loading...</div>}>
          <MfaVerifyForm />
        </Suspense>
      </div>
    </div>
  );
}
