'use client';

import { useCallback, useRef, useState } from 'react';
import { useCopilotStore } from '@/stores/copilot-store';
import type { CopilotStreamEvent } from '@/lib/ai/types';

export function useCopilotStream() {
  const [isConnected, setIsConnected] = useState(false);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const store = useCopilotStore();

  const connect = useCallback(async (message: string) => {
    setIsConnected(true);

    try {
      const res = await fetch('/api/v1/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          session_id: store.sessionId,
          page_context: store.pageContext,
        }),
      });

      if (!res.ok || !res.body) {
        setIsConnected(false);
        return;
      }

      const reader = res.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          try {
            const event: CopilotStreamEvent = JSON.parse(line.slice(6));
            if (event.type === 'session') store.setSessionId(event.session_id || null);
            if (event.type === 'done') break;
          } catch {}
        }
      }
    } finally {
      setIsConnected(false);
      readerRef.current = null;
    }
  }, [store]);

  const disconnect = useCallback(() => {
    readerRef.current?.cancel();
    readerRef.current = null;
    setIsConnected(false);
  }, []);

  return { connect, disconnect, isConnected };
}
