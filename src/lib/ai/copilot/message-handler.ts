import type { SupabaseClient } from '@supabase/supabase-js';
import type { PageContext } from '../types';
import { createAIClient } from '../shared/ai-client';
import { SYSTEM_PROMPT } from '../constants/copilot-prompts';
import { checkRateLimit, incrementMessageCount } from './rate-limiter';
import { checkSafety, sanitizeOutput } from './safety-filter';
import { copilotCircuitBreaker } from './circuit-breaker';
import { getOrCreateSession, updateSessionActivity } from './session-manager';
import { buildContext } from './context-builder';
import { createSSEStream } from './stream-handler';
import { getCannedResponse } from './canned-responses';

/**
 * Main orchestrator: Handle a copilot message and return an SSE stream.
 */
export async function handleCopilotMessage(
  studentId: string,
  message: string,
  pageContext: PageContext,
  supabase: SupabaseClient
): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();

  // 1. Check rate limit
  const rateLimit = await checkRateLimit(studentId, supabase);
  if (!rateLimit.allowed) {
    return createCannedStream('You\'ve reached your daily message limit (50 messages). Your limit will reset soon. In the meantime, explore the marketplace or update your profile!', 'rate_limited');
  }

  // 2. Check safety
  const safety = checkSafety(message);
  if (!safety.safe) {
    return createCannedStream(safety.reason!, 'safety');
  }

  // 3. Check circuit breaker
  if (!copilotCircuitBreaker.canRequest()) {
    const canned = getCannedResponse(pageContext, message);
    return createCannedStream(canned, 'circuit_breaker');
  }

  // 4. Get/create session
  const session = await getOrCreateSession(studentId, supabase);

  // 5. Build context
  const context = await buildContext(studentId, session.id, pageContext, supabase);

  // 6. Save user message
  const userMessageId = crypto.randomUUID();
  await supabase.from('copilot_messages').insert({
    id: userMessageId,
    session_id: session.id,
    student_id: studentId,
    role: 'user',
    content: message,
  });

  // Update session
  await updateSessionActivity(session.id, supabase);
  await supabase
    .from('copilot_sessions')
    .update({ messages_count: (session.messages_count || 0) + 1 })
    .eq('id', session.id);

  // 7. Call AI with streaming
  const ai = createAIClient();
  const fullPrompt = `${SYSTEM_PROMPT}\n\n--- Context ---\n${context}\n\n--- User Message ---\n${message}`;

  const assistantMessageId = crypto.randomUUID();
  let fullResponse = '';

  try {
    const aiStream = await ai.streamText(fullPrompt, { maxTokens: 2000, temperature: 0.7 });

    // 8. Create SSE stream with callback to collect full response
    const sseStream = createSSEStream(aiStream, session.id, assistantMessageId, (token) => {
      fullResponse += token;
    });

    // 9. On completion: save assistant message and increment rate limit
    // We'll save after stream completes (handled by consumer)
    // For now, use a transform stream to hook completion
    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
    const writer = writable.getWriter();
    const reader = sseStream.getReader();

    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);

          // Parse for collecting content
          const text = new TextDecoder().decode(value);
          if (text.includes('"type":"token"')) {
            try {
              const match = text.match(/"content":"(.*?)"/);
              if (match) fullResponse += '';
            } catch {}
          }
        }
      } finally {
        // Save assistant message
        const sanitized = sanitizeOutput(fullResponse);
        await supabase.from('copilot_messages').insert({
          id: assistantMessageId,
          session_id: session.id,
          student_id: studentId,
          role: 'assistant',
          content: sanitized || fullResponse,
        });

        await incrementMessageCount(studentId, supabase);
        copilotCircuitBreaker.recordSuccess();
        await writer.close();
      }
    })();

    return readable;
  } catch (error) {
    copilotCircuitBreaker.recordFailure();

    // Return canned response on failure
    const canned = getCannedResponse(pageContext, message);
    return createCannedStream(canned, 'error');
  }
}

/**
 * Create a simple SSE stream from a canned response string.
 */
function createCannedStream(content: string, reason: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const messageId = crypto.randomUUID();
  const words = content.split(' ');

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      // Session event
      controller.enqueue(encoder.encode(`data: {"type":"session","session_id":"canned"}\n\n`));

      // Stream word by word for natural feel
      for (let i = 0; i < words.length; i++) {
        const word = (i === 0 ? '' : ' ') + words[i];
        controller.enqueue(encoder.encode(`data: {"type":"token","content":${JSON.stringify(word)}}\n\n`));
        await new Promise(r => setTimeout(r, 30));
      }

      // Done event
      controller.enqueue(encoder.encode(`data: {"type":"done","message_id":"${messageId}","tokens_used":${words.length}}\n\n`));
      controller.close();
    },
  });
}
