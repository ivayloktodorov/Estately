'use client';

import { useActionState, useMemo, useState } from 'react';
import type { UserProfile } from '@/lib/users/profile';
import { changePasswordAction, updateProfileAction, type ProfileActionState } from './actions';

const initialState: ProfileActionState = {
  status: 'idle',
  message: '',
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
  }).format(date);
}

function Notice({ state }: { state: ProfileActionState }) {
  if (state.status === 'idle') {
    return null;
  }

  return (
    <p
      className={`rounded-md px-4 py-3 text-sm font-semibold ${
        state.status === 'success'
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
          : 'bg-red-50 text-red-700 ring-1 ring-red-200'
      }`}
    >
      {state.message}
    </p>
  );
}

function initials(profile: UserProfile): string {
  return `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`.toUpperCase() || 'U';
}

export function ProfileManagementForm({ profile }: { profile: UserProfile }) {
  const [profileState, profileAction, isProfilePending] = useActionState(updateProfileAction, initialState);
  const [passwordState, passwordAction, isPasswordPending] = useActionState(changePasswordAction, initialState);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl);

  const accountRows = useMemo(
    () => [
      { label: 'Role', value: profile.role },
      { label: 'Status', value: profile.status },
      { label: 'Registration date', value: formatDate(profile.createdAt) },
      { label: 'Last updated', value: formatDate(profile.updatedAt) },
    ],
    [profile],
  );

  return (
    <div className="grid gap-6">
      <form action={profileAction} className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-estate-700">Personal Information</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Profile</h1>
          <p className="mt-2 text-slate-600">Manage your public profile details and account email.</p>
        </div>

        <Notice state={profileState} />

        <section className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Profile Avatar</h2>
            <p className="mt-1 text-sm text-slate-600">JPG, PNG, or WEBP up to 5MB.</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="h-24 w-24 rounded-full object-cover ring-1 ring-slate-200" src={avatarPreview} />
            ) : (
              <span className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-cream-100 text-2xl font-bold text-estate-700">
                {initials(profile)}
              </span>
            )}
            <div className="grid gap-3">
              <input
                accept="image/jpeg,image/png,image/webp"
                className="block w-full text-sm text-slate-700 file:mr-4 file:h-10 file:rounded-md file:border-0 file:bg-slate-950 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-estate-700"
                name="avatar"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setAvatarPreview(file ? URL.createObjectURL(file) : profile.avatarUrl);
                }}
                type="file"
              />
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input className="h-4 w-4 rounded border-slate-300 text-estate-700" name="removeAvatar" type="checkbox" />
                Remove current avatar
              </label>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            First name
            <input className="h-11 rounded-md border border-slate-300 px-3 text-slate-950" defaultValue={profile.firstName} name="firstName" required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Last name
            <input className="h-11 rounded-md border border-slate-300 px-3 text-slate-950" defaultValue={profile.lastName} name="lastName" required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Display name
            <input className="h-11 rounded-md border border-slate-300 px-3 text-slate-950" defaultValue={profile.displayName ?? ''} name="displayName" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Email address
            <input className="h-11 rounded-md border border-slate-300 px-3 text-slate-950" defaultValue={profile.email} name="email" required type="email" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
            Bio
            <textarea className="min-h-28 rounded-md border border-slate-300 px-3 py-2 text-slate-950" defaultValue={profile.bio ?? ''} name="bio" />
          </label>
        </section>

        <button
          className="h-11 w-full rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-estate-700 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
          disabled={isProfilePending}
        >
          {isProfilePending ? 'Saving...' : 'Save profile'}
        </button>
      </form>

      <form action={passwordAction} className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Password Management</h2>
          <p className="mt-1 text-sm text-slate-600">Choose a new password with at least 8 characters.</p>
        </div>
        <Notice state={passwordState} />
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Current password
            <input className="h-11 rounded-md border border-slate-300 px-3" name="currentPassword" required type="password" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            New password
            <input className="h-11 rounded-md border border-slate-300 px-3" minLength={8} name="newPassword" required type="password" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Confirm new password
            <input className="h-11 rounded-md border border-slate-300 px-3" minLength={8} name="confirmPassword" required type="password" />
          </label>
        </div>
        <button
          className="h-11 w-full rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-estate-700 hover:text-estate-700 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
          disabled={isPasswordPending}
        >
          {isPasswordPending ? 'Updating...' : 'Change password'}
        </button>
      </form>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Account Information</h2>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {accountRows.map((row) => (
            <div key={row.label}>
              <dt className="font-semibold text-slate-500">{row.label}</dt>
              <dd className="mt-1 capitalize text-slate-950">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
