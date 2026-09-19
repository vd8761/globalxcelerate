import { NextResponse } from 'next/server';
import { SECURITY_HEADERS } from './constants';

export function setSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}
