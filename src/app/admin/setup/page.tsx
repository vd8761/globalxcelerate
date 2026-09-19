'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function AdminSetupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/profiles/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'platform_admin' }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error?.message || 'Setup failed. Please try again.');
        return;
      }
      router.push('/admin/dashboard');
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050607] p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Platform Admin Setup</h1>
          <p className="mt-2 text-gray-400">Confirm your administrator access</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto bg-blue-600/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="text-gray-300">You have been granted platform administrator privileges. Click below to activate your admin dashboard.</p>
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <Button onClick={handleConfirm} disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Activating...' : 'Activate Admin Access'}
          </Button>
        </div>
      </div>
    </div>
  );
}
