import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { MAX_SAVED } from '@/lib/marketplace/constants';

const saveSchema = z.object({
  opportunity_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_001', message: 'Authentication required' }, meta: { request_id: requestId } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = saveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_001', message: 'Invalid request body', details: parsed.error.issues }, meta: { request_id: requestId } },
        { status: 400 }
      );
    }

    const { opportunity_id } = parsed.data;

    // Check opportunity exists
    const { data: opp } = await supabase
      .from('opportunities')
      .select('id')
      .eq('id', opportunity_id)
      .eq('status', 'published')
      .single();

    if (!opp) {
      return NextResponse.json(
        { success: false, error: { code: 'RES_001', message: 'Opportunity not found' }, meta: { request_id: requestId } },
        { status: 404 }
      );
    }

    // Check save limit
    const { count } = await supabase
      .from('saved_opportunities')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', user.id);

    if ((count || 0) >= MAX_SAVED) {
      return NextResponse.json(
        { success: false, error: { code: 'BIZ_003', message: `Maximum ${MAX_SAVED} saved opportunities reached` }, meta: { request_id: requestId } },
        { status: 422 }
      );
    }

    // Insert (handle duplicate)
    const { data: saved, error } = await supabase
      .from('saved_opportunities')
      .upsert({
        student_id: user.id,
        opportunity_id,
      }, { onConflict: 'student_id,opportunity_id' })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'SYS_001', message: 'Failed to save opportunity' }, meta: { request_id: requestId } },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: saved, meta: { request_id: requestId } },
      { status: 201 }
    );
  } catch (err) {
    console.error('Save opportunity error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'Internal server error' }, meta: { request_id: requestId } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_001', message: 'Authentication required' }, meta: { request_id: requestId } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = saveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_001', message: 'Invalid request body' }, meta: { request_id: requestId } },
        { status: 400 }
      );
    }

    await supabase
      .from('saved_opportunities')
      .delete()
      .eq('student_id', user.id)
      .eq('opportunity_id', parsed.data.opportunity_id);

    return NextResponse.json(
      { success: true, data: { removed: true }, meta: { request_id: requestId } },
      { status: 200 }
    );
  } catch (err) {
    console.error('Unsave opportunity error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'Internal server error' }, meta: { request_id: requestId } },
      { status: 500 }
    );
  }
}
