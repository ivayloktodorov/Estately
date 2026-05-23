import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, type UserRole } from '@/lib/auth';
import {
  canChangeUserRole,
  deleteAdminUser,
  getAdminUserDetails,
  updateAdminUserProfile,
} from '@/lib/admin/users';
import type { UserStatus } from '@/lib/users/profile';

interface AdminUserRouteProps {
  params: Promise<{ id: string }>;
}

function parseUserId(id: string): number {
  const userId = Number(id);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error('Invalid user ID.');
  }

  return userId;
}

export async function GET(_request: NextRequest, { params }: AdminUserRouteProps) {
  await requireAdmin();
  const { id } = await params;
  const user = await getAdminUserDetails(parseUserId(id));

  if (!user) {
    return NextResponse.json(
      { status: 'error', error: { code: 'NOT_FOUND', message: 'User not found.' } },
      { status: 404 },
    );
  }

  return NextResponse.json({ status: 'success', data: user });
}

export async function PATCH(request: NextRequest, { params }: AdminUserRouteProps) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const userId = parseUserId(id);
    const body = await request.json();
    const role: UserRole = body.role === 'admin' ? 'admin' : 'user';
    const status: UserStatus = body.status === 'inactive' ? 'inactive' : 'active';
    const permission = await canChangeUserRole(admin.id, userId, role);

    if (!permission.allowed) {
      return NextResponse.json(
        { status: 'error', error: { code: 'FORBIDDEN', message: permission.message } },
        { status: 403 },
      );
    }

    if (admin.id === userId && status === 'inactive') {
      return NextResponse.json(
        {
          status: 'error',
          error: { code: 'FORBIDDEN', message: 'You cannot deactivate your own account.' },
        },
        { status: 403 },
      );
    }

    await updateAdminUserProfile(userId, {
      firstName: String(body.firstName ?? ''),
      lastName: String(body.lastName ?? ''),
      displayName: String(body.displayName ?? ''),
      email: String(body.email ?? ''),
      bio: String(body.bio ?? ''),
      avatarUrl: typeof body.avatarUrl === 'string' ? body.avatarUrl : undefined,
      role,
      status,
    });

    return NextResponse.json({ status: 'success', data: await getAdminUserDetails(userId) });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: {
          code: 'USER_UPDATE_FAILED',
          message: error instanceof Error ? error.message : 'Could not update user.',
        },
      },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: AdminUserRouteProps) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    await deleteAdminUser(admin.id, parseUserId(id));

    return NextResponse.json({ status: 'success', data: { deleted: true } });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: {
          code: 'USER_DELETE_FAILED',
          message: error instanceof Error ? error.message : 'Could not delete user.',
        },
      },
      { status: 400 },
    );
  }
}
