import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GX Score - GlobalXcelerate',
};

export default function GXScoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
