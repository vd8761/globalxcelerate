'use client';

import { useState } from 'react';
import { MfaSetupForm } from '@/components/auth/mfa-setup-form';
import { Shield } from 'lucide-react';

export default function MfaSetupPage() {
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [codesAcknowledged, setCodesAcknowledged] = useState(false);

  const handleVerified = (codes: string[]) => {
    setRecoveryCodes(codes);
  };

  if (recoveryCodes) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-[#10B981]" />
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Save your recovery codes
            </h1>
            <p className="text-sm text-[#64748B]">
              Store these codes in a safe place. They can be used to access your account if you lose your authenticator.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            {recoveryCodes.map((code, i) => (
              <div key={i} className="font-mono text-sm text-[#0F172A] bg-white px-3 py-2 rounded-lg border border-[#E2E8F0] text-center">
                {code}
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(recoveryCodes.join('\n'))}
              className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:text-[#0F172A] hover:border-[#CBD5E1] transition-all"
            >
              Copy all
            </button>
            <button
              type="button"
              onClick={() => {
                const blob = new Blob([recoveryCodes.join('\n')], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'globalxcelerate-recovery-codes.txt';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:text-[#0F172A] hover:border-[#CBD5E1] transition-all"
            >
              Download
            </button>
          </div>

          <label className="flex items-center gap-2.5 mb-4">
            <input
              type="checkbox"
              checked={codesAcknowledged}
              onChange={(e) => setCodesAcknowledged(e.target.checked)}
              className="w-4 h-4 rounded border-[#E2E8F0] text-[#06B6D4] focus:ring-[#06B6D4]"
            />
            <span className="text-sm text-[#64748B]">
              I&apos;ve saved my recovery codes
            </span>
          </label>

          <a
            href="/student/dashboard"
            className={`block w-full h-11 rounded-lg bg-[#06B6D4] text-white font-medium text-sm text-center leading-[44px] transition-all duration-200 ${
              codesAcknowledged ? 'hover:bg-[#0891B2]' : 'opacity-50 pointer-events-none'
            }`}
          >
            Continue
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-[#06B6D4]/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-[#06B6D4]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Set up two-factor authentication
          </h1>
          <p className="text-sm text-[#64748B]">
            Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.)
          </p>
        </div>

        <MfaSetupForm onVerified={handleVerified} />
      </div>
    </div>
  );
}
