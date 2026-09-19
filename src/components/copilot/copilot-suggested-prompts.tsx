'use client';

import { useCopilotStore } from '@/stores/copilot-store';
import { SUGGESTED_PROMPTS } from '@/lib/ai/constants/copilot-prompts';

interface CopilotSuggestedPromptsProps {
  onSend?: (text: string) => void;
}

export function CopilotSuggestedPrompts({ onSend }: CopilotSuggestedPromptsProps) {
  const { pageContext } = useCopilotStore();
  const prompts = SUGGESTED_PROMPTS[pageContext.page_type] || SUGGESTED_PROMPTS.default;

  const handleClick = (prompt: string) => {
    if (onSend) {
      onSend(prompt);
    }
  };

  return (
    <div className="px-4 pb-2">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleClick(prompt)}
            className="flex-shrink-0 text-xs text-cyan-300 bg-cyan-900/20 border border-cyan-700/30 rounded-full px-3 py-1.5 hover:bg-cyan-800/30 hover:text-cyan-200 transition-colors whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
