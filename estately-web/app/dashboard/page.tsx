import Link from 'next/link';
import Image from 'next/image';
import { desc, eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { PropertyImageUpload } from '@/components/properties/property-image-upload';
import { db } from '@/src/db/client';
import { properties } from '@/src/db/schema';
import { propertyImageUrl } from '@/lib/properties/images';
import { getRecentUserActivity, type UserActivityType } from '@/lib/activity/service';

const DASHBOARD_PROPERTY_LIMIT = 5;

interface ManageableProperty {
  id: number;
  title: string;
  city: string;
  address: string;
  propertyType: string;
  imageCoverUrl: string | null;
}

function formatActivityDate(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function activityIcon(type: UserActivityType): string {
  switch (type) {
    case 'message_received':
      return '✉';
    case 'inquiry_received':
      return '?';
    case 'favorite_added':
      return '♥';
    case 'profile_updated':
      return 'i';
    default:
      return '⌂';
  }
}

async function getManageableProperties(user: Awaited<ReturnType<typeof requireAuth>>): Promise<ManageableProperty[]> {
  const columns = {
      id: properties.id,
      title: properties.title,
      city: properties.city,
      address: properties.address,
      propertyType: properties.propertyType,
      imageCoverUrl: properties.imageCoverUrl,
    };

  if (user.role === 'admin') {
    return db
      .select(columns)
      .from(properties)
      .orderBy(desc(properties.createdAt))
      .limit(DASHBOARD_PROPERTY_LIMIT);
  }

  return db
    .select(columns)
    .from(properties)
    .where(eq(properties.createdByUserId, user.id))
    .orderBy(desc(properties.createdAt))
    .limit(DASHBOARD_PROPERTY_LIMIT);
}

export default async function DashboardPage() {
  const user = await requireAuth();
  const [manageablePropertiesResult, recentActivityResult] = await Promise.allSettled([
    getManageableProperties(user),
    getRecentUserActivity(user.id),
  ]);
  const manageableProperties =
    manageablePropertiesResult.status === 'fulfilled' ? manageablePropertiesResult.value : [];
  const recentActivity = recentActivityResult.status === 'fulfilled' ? recentActivityResult.value : [];

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            {user.role} dashboard
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Hi, {user.fullName}</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Your authenticated session is active. This route is protected by middleware and server
            helpers.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-5">
          <Link
            className="rounded-lg border border-stone-200 bg-white p-5 shadow-estate-soft transition hover:border-estate-300 hover:shadow-lg"
            href="/dashboard/properties"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-estate-700">Listings</p>
            <h2 className="mt-2 text-xl font-semibold text-charcoal-950">My Properties</h2>
            <p className="mt-2 text-sm text-slate-600">Manage your property listings.</p>
          </Link>
          <Link
            className="rounded-lg border border-stone-200 bg-white p-5 shadow-estate-soft transition hover:border-estate-300 hover:shadow-lg"
            href="/dashboard/messages"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-estate-700">Inbox</p>
            <h2 className="mt-2 text-xl font-semibold text-charcoal-950">Messages</h2>
            <p className="mt-2 text-sm text-slate-600">Read and reply to conversations.</p>
          </Link>
          <Link
            className="rounded-lg border border-stone-200 bg-white p-5 shadow-estate-soft transition hover:border-estate-300 hover:shadow-lg"
            href="/dashboard/inquiries"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-estate-700">Leads</p>
            <h2 className="mt-2 text-xl font-semibold text-charcoal-950">Inquiries</h2>
            <p className="mt-2 text-sm text-slate-600">Review property inquiry history.</p>
          </Link>
          <Link
            className="rounded-lg border border-stone-200 bg-white p-5 shadow-estate-soft transition hover:border-estate-300 hover:shadow-lg"
            href="/dashboard/notifications"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-estate-700">Updates</p>
            <h2 className="mt-2 text-xl font-semibold text-charcoal-950">Notifications</h2>
            <p className="mt-2 text-sm text-slate-600">View and manage account alerts.</p>
          </Link>
          <Link
            className="rounded-lg border border-stone-200 bg-white p-5 shadow-estate-soft transition hover:border-estate-300 hover:shadow-lg"
            href="/dashboard/saved-searches"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-estate-700">Alerts</p>
            <h2 className="mt-2 text-xl font-semibold text-charcoal-950">Saved Searches</h2>
            <p className="mt-2 text-sm text-slate-600">Manage property search alerts.</p>
          </Link>
        </section>

        <section className="mt-8 rounded-lg border border-stone-200 bg-white p-6 shadow-estate-soft">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-estate-700">Recent activity</p>
              <h2 className="mt-2 text-2xl font-semibold text-charcoal-950">Latest updates</h2>
            </div>
            <Link className="text-sm font-semibold text-estate-700 hover:text-estate-800" href="/dashboard/activity">
              View all activity
            </Link>
          </div>
          {recentActivity.length === 0 ? (
            <p className="mt-5 rounded-lg border border-dashed border-stone-300 bg-cream-50 p-5 text-sm font-medium text-slate-600">
              No activity yet.
            </p>
          ) : (
            <div className="mt-5 grid gap-3">
              {recentActivity.map((activity) => (
                <Link
                  className="flex gap-3 rounded-lg border border-stone-200 bg-white p-4 transition hover:border-estate-300"
                  href={activity.href ?? '/dashboard/activity'}
                  key={activity.id}
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-estate-700">
                    {activityIcon(activity.type)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-charcoal-950">{activity.title}</span>
                    <span className="mt-1 block truncate text-sm text-slate-600">{activity.description}</span>
                    <time className="mt-1 block text-xs font-medium text-slate-500" dateTime={activity.createdAt.toISOString()}>
                      {formatActivityDate(activity.createdAt)}
                    </time>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-lg border border-stone-200 bg-white p-8 shadow-estate-soft">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-estate-700">
                Listing photos
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-charcoal-950">
                Upload property images
              </h2>
              <p className="mt-2 max-w-2xl text-slate-600">
                Add JPG, PNG, or WEBP photos up to 5MB. Showing the latest {DASHBOARD_PROPERTY_LIMIT} listings here keeps the dashboard fast.
              </p>
            </div>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-lg bg-estate-700 px-5 text-sm font-semibold text-white shadow-estate-soft hover:bg-estate-800"
              href="/dashboard/properties/new"
            >
              Add Property
            </Link>
          </div>

          <div className="mt-8 grid gap-5">
            {manageableProperties.length > 0 ? (
              manageableProperties.map((property) => (
                <article
                  className="grid gap-5 rounded-xl border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-[180px_1fr]"
                  key={property.id}
                >
                  <Image
                    alt={property.title}
                    className="aspect-video w-full rounded-lg object-cover md:aspect-square"
                    height={180}
                    src={propertyImageUrl(property.imageCoverUrl, property.propertyType)}
                    width={180}
                    sizes="(min-width: 768px) 180px, 100vw"
                  />
                  <div>
                    <div className="flex flex-col justify-between gap-3 sm:flex-row">
                      <div>
                        <h3 className="text-lg font-semibold text-charcoal-950">{property.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {property.city} · {property.address}
                        </p>
                      </div>
                      <Link
                        className="text-sm font-semibold text-estate-700 hover:text-estate-800"
                        href={`/properties/${property.id}`}
                      >
                        View listing
                      </Link>
                    </div>
                    <PropertyImageUpload propertyId={property.id} />
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-stone-300 bg-cream-50 p-8 text-center">
                <h3 className="text-xl font-semibold text-charcoal-950">No properties yet</h3>
                <p className="mt-2 text-slate-600">
                  Create a property first, then return here to upload listing photos.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
