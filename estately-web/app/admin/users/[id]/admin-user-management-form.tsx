'use client';

import { useActionState, useState } from 'react';
import type { AdminUserDetails } from '@/lib/admin/users';
import {
  deleteUserAction,
  resetAdminUserPasswordAction,
  toggleUserStatusAction,
  updateAdminUserAction,
  type AdminUserActionState,
} from '../actions';

const initialState: AdminUserActionState = {
  status: 'idle',
  message: '',
};

function Notice({ state }: { state: AdminUserActionState }) {
  if (state.status === 'idle') {
    return null;
  }

  return (
    <p
      className={`rounded-md px-4 py-3 text-sm font-semibold ${
        state.status === 'success'
          ? 'bg-estate-50 text-estate-700 ring-1 ring-estate-200'
          : 'bg-red-50 text-red-700 ring-1 ring-red-200'
      }`}
    >
      {state.message}
    </p>
  );
}

function initials(fullName: string): string {
  return fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function AdminUserManagementForm({
  actingAdminId,
  user,
}: {
  actingAdminId: number;
  user: AdminUserDetails;
}) {
  const [editState, editAction, isEditPending] = useActionState(updateAdminUserAction, initialState);
  const [passwordState, passwordAction, isPasswordPending] = useActionState(
    resetAdminUserPasswordAction,
    initialState,
  );
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl);
  const isSelf = actingAdminId === user.id;

  return (
    <div className="grid gap-6">
      <form action={editAction} className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <input name="userId" type="hidden" value={user.id} />
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Edit User</h2>
          <p className="mt-1 text-sm text-slate-600">Update profile fields, role, account status, and avatar.</p>
        </div>
        <Notice state={editState} />

        <section className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="h-20 w-20 rounded-full object-cover ring-1 ring-slate-200" src={avatarPreview} />
          ) : (
            <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-cream-100 text-xl font-bold text-estate-700">
              {initials(user.fullName)}
            </span>
          )}
          <div className="grid gap-3">
            <input
              accept="image/jpeg,image/png,image/webp"
              className="block w-full text-sm text-slate-700 file:mr-4 file:h-10 file:rounded-md file:border-0 file:bg-estate-700 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-estate-800"
              name="avatar"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setAvatarPreview(file ? URL.createObjectURL(file) : user.avatarUrl);
              }}
              type="file"
            />
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input className="h-4 w-4 rounded border-slate-300 text-estate-700" name="removeAvatar" type="checkbox" />
              Remove current avatar
            </label>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            First name
            <input className="h-11 rounded-md border border-slate-300 px-3" defaultValue={user.firstName} name="firstName" required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Last name
            <input className="h-11 rounded-md border border-slate-300 px-3" defaultValue={user.lastName} name="lastName" required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Display name
            <input className="h-11 rounded-md border border-slate-300 px-3" defaultValue={user.displayName ?? ''} name="displayName" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Email
            <input className="h-11 rounded-md border border-slate-300 px-3" defaultValue={user.email} name="email" required type="email" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Role
            <select className="h-11 rounded-md border border-slate-300 px-3" defaultValue={user.role} name="role">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Status
            <select className="h-11 rounded-md border border-slate-300 px-3" defaultValue={user.status} disabled={isSelf} name="status">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          {isSelf ? <input name="status" type="hidden" value={user.status} /> : null}
          <label className="grid gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
            Bio
            <textarea className="min-h-28 rounded-md border border-slate-300 px-3 py-2" defaultValue={user.bio ?? ''} name="bio" />
          </label>
        </div>

        <button className="h-11 rounded-md bg-estate-700 px-5 text-sm font-semibold text-white hover:bg-estate-800 disabled:opacity-60 sm:w-fit" disabled={isEditPending}>
          {isEditPending ? 'Saving...' : 'Save user'}
        </button>
      </form>

      <form action={passwordAction} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <input name="userId" type="hidden" value={user.id} />
        <h2 className="text-xl font-semibold text-slate-950">Reset Password</h2>
        <Notice state={passwordState} />
        <label className="grid gap-2 text-sm font-semibold text-slate-700 sm:max-w-sm">
          New password
          <input className="h-11 rounded-md border border-slate-300 px-3" minLength={8} name="password" required type="password" />
        </label>
        <button className="h-11 rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 hover:border-estate-700 hover:text-estate-700 disabled:opacity-60 sm:w-fit" disabled={isPasswordPending}>
          {isPasswordPending ? 'Resetting...' : 'Reset password'}
        </button>
      </form>

      <section className="rounded-lg border border-red-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-red-700">Danger Zone</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <form action={toggleUserStatusAction}>
            <input name="userId" type="hidden" value={user.id} />
            <input name="status" type="hidden" value={user.status === 'active' ? 'inactive' : 'active'} />
            <button
              className="h-10 rounded-md border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSelf}
              onClick={(event) => {
                if (!window.confirm('Are you sure?')) {
                  event.preventDefault();
                }
              }}
            >
              {user.status === 'active' ? 'Deactivate account' : 'Activate account'}
            </button>
          </form>
          <form action={deleteUserAction}>
            <input name="userId" type="hidden" value={user.id} />
            <button
              className="h-10 rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSelf}
              onClick={(event) => {
                if (!window.confirm('Are you sure?')) {
                  event.preventDefault();
                }
              }}
            >
              Delete account
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
