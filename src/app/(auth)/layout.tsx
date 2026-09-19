import { AuthIllustrationPanel } from '@/components/auth/auth-illustration-panel';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-center h-16 bg-[#0F172A]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#06B6D4] flex items-center justify-center">
            <span className="text-white font-bold text-sm">GX</span>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
            GlobalXcelerate
          </span>
        </div>
      </div>

      {/* Desktop Left Panel */}
      <div className="hidden md:flex md:w-[40%] lg:w-[42%]">
        <AuthIllustrationPanel />
      </div>

      {/* Right Panel - Form Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 bg-white min-h-[calc(100vh-64px)] md:min-h-screen">
        <div className="w-full max-w-[440px]">
          {children}
        </div>
      </div>
    </div>
  );
}
