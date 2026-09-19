import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { documentUploadSchema } from '@/lib/validation/application-schemas';
import { generateDocumentPath, getFileExtension, sanitizeFileName } from '@/lib/applications/utils';
import { MAX_DOCUMENTS } from '@/lib/applications/constants';

interface RouteParams {
  params: Promise<{ id: string }>;
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

    const body = await request.json();
    const parsed = documentUploadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid request', details: parsed.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    // Verify application exists and belongs to user and is in draft
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('id, student_id, status')
      .eq('id', id)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Application not found' } },
        { status: 404 }
      );
    }

    if (application.student_id !== user.id) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    if (application.status !== 'draft') {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'INVALID_STATUS', message: 'Can only upload documents to draft applications' } },
        { status: 400 }
      );
    }

    // Check document count
    const { count } = await supabase
      .from('application_documents')
      .select('id', { count: 'exact', head: true })
      .eq('application_id', id);

    if ((count ?? 0) >= MAX_DOCUMENTS) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'LIMIT_REACHED', message: `Maximum ${MAX_DOCUMENTS} documents allowed` } },
        { status: 400 }
      );
    }

    const { file_name, document_type, file_size, mime_type } = parsed.data;
    const ext = getFileExtension(file_name);
    const sanitizedName = sanitizeFileName(file_name);

    // Create document record
    const { data: doc, error: docError } = await supabase
      .from('application_documents')
      .insert({
        application_id: id,
        student_id: user.id,
        document_type,
        file_name: sanitizedName,
        file_path: '', // Will be set after storage path is generated
        file_size,
        mime_type,
        storage_bucket: 'application-documents',
        upload_status: 'pending',
      })
      .select()
      .single();

    if (docError || !doc) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'CREATE_ERROR', message: docError?.message ?? 'Failed to create document record' } },
        { status: 500 }
      );
    }

    // Generate storage path and signed upload URL
    const storagePath = generateDocumentPath(user.id, id, doc.id, ext || 'pdf');

    // Update doc with path
    await supabase
      .from('application_documents')
      .update({ file_path: storagePath })
      .eq('id', doc.id);

    // Create signed upload URL
    const { data: uploadData } = await supabase.storage
      .from('application-documents')
      .createSignedUploadUrl(storagePath);

    return NextResponse.json(
      {
        success: true,
        data: {
          ...doc,
          file_path: storagePath,
          upload_url: uploadData?.signedUrl ?? null,
        },
        error: null,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } },
      { status: 500 }
    );
  }
}
