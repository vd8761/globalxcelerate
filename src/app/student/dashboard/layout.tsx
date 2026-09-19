import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Dashboard | GlobalXcelerate',
  description: 'Your personalized student dashboard for global opportunities.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 min-h-screen">
      {children}
    </div>
  );
}
