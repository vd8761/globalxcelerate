export function AuthIllustrationPanel() {
  return (
    <div className="relative w-full h-full bg-[#0F172A] flex flex-col items-center justify-center overflow-hidden">
      {/* Background gradient circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#06B6D4]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#06B6D4]/5 rounded-full blur-3xl" />
      
      {/* Animated globe placeholder */}
      <div className="relative z-10 mb-8">
        <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-full border-2 border-[#06B6D4]/30 flex items-center justify-center animate-[spin_60s_linear_infinite]">
          <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-full border border-[#06B6D4]/20 flex items-center justify-center">
            <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-gradient-to-br from-[#06B6D4]/20 to-[#0F172A] flex items-center justify-center">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-center justify-center">
                <svg className="w-10 h-10 lg:w-12 lg:h-12 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        {/* Orbit dots */}
        <div className="absolute top-0 left-1/2 w-3 h-3 bg-[#06B6D4] rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-4 right-4 w-2 h-2 bg-[#22D3EE] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 left-2 w-2 h-2 bg-[#06B6D4]/60 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Logo and tagline */}
      <div className="relative z-10 text-center px-8">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#06B6D4] flex items-center justify-center">
            <span className="text-white font-bold text-lg">GX</span>
          </div>
          <span className="text-white font-semibold text-xl tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
            GlobalXcelerate
          </span>
        </div>
        <h2 className="text-white text-2xl lg:text-3xl font-bold tracking-tight mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
          Launch Your Global Career
        </h2>
        <p className="text-slate-400 text-sm lg:text-base max-w-xs mx-auto leading-relaxed">
          Connect with world-class opportunities, employers, and universities across the globe.
        </p>
      </div>

      {/* Bottom decorative element */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-8 h-1 bg-[#06B6D4]/40 rounded-full" />
        <div className="w-3 h-1 bg-[#06B6D4]/20 rounded-full" />
        <div className="w-2 h-1 bg-[#06B6D4]/10 rounded-full" />
      </div>
    </div>
  );
}
