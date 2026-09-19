'use client';

import { useState, useCallback } from 'react';
import { Send } from 'lucide-react';
import { useCopilotStore } from '@/stores/copilot-store';
import { CopilotRateLimitBanner } from './copilot-rate-limit-banner';

export function CopilotInput() {
  const [value, setValue] = useState('');
  const { isStreaming, rateLimitRemaining, addMessage } = useCopilotStore();

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length < 2 || isStreaming || rateLimitRemaining <= 0) return;

    addMessage({
      id: crypto.randomUUID(),
      session_id: '',
      student_id: '',
      role: 'user',
      content: trimmed,
      tokens_used: null,
      created_at: new Date().toISOString(),
    });

    setValue('');
    // Actual API call will be connected via hook
  }, [value, isStreaming, rateLimitRemaining, addMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isDisabled = isStreaming || rateLimitRemaining <= 0;
  const charCount = value.length;

  return (
    <div className="px-3 pb-3 pt-2 border-t border-slate-700/50">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, 500))}
            onKeyDown={handleKeyDown}
            placeholder={isDisabled ? 'Rate limit reached...' : 'Ask anything...'}
            disabled={isDisabled}
            className="w-full bg-slate-800/50 text-white text-sm rounded-xl px-4 py-2.5 placeholder:text-slate-500 border border-slate-700/50 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            maxLength={500}
          />
          {charCount > 400 && (
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] ${charCount >= 500 ? 'text-red-400' : 'text-slate-500'}`}>
              {charCount}/500
            </span>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={!value.trim() || value.trim().length < 2 || isDisabled}
          className="h-10 w-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      <CopilotRateLimitBanner />
    </div>
  );
}
