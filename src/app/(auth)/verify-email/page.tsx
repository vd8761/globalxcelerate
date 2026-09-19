import type { Metadata } from 'next';
import { VerifyEmailContent } from '@/components/auth/verify-email-content';

export const metadata: Metadata = {
  title: 'Verify Email | GlobalXcelerate',
  description: 'Verify your email address to complete registration.',
};

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; email?: string }>;
}) {
  return <VerifyEmailContent searchParamsPromise={searchParams} />;
}
