import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getUserProfile, updateUserProfile } from '@/lib/users/profile';

export async function GET() {
  const user = await requireAuth();
  const profile = await getUserProfile(user.id);

  return NextResponse.json({ status: 'success', data: profile });
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    await updateUserProfile(user.id, {
      firstName: String(body.firstName ?? ''),
      lastName: String(body.lastName ?? ''),
      displayName: String(body.displayName ?? ''),
      email: String(body.email ?? ''),
      bio: String(body.bio ?? ''),
      avatarUrl: typeof body.avatarUrl === 'string' ? body.avatarUrl : undefined,
    });

    return NextResponse.json({ status: 'success', data: await getUserProfile(user.id) });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: {
          code: 'PROFILE_UPDATE_FAILED',
          message: error instanceof Error ? error.message : 'Could not update profile.',
        },
      },
      { status: 400 },
    );
  }
}
