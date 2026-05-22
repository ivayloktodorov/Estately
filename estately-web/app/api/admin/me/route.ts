import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { status: 'error', error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
      { status: 401 },
    );
  }

  if (user.role !== 'admin') {
    return NextResponse.json(
      { status: 'error', error: { code: 'FORBIDDEN', message: 'Admin access required.' } },
      { status: 403 },
    );
  }

  return NextResponse.json({ status: 'success', data: user });
}
