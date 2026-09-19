import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CopilotMessage, PageContext } from '@/lib/ai/types';

interface CopilotState {
  isOpen: boolean;
  isMinimized: boolean;
  sessionId: string | null;
  messages: CopilotMessage[];
  isStreaming: boolean;
  currentStreamContent: string;
  unreadCount: number;
  rateLimitRemaining: number;
  rateLimitResetsAt: string | null;
  pageContext: PageContext;
}

interface CopilotActions {
  open: () => void;
  close: () => void;
  minimize: () => void;
  expand: () => void;
  addMessage: (message: CopilotMessage) => void;
  updateStreamContent: (content: string) => void;
  clearStream: () => void;
  setSessionId: (id: string | null) => void;
  updateRateLimit: (remaining: number, resetsAt: string | null) => void;
  setPageContext: (ctx: PageContext) => void;
  resetSession: () => void;
}

export const useCopilotStore = create<CopilotState & CopilotActions>()(
  persist(
    (set) => ({
      // State
      isOpen: false,
      isMinimized: false,
      sessionId: null,
      messages: [],
      isStreaming: false,
      currentStreamContent: '',
      unreadCount: 0,
      rateLimitRemaining: 50,
      rateLimitResetsAt: null,
      pageContext: { url: '/', page_type: 'default' },

      // Actions
      open: () => set({ isOpen: true, isMinimized: false, unreadCount: 0 }),
      close: () => set({ isOpen: false, isMinimized: false }),
      minimize: () => set({ isMinimized: true }),
      expand: () => set({ isMinimized: false, unreadCount: 0 }),
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
          unreadCount: state.isOpen ? state.unreadCount : state.unreadCount + 1,
        })),
      updateStreamContent: (content) =>
        set({ currentStreamContent: content, isStreaming: true }),
      clearStream: () =>
        set({ currentStreamContent: '', isStreaming: false }),
      setSessionId: (id) => set({ sessionId: id }),
      updateRateLimit: (remaining, resetsAt) =>
        set({ rateLimitRemaining: remaining, rateLimitResetsAt: resetsAt }),
      setPageContext: (ctx) => set({ pageContext: ctx }),
      resetSession: () =>
        set({
          sessionId: null,
          messages: [],
          currentStreamContent: '',
          isStreaming: false,
        }),
    }),
    {
      name: 'gx-copilot',
      partialize: (state) => ({
        sessionId: state.sessionId,
        messages: state.messages.slice(-20),
        rateLimitRemaining: state.rateLimitRemaining,
        rateLimitResetsAt: state.rateLimitResetsAt,
      }),
    }
  )
);
