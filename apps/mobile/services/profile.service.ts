import { apiRequest } from '@/services/api';
import type { AuthUser } from '@/types/auth';

export interface UpdateProfileInput {
  fullName: string;
  email: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function updateProfile(input: UpdateProfileInput): Promise<AuthUser> {
  return apiRequest<AuthUser, UpdateProfileInput>('/me', {
    method: 'PATCH',
    body: input,
    requiresAuth: true,
  });
}

export function changePassword(input: ChangePasswordInput): Promise<{ changed: boolean }> {
  return apiRequest<{ changed: boolean }, ChangePasswordInput>('/me/password', {
    method: 'POST',
    body: input,
    requiresAuth: true,
  });
}

export function uploadAvatar(input: { dataUrl: string; fileName?: string }): Promise<{ avatarUrl: string }> {
  return apiRequest<{ avatarUrl: string }, { dataUrl: string; fileName?: string }>('/me/avatar', {
    method: 'POST',
    body: input,
    requiresAuth: true,
  });
}
