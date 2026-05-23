import { requireAuth } from '@/lib/auth';
import { getUserProfile } from '@/lib/users/profile';
import { ProfileManagementForm } from './profile-management-form';

export default async function ProfilePage() {
  const user = await requireAuth();
  const profile = await getUserProfile(user.id);

  if (!profile) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <ProfileManagementForm profile={profile} />
      </div>
    </main>
  );
}
