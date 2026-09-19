import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

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

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_001', message: 'No file provided' } },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_002', message: 'File type not allowed. Use JPEG, PNG, or WebP.' } },
        { status: 415 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_003', message: 'File size exceeds 5MB limit' } },
        { status: 413 }
      );
    }

    const ext = file.name.split('.').pop() ?? 'jpg';
    const filePath = `${user.id}/avatar.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
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
      .from('profile-photos')
      .getPublicUrl(filePath);

    const photoUrl = publicUrl.publicUrl;

    // Update profile
    await supabase
      .from('student_profiles')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      data: {
        photo_url: photoUrl,
        thumbnail_url: photoUrl,
        file_size: file.size,
      },
      meta: { request_id: crypto.randomUUID(), timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
