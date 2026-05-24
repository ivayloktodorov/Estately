import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import {
  getUserActivity,
  type ActivityFilter,
  type ActivityListItem,
  type ActivitySearchParams,
  type UserActivityType,
} from '@/lib/activity/service';

interface ActivityPageProps {
  searchParams?: Promise<ActivitySearchParams>;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function activityHref(filter: ActivityFilter, page: number): string {
  const params = new URLSearchParams();

  if (filter !== 'all') params.set('filter', filter);
  if (page > 1) params.set('page', page.toString());

  const query = params.toString();
  return query ? `/dashboard/activity?${query}` : '/dashboard/activity';
}

function activityIcon(type: UserActivityType): string {
  switch (type) {
    case 'property_created':
    case 'property_updated':
    case 'property_approved':
    case 'property_rejected':
    case 'property_deleted':
      return '⌂';
    case 'message_received':
      return '✉';
    case 'inquiry_received':
      return '?';
    case 'favorite_added':
      return '♥';
    case 'profile_updated':
    default:
      return 'i';
  }
}

function FilterLink({ active, children, href }: { active: boolean; children: string; href: string }) {
  return (
    <Link
      className={
        active
          ? 'inline-flex h-10 items-center justify-center rounded-md bg-estate-700 px-4 text-sm font-semibold text-white shadow-sm'
          : 'inline-flex h-10 items-center justify-center rounded-md border border-stone-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-estate-300 hover:text-estate-700'
      }
      href={href}
    >
      {children}
    </Link>
  );
}

function ActivityItem({ activity }: { activity: ActivityListItem }) {
  const content = (
    <div className="flex gap-4">
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-sm font-semibold text-estate-700">
        {activityIcon(activity.type)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-charcoal-950">{activity.title}</h2>
          <time className="text-xs font-medium text-slate-500" dateTime={activity.createdAt.toISOString()}>
            {formatDate(activity.createdAt)}
          </time>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-700">{activity.description}</p>
        {activity.href ? <p className="mt-2 text-xs font-semibold text-estate-700">Open related item</p> : null}
      </div>
    </div>
  );

  return (
    <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      {activity.href ? (
        <Link
          className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700 focus-visible:ring-offset-2"
          href={activity.href}
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </article>
  );
}

export default async function ActivityPage({ searchParams }: ActivityPageProps) {
  const user = await requireAuth();
  const result = await getUserActivity(user.id, (await searchParams) ?? {});

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-estate-soft">
          <p className="text-sm font-semibold uppercase tracking-wide text-estate-700">Account timeline</p>
          <h1 className="mt-2 text-3xl font-semibold text-charcoal-950">Activity</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Track important account, property, inquiry, and message events.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <FilterLink active={result.filter === 'all'} href={activityHref('all', 1)}>
              All
            </FilterLink>
            <FilterLink active={result.filter === 'properties'} href={activityHref('properties', 1)}>
              Properties
            </FilterLink>
            <FilterLink active={result.filter === 'messages'} href={activityHref('messages', 1)}>
              Messages
            </FilterLink>
            <FilterLink active={result.filter === 'inquiries'} href={activityHref('inquiries', 1)}>
              Inquiries
            </FilterLink>
            <FilterLink active={result.filter === 'profile'} href={activityHref('profile', 1)}>
              Profile
            </FilterLink>
          </div>
        </section>

        {result.activities.length === 0 ? (
          <section className="mt-6 rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center shadow-estate-soft">
            <h2 className="text-xl font-semibold text-charcoal-950">No activity yet.</h2>
          </section>
        ) : (
          <section className="mt-6 grid gap-3" aria-label="Activity timeline">
            {result.activities.map((activity) => (
              <ActivityItem activity={activity} key={activity.id} />
            ))}
          </section>
        )}

        <nav className="mt-6 flex flex-col items-center justify-between gap-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:flex-row">
          {result.hasPreviousPage ? (
            <Link
              className="inline-flex h-10 min-w-24 items-center justify-center rounded-md border border-stone-200 px-4 text-sm font-semibold text-slate-700 hover:border-estate-300 hover:text-estate-700"
              href={activityHref(result.filter, result.currentPage - 1)}
            >
              Previous
            </Link>
          ) : (
            <span className="inline-flex h-10 min-w-24 items-center justify-center rounded-md border border-stone-200 bg-slate-100 px-4 text-sm font-semibold text-slate-400">
              Previous
            </span>
          )}
          <p className="text-sm font-semibold text-slate-600">
            Page <span className="text-slate-950">{result.currentPage}</span> of{' '}
            <span className="text-slate-950">{result.totalPages}</span>
          </p>
          {result.hasNextPage ? (
            <Link
              className="inline-flex h-10 min-w-24 items-center justify-center rounded-md bg-estate-700 px-4 text-sm font-semibold text-white hover:bg-estate-800"
              href={activityHref(result.filter, result.currentPage + 1)}
            >
              Next
            </Link>
          ) : (
            <span className="inline-flex h-10 min-w-24 items-center justify-center rounded-md border border-stone-200 bg-slate-100 px-4 text-sm font-semibold text-slate-400">
              Next
            </span>
          )}
        </nav>
      </div>
    </main>
  );
}
