import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const itemId = formData.get('item_id') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_001', message: 'No file provided' } },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_002', message: 'File type not allowed' } },
        { status: 415 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_003', message: 'File size exceeds 10MB limit' } },
        { status: 413 }
      );
    }

    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${user.id}/portfolio/${itemId ?? 'general'}/${safeFilename}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('portfolio-media')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: { code: 'SYS_001', message: 'Failed to upload file' } },
        { status: 500 }
      );
    }

    const { data: publicUrl } = supabase.storage
      .from('portfolio-media')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      data: {
        file_url: publicUrl.publicUrl,
        file_type: file.type,
        file_size: file.size,
        file_name: file.name,
      },
      meta: { request_id: crypto.randomUUID(), timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Portfolio upload error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
