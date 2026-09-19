import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') ?? '';
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);

    if (query.length < 2) {
      return NextResponse.json({ success: true, data: { skills: [], total: 0 } });
    }

    let dbQuery = supabase
      .from('skills_master')
      .select('id, name, category', { count: 'exact' })
      .ilike('name', `%${query}%`)
      .limit(limit);

    if (category) {
      dbQuery = dbQuery.eq('category', category);
    }

    const { data: skills, count, error } = await dbQuery;

    if (error) {
      console.error('Skills search error:', error);
      return NextResponse.json({ success: true, data: { skills: [], total: 0 } });
    }

    return NextResponse.json({
      success: true,
      data: {
        skills: (skills ?? []).map((s) => ({
          id: s.id,
          name: s.name,
          category: s.category ?? 'technical',
        })),
        total: count ?? 0,
      },
    });
  } catch (error) {
    console.error('Skills reference error:', error);
    return NextResponse.json({ success: true, data: { skills: [], total: 0 } });
  }
}
