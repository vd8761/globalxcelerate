import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { validateFileType, validateFileSize, getFileExtension, ALLOWED_MIME_TYPES, MAX_FILE_SIZE, DOCUMENT_TYPES } from '@/validators/marketplace/upload.schema';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID();

  try {
    const { id: opportunityId } = await params;
    const supabase = await createServerSupabaseClient();

    // Require authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_001', message: 'Authentication required' }, meta: { request_id: requestId } },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const documentType = formData.get('document_type') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_001', message: 'No file provided' }, meta: { request_id: requestId } },
        { status: 400 }
      );
    }

    if (!documentType || !(DOCUMENT_TYPES as readonly string[]).includes(documentType)) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_001', message: `Invalid document type. Allowed: ${DOCUMENT_TYPES.join(', ')}` }, meta: { request_id: requestId } },
        { status: 400 }
      );
    }

    // Validate file type
    if (!validateFileType(file.type)) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_002', message: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}` }, meta: { request_id: requestId } },
        { status: 400 }
      );
    }

    // Validate file size
    if (!validateFileSize(file.size)) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_003', message: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` }, meta: { request_id: requestId } },
        { status: 413 }
      );
    }

    // Generate storage path
    const ext = getFileExtension(file.type);
    const timestamp = Date.now();
    const storagePath = `applications/${user.id}/${opportunityId}/${documentType}_${timestamp}.${ext}`;

    // Upload to Supabase Storage
    const buffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('application-documents')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: { code: 'SYS_001', message: 'Failed to upload file' }, meta: { request_id: requestId } },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('application-documents')
      .getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      data: {
        storage_path: storagePath,
        public_url: publicUrlData?.publicUrl || '',
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
      },
      meta: { request_id: requestId },
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'Internal server error' }, meta: { request_id: requestId } },
      { status: 500 }
    );
  }
}
