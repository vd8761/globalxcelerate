import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { processBatchMatching } from '@/lib/ai/matching/batch-processor';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'AUTH_001', message: 'Authentication required' } }, { status: 401 });
    }

    // Only admin/employer can trigger batch
    const role = user.user_metadata?.role;
    if (role !== 'admin' && role !== 'employer') {
      return NextResponse.json({ success: false, error: { code: 'AUTH_003', message: 'Only admins and employers can trigger batch matching' } }, { status: 403 });
    }

    const body = await request.json();
    const { opportunity_id, limit = 100, min_score_threshold = 0 } = body;

    if (!opportunity_id) {
      return NextResponse.json({ success: false, error: { code: 'VAL_001', message: 'opportunity_id is required' } }, { status: 400 });
    }

    // Process synchronously for MVP (return 200 with results)
    const result = await processBatchMatching(opportunity_id, limit, min_score_threshold, supabase);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SYS_001', message: 'Batch processing failed' } }, { status: 500 });
  }
}
