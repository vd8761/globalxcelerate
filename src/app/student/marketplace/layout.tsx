import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Opportunity Marketplace | GlobalXcelerate',
  description: 'Discover global opportunities including internships, exchange programs, research collaborations, and more.',
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  );
}
