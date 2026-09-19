import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { handleCopilotMessage } from '@/lib/ai/copilot/message-handler';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_001', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message, page_context, session_id } = body;

    // Validate message
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_001', message: 'message is required' } },
        { status: 400 }
      );
    }

    const trimmed = message.trim();
    if (trimmed.length < 2) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_002', message: 'Message must be at least 2 characters' } },
        { status: 400 }
      );
    }

    if (trimmed.length > 500) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_002', message: 'Message must be 500 characters or less' } },
        { status: 400 }
      );
    }

    const pageContext = page_context || { url: '/', page_type: 'default' };

    // Get SSE stream from message handler
    const stream = await handleCopilotMessage(user.id, trimmed, pageContext, supabase);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('rate limit')) {
      return NextResponse.json(
        { success: false, error: { code: 'AI_003', message: 'Rate limit exceeded' } },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'Failed to process message' } },
      { status: 500 }
    );
  }
}
