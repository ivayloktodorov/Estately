import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAdminUsers } from '@/lib/admin/users';

export async function GET(request: NextRequest) {
  await requireAdmin();
  const searchParams = request.nextUrl.searchParams;

  const result = await getAdminUsers({
    page: searchParams.get('page') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
  });

  return NextResponse.json({ status: 'success', data: result });
}
