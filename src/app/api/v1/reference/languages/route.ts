import { NextResponse } from 'next/server';
import languagesData from '@/data/languages.json';

export async function GET() {
  return NextResponse.json(
    { success: true, data: { languages: languagesData } },
    {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    }
  );
}
