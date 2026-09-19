export interface CopilotSession {
  id: string;
  student_id: string;
  is_active: boolean;
  context_snapshot: string | null;
  messages_count: number;
  last_activity_at: string;
  created_at: string;
}

export interface CopilotMessage {
  id: string;
  session_id: string;
  student_id: string;
  role: CopilotMessageRole;
  content: string;
  tokens_used: number | null;
  created_at: string;
}

export type CopilotMessageRole = 'user' | 'assistant' | 'system';

export interface CopilotStreamEvent {
  type: 'session' | 'token' | 'done' | 'error';
  content?: string;
  session_id?: string;
  message_id?: string;
  tokens_used?: number;
  error?: string;
}

export interface ChatRequest {
  session_id?: string;
  message: string;
  page_context?: PageContext;
}

export interface PageContext {
  url: string;
  page_type: string;
  entity_id?: string;
  entity_name?: string;
}

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  resets_at: string;
}

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface ContextLayer {
  level: number;
  label: string;
  content: string;
  token_estimate: number;
}
