'use client';

import { useCallback, useRef } from 'react';
import { useCopilotStore } from '@/stores/copilot-store';
import type { CopilotStreamEvent } from '@/lib/ai/types';

export function useCopilot() {
  const store = useCopilotStore();
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 2 || store.isStreaming) return;

    // Add user message to store
    store.addMessage({
      id: crypto.randomUUID(),
      session_id: store.sessionId || '',
      student_id: '',
      role: 'user',
      content: trimmed,
      tokens_used: null,
      created_at: new Date().toISOString(),
    });

    // Start streaming
    store.updateStreamContent('');
    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/v1/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          session_id: store.sessionId,
          page_context: store.pageContext,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error?.message || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullContent = '';
      let sessionId = store.sessionId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          try {
            const data: CopilotStreamEvent = JSON.parse(line.replace('data: ', ''));

            if (data.type === 'session' && data.session_id) {
              sessionId = data.session_id;
              store.setSessionId(data.session_id);
            }

            if (data.type === 'token' && data.content) {
              fullContent += data.content;
              store.updateStreamContent(fullContent);
            }

            if (data.type === 'done') {
              // Add complete assistant message
              store.addMessage({
                id: data.message_id || crypto.randomUUID(),
                session_id: sessionId || '',
                student_id: '',
                role: 'assistant',
                content: fullContent,
                tokens_used: data.tokens_used || null,
                created_at: new Date().toISOString(),
              });
              store.clearStream();

              if (data.tokens_used) {
                store.updateRateLimit(
                  Math.max(0, store.rateLimitRemaining - 1),
                  store.rateLimitResetsAt
                );
              }
            }

            if (data.type === 'error') {
              store.addMessage({
                id: crypto.randomUUID(),
                session_id: sessionId || '',
                student_id: '',
                role: 'assistant',
                content: data.error || 'An error occurred. Please try again.',
                tokens_used: null,
                created_at: new Date().toISOString(),
              });
              store.clearStream();
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        store.addMessage({
          id: crypto.randomUUID(),
          session_id: store.sessionId || '',
          student_id: '',
          role: 'assistant',
          content: 'Connection interrupted. Please try again.',
          tokens_used: null,
          created_at: new Date().toISOString(),
        });
      }
      store.clearStream();
    } finally {
      abortRef.current = null;
    }
  }, [store]);

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
    store.clearStream();
  }, [store]);

  return {
    sendMessage,
    cancelStream,
    messages: store.messages,
    isStreaming: store.isStreaming,
    sessionId: store.sessionId,
    rateLimitRemaining: store.rateLimitRemaining,
    isOpen: store.isOpen,
    open: store.open,
    close: store.close,
  };
}
