'use client';

import { useEffect, useState } from 'react';
import { useCopilotStore } from '@/stores/copilot-store';
import { CopilotButton } from './copilot-button';
import { CopilotChatPanel } from './copilot-chat-panel';

export function CopilotWidget() {
  const { isOpen, isMinimized } = useCopilotStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {(!isOpen || isMinimized) && <CopilotButton />}
      {isOpen && !isMinimized && (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-300">
          <CopilotChatPanel />
        </div>
      )}
    </div>
  );
}
