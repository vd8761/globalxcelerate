'use client';

import { Sparkles } from 'lucide-react';
import { useCopilotStore } from '@/stores/copilot-store';

export function CopilotButton() {
  const { open, unreadCount } = useCopilotStore();

  return (
    <button
      onClick={open}
      className="relative h-14 w-14 rounded-full bg-[#0F172A] shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-200 group"
      aria-label="Open GX Career Copilot"
    >
      <Sparkles className="h-6 w-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
          <span className="text-[9px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
        </span>
      )}
      {/* Pulse animation */}
      <span className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping opacity-75" style={{ animationDuration: '3s' }} />
    </button>
  );
}
