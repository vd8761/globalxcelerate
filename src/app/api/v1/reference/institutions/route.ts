import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') ?? '';
    const limit = parseInt(searchParams.get('limit') ?? '10', 10);

    if (query.length < 2) {
      return NextResponse.json({ success: true, data: { institutions: [] } });
    }

    // Try to query institutions table, fallback gracefully
    const { data: institutions, error } = await supabase
      .from('organizations')
      .select('id, name, location_country')
      .ilike('name', `%${query}%`)
      .limit(limit);

    if (error) {
      // Fallback: return empty list
      return NextResponse.json({ success: true, data: { institutions: [] } });
    }

    return NextResponse.json({
      success: true,
      data: {
        institutions: (institutions ?? []).map((i) => ({
          id: i.id,
          name: i.name,
          country: i.location_country,
        })),
      },
    });
  } catch (error) {
    console.error('Institutions reference error:', error);
    return NextResponse.json({ success: true, data: { institutions: [] } });
  }
}
