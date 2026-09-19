import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string; documentId: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, documentId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Verify document belongs to user's application
    const { data: doc, error: docError } = await supabase
      .from('application_documents')
      .select('id, application_id, student_id, file_path, storage_bucket')
      .eq('id', documentId)
      .eq('application_id', id)
      .single();

    if (docError || !doc) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Document not found' } },
        { status: 404 }
      );
    }

    if (doc.student_id !== user.id) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    // Verify application is in draft
    const { data: application } = await supabase
      .from('applications')
      .select('status')
      .eq('id', id)
      .single();

    if (application?.status !== 'draft') {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'INVALID_STATUS', message: 'Can only delete documents from draft applications' } },
        { status: 400 }
      );
    }

    // Delete from storage
    if (doc.file_path) {
      await supabase.storage
        .from(doc.storage_bucket || 'application-documents')
        .remove([doc.file_path]);
    }

    // Delete record
    await supabase.from('application_documents').delete().eq('id', documentId);

    return NextResponse.json({ success: true, data: null, error: null });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } },
      { status: 500 }
    );
  }
}
