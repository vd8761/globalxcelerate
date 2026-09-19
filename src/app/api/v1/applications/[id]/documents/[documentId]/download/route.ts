import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string; documentId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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

    // Verify access
    const { data: doc, error: docError } = await supabase
      .from('application_documents')
      .select('id, application_id, student_id, file_path, file_name, mime_type, storage_bucket')
      .eq('id', documentId)
      .eq('application_id', id)
      .single();

    if (docError || !doc) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Document not found' } },
        { status: 404 }
      );
    }

    // Check access - student owner or employer/admin
    const userRole = user.user_metadata?.role;
    if (doc.student_id !== user.id && userRole !== 'employer' && userRole !== 'admin') {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    // Generate signed download URL (1 hour)
    const { data: urlData, error: urlError } = await supabase.storage
      .from(doc.storage_bucket || 'application-documents')
      .createSignedUrl(doc.file_path, 3600);

    if (urlError || !urlData) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'STORAGE_ERROR', message: 'Failed to generate download URL' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        url: urlData.signedUrl,
        file_name: doc.file_name,
        mime_type: doc.mime_type,
      },
      error: null,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } },
      { status: 500 }
    );
  }
}
