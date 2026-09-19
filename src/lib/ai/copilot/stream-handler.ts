import type { CopilotStreamEvent } from '../types';

/**
 * Create an SSE-formatted stream from an AI token stream.
 */
export function createSSEStream(
  aiStream: ReadableStream<string>,
  sessionId: string,
  messageId: string,
  onToken?: (token: string) => void
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let tokensUsed = 0;
  let fullContent = '';

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      // Send session event
      const sessionEvent: CopilotStreamEvent = { type: 'session', session_id: sessionId };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(sessionEvent)}\n\n`));

      const reader = aiStream.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            // Send done event
            const doneEvent: CopilotStreamEvent = {
              type: 'done',
              message_id: messageId,
              tokens_used: tokensUsed,
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(doneEvent)}\n\n`));
            controller.close();
            break;
          }

          // Send token event
          fullContent += value;
          tokensUsed++;
          const tokenEvent: CopilotStreamEvent = { type: 'token', content: value };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(tokenEvent)}\n\n`));

          if (onToken) onToken(value);
        }
      } catch (error) {
        const errorEvent: CopilotStreamEvent = {
          type: 'error',
          error: 'Stream interrupted. Please try again.',
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
        controller.close();
      }
    },
  });
}
