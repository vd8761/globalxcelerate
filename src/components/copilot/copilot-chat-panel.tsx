'use client';

import { useCopilotStore } from '@/stores/copilot-store';
import { CopilotHeader } from './copilot-header';
import { CopilotMessageList } from './copilot-message-list';
import { CopilotSuggestedPrompts } from './copilot-suggested-prompts';
import { CopilotInput } from './copilot-input';

export function CopilotChatPanel() {
  const { messages } = useCopilotStore();
  const showPrompts = messages.length < 3;

  return (
    <div className="w-[380px] h-[520px] max-sm:w-[calc(100vw-3rem)] max-sm:h-[70vh] bg-[#0F172A]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 flex flex-col overflow-hidden">
      <CopilotHeader />
      <CopilotMessageList />
      {showPrompts && <CopilotSuggestedPrompts />}
      <CopilotInput />
    </div>
  );
}
