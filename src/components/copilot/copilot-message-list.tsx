'use client';

import { useRef, useEffect } from 'react';
import { useCopilotStore } from '@/stores/copilot-store';
import { CopilotMessageBubble } from './copilot-message-bubble';
import { CopilotTypingIndicator } from './copilot-typing-indicator';
import { Bot } from 'lucide-react';
import { CANNED_RESPONSES } from '@/lib/ai/constants/copilot-prompts';

export function CopilotMessageList() {
  const { messages, isStreaming, currentStreamContent } = useCopilotStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentStreamContent]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="h-12 w-12 rounded-full bg-cyan-400/10 flex items-center justify-center mb-3">
            <Bot className="h-6 w-6 text-cyan-400" />
          </div>
          <p className="text-sm text-slate-300 max-w-[260px]">
            {CANNED_RESPONSES.greeting}
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <CopilotMessageBubble
          key={msg.id}
          role={msg.role}
          content={msg.content}
          timestamp={msg.created_at}
        />
      ))}

      {isStreaming && currentStreamContent && (
        <CopilotMessageBubble
          role="assistant"
          content={currentStreamContent}
          timestamp={new Date().toISOString()}
        />
      )}

      {isStreaming && !currentStreamContent && <CopilotTypingIndicator />}
    </div>
  );
}
