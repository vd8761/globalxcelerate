import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Simple ping query
    const { error } = await supabase.from('auth_events').select('id').limit(0);

    if (error && !error.message.includes('does not exist')) {
      return NextResponse.json(
        { status: 'degraded', supabase: false, timestamp: new Date().toISOString() },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      supabase: true,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { status: 'unhealthy', supabase: false, timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
