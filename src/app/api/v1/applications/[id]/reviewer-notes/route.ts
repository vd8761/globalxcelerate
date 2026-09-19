import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { reviewerNoteSchema } from '@/lib/validation/application-schemas';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const userRole = user.user_metadata?.role;
    if (userRole !== 'employer' && userRole !== 'admin') {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Only employers and admins can view reviewer notes' } },
        { status: 403 }
      );
    }

    const { data: notes, error } = await supabase
      .from('application_reviewer_notes')
      .select('*')
      .eq('application_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'QUERY_ERROR', message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: notes, error: null });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const userRole = user.user_metadata?.role;
    if (userRole !== 'employer' && userRole !== 'admin') {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Only employers and admins can add reviewer notes' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = reviewerNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid request', details: parsed.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    // Verify application exists
    const { data: application } = await supabase
      .from('applications')
      .select('id, organization_id')
      .eq('id', id)
      .single();

    if (!application) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Application not found' } },
        { status: 404 }
      );
    }

    const { data: note, error: noteError } = await supabase
      .from('application_reviewer_notes')
      .insert({
        application_id: id,
        reviewer_id: user.id,
        reviewer_name: user.user_metadata?.display_name ?? user.email,
        content: parsed.data.content,
        is_pinned: false,
      })
      .select()
      .single();

    if (noteError) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'CREATE_ERROR', message: noteError.message } },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: note, error: null },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } },
      { status: 500 }
    );
  }
}
