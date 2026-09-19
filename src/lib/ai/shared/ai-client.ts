export class AIClientError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'AIClientError';
  }
}

export class AIRateLimitError extends AIClientError {
  constructor(public retryAfter?: number) {
    super('AI rate limit exceeded');
    this.name = 'AIRateLimitError';
  }
}

export class AITimeoutError extends AIClientError {
  constructor() {
    super('AI request timed out');
    this.name = 'AITimeoutError';
  }
}

interface AIClientOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

interface AIClient {
  generateText: (prompt: string, options?: AIClientOptions) => Promise<string>;
  streamText: (prompt: string, options?: AIClientOptions) => Promise<ReadableStream<string>>;
}

const DEFAULT_OPTIONS: AIClientOptions = {
  model: 'gpt-4o-mini',
  maxTokens: 2000,
  temperature: 0.7,
};

async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  const delays = [1000, 2000, 4000];
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (error instanceof AIRateLimitError) throw error;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delays[attempt]));
      }
    }
  }

  throw lastError || new AIClientError('Max retries exceeded');
}

export function createAIClient(): AIClient {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Dev fallback: return mock responses
    return {
      generateText: async (prompt) => {
        return `Based on your profile analysis, here are key insights: You have strong technical foundations with room to grow in leadership and international exposure. Focus on gaining diverse experiences to strengthen your overall profile.`;
      },
      streamText: async (prompt) => {
        const mockResponse = 'Based on your profile, I recommend focusing on building practical experience through internships and projects. Your technical skills are solid — consider adding certifications to validate them.';
        const encoder = new TextEncoder();
        const words = mockResponse.split(' ');
        let index = 0;

        return new ReadableStream<string>({
          async pull(controller) {
            if (index < words.length) {
              const word = (index === 0 ? '' : ' ') + words[index];
              controller.enqueue(word);
              index++;
              await new Promise(r => setTimeout(r, 50));
            } else {
              controller.close();
            }
          },
        });
      },
    };
  }

  return {
    generateText: async (prompt, options = {}) => {
      const merged = { ...DEFAULT_OPTIONS, ...options };

      return retryWithBackoff(async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        try {
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: merged.model,
              messages: [{ role: 'user', content: prompt }],
              max_tokens: merged.maxTokens,
              temperature: merged.temperature,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeout);

          if (res.status === 429) {
            throw new AIRateLimitError(parseInt(res.headers.get('retry-after') || '60'));
          }

          if (!res.ok) {
            throw new AIClientError(`AI API error: ${res.status}`, res.status);
          }

          const data = await res.json();
          return data.choices?.[0]?.message?.content || '';
        } catch (error) {
          clearTimeout(timeout);
          if ((error as Error).name === 'AbortError') throw new AITimeoutError();
          throw error;
        }
      });
    },

    streamText: async (prompt, options = {}) => {
      const merged = { ...DEFAULT_OPTIONS, ...options };

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: merged.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: merged.maxTokens,
          temperature: merged.temperature,
          stream: true,
        }),
      });

      if (res.status === 429) {
        throw new AIRateLimitError();
      }

      if (!res.ok) {
        throw new AIClientError(`AI API stream error: ${res.status}`, res.status);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      return new ReadableStream<string>({
        async pull(controller) {
          try {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              return;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

            for (const line of lines) {
              const data = line.replace('data: ', '');
              if (data === '[DONE]') {
                controller.close();
                return;
              }
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(content);
                }
              } catch {
                // Skip malformed JSON
              }
            }
          } catch (error) {
            controller.error(error);
          }
        },
      });
    },
  };
}
