import { NextResponse } from 'next/server';
import countriesData from '@/data/countries.json';

export async function GET() {
  return NextResponse.json(
    { success: true, data: { countries: countriesData } },
    {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    }
  );
}
