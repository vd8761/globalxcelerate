'use client';

import { Bot, ChevronDown, X } from 'lucide-react';
import { useCopilotStore } from '@/stores/copilot-store';

export function CopilotHeader() {
  const { minimize, close } = useCopilotStore();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-400/20">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-cyan-400/20 flex items-center justify-center">
          <Bot className="h-3.5 w-3.5 text-cyan-400" />
        </div>
        <span className="text-sm font-semibold text-white">GX Career Copilot</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={minimize}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          aria-label="Minimize"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        <button
          onClick={close}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
