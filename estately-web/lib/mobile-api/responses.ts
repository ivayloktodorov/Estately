import { NextResponse } from 'next/server';

export function mobileSuccess<TData>(data: TData, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function mobileError(error: string, status = 400): NextResponse {
  return NextResponse.json({ success: false, error }, { status });
}
