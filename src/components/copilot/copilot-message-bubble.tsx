'use client';

import { Bot } from 'lucide-react';
import type { CopilotMessageRole } from '@/lib/ai/types';

interface CopilotMessageBubbleProps {
  role: CopilotMessageRole;
  content: string;
  timestamp: string;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul class="list-disc space-y-1 my-1">$&</ul>')
    .replace(/\n/g, '<br/>');
}

export function CopilotMessageBubble({ role, content, timestamp }: CopilotMessageBubbleProps) {
  const isUser = role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-cyan-600 text-white rounded-xl rounded-br-sm px-3.5 py-2.5">
          <p className="text-sm whitespace-pre-wrap">{content}</p>
          <span className="block text-[10px] text-cyan-200/60 mt-1 text-right">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-start">
      <div className="h-6 w-6 rounded-full bg-cyan-400/10 flex items-center justify-center flex-shrink-0 mt-1">
        <Bot className="h-3 w-3 text-cyan-400" />
      </div>
      <div className="max-w-[85%] bg-slate-100 text-slate-800 rounded-xl rounded-bl-sm px-3.5 py-2.5">
        <div
          className="text-sm prose prose-sm prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
        <span className="block text-[10px] text-slate-400 mt-1">
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
