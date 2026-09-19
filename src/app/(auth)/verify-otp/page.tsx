import type { Metadata } from 'next';
import { OtpPageContent } from '@/components/auth/otp-page-content';

export const metadata: Metadata = {
  title: 'Phone Verification | GlobalXcelerate',
  description: 'Sign in with your phone number using OTP verification.',
};

export default function VerifyOtpPage() {
  return (
    <div className="animate-fade-in">
      <OtpPageContent />
    </div>
  );
}
