import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import {
  getUserNotificationsPage,
  type NotificationGroupFilter,
  type NotificationListItem,
  type NotificationReadFilter,
  type NotificationsSearchParams,
  type NotificationType,
} from '@/lib/notifications/service';
import {
  deleteNotificationAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
  markNotificationUnreadAction,
} from './actions';

interface NotificationsPageProps {
  searchParams?: Promise<NotificationsSearchParams>;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function typeLabel(type: NotificationType): string {
  switch (type) {
    case 'listing_pending':
      return 'Listing';
    case 'listing_approved':
      return 'Listing';
    case 'listing_rejected':
      return 'Listing';
    case 'listing_updated':
      return 'Listing';
    case 'message_received':
      return 'Message';
    case 'inquiry_received':
      return 'Inquiry';
    case 'system':
    default:
      return 'System';
  }
}

function notificationIcon(type: NotificationType): string {
  switch (type) {
    case 'listing_pending':
      return '⌂';
    case 'listing_approved':
      return '✓';
    case 'listing_rejected':
      return '×';
    case 'listing_updated':
      return '✎';
    case 'message_received':
      return '✉';
    case 'inquiry_received':
      return '?';
    case 'system':
    default:
      return 'i';
  }
}

function notificationsHref(status: NotificationReadFilter, type: NotificationGroupFilter, page: number): string {
  const params = new URLSearchParams();

  if (status !== 'all') params.set('status', status);
  if (type !== 'all') params.set('type', type);
  if (page > 1) params.set('page', page.toString());

  const query = params.toString();
  return query ? `/dashboard/notifications?${query}` : '/dashboard/notifications';
}

function FilterLink({
  active,
  children,
  href,
}: {
  active: boolean;
  children: string;
  href: string;
}) {
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

function NotificationActions({ notification }: { notification: NotificationListItem }) {
  return (
    <div className="flex flex-wrap gap-2">
      <form action={notification.isRead ? markNotificationUnreadAction : markNotificationReadAction}>
        <input name="notificationId" type="hidden" value={notification.id} />
        <button className="inline-flex h-9 items-center justify-center rounded-md border border-stone-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-estate-300 hover:text-estate-700">
          {notification.isRead ? 'Mark unread' : 'Mark read'}
        </button>
      </form>
      <form action={deleteNotificationAction}>
        <input name="notificationId" type="hidden" value={notification.id} />
        <button className="inline-flex h-9 items-center justify-center rounded-md border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50">
          Delete
        </button>
      </form>
    </div>
  );
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const user = await requireAuth();
  const result = await getUserNotificationsPage(user.id, (await searchParams) ?? {});

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-estate-soft">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-estate-700">Notification center</p>
              <h1 className="mt-2 text-3xl font-semibold text-charcoal-950">Notifications</h1>
              <p className="mt-2 text-slate-600">Review account, listing, inquiry, and message updates.</p>
            </div>
            <form action={markAllNotificationsReadAction}>
              <button className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-estate-700">
                Mark all as read
              </button>
            </form>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <FilterLink active={result.status === 'all'} href={notificationsHref('all', result.type, 1)}>
              All
            </FilterLink>
            <FilterLink active={result.status === 'unread'} href={notificationsHref('unread', result.type, 1)}>
              Unread
            </FilterLink>
            <FilterLink active={result.status === 'read'} href={notificationsHref('read', result.type, 1)}>
              Read
            </FilterLink>
          </div>

          <form action="/dashboard/notifications" className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input name="status" type="hidden" value={result.status} />
            <select
              className="h-11 rounded-lg border border-stone-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-estate-700 focus:ring-2 focus:ring-estate-700/10"
              defaultValue={result.type}
              name="type"
            >
              <option value="all">All types</option>
              <option value="listings">Listings</option>
              <option value="messages">Messages</option>
              <option value="inquiries">Inquiries</option>
              <option value="system">System</option>
            </select>
            <button className="h-11 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-estate-700">
              Apply type
            </button>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-lg border border-stone-200 px-5 text-sm font-semibold text-slate-700 transition hover:border-estate-300 hover:text-estate-700"
              href="/dashboard/notifications"
            >
              Clear
            </Link>
          </form>
        </section>

        {result.notifications.length === 0 ? (
          <section className="mt-6 rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center shadow-estate-soft">
            <h2 className="text-xl font-semibold text-charcoal-950">No notifications yet.</h2>
          </section>
        ) : (
          <section className="mt-6 grid gap-3">
            {result.notifications.map((notification) => (
              <article
                className={`rounded-lg border p-5 shadow-sm ${
                  notification.isRead ? 'border-stone-200 bg-white' : 'border-emerald-200 bg-emerald-50/60'
                }`}
                key={notification.id}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-sm font-semibold text-estate-700">
                      {notificationIcon(notification.type)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-charcoal-950">{notification.title}</h2>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-stone-200">
                          {typeLabel(notification.type)}
                        </span>
                        {!notification.isRead ? (
                          <span className="rounded-full bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white">
                            Unread
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            Read
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{notification.message}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <time className="text-xs font-medium text-slate-500" dateTime={notification.createdAt.toISOString()}>
                          {formatDate(notification.createdAt)}
                        </time>
                        {notification.href ? (
                          <Link
                            className="text-xs font-semibold text-estate-700 transition hover:text-estate-800"
                            href={notification.href}
                          >
                            Open related item
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <NotificationActions notification={notification} />
                </div>
              </article>
            ))}
          </section>
        )}

        <nav className="mt-6 flex flex-col items-center justify-between gap-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:flex-row">
          {result.hasPreviousPage ? (
            <Link
              className="inline-flex h-10 min-w-24 items-center justify-center rounded-md border border-stone-200 px-4 text-sm font-semibold text-slate-700 hover:border-estate-300 hover:text-estate-700"
              href={notificationsHref(result.status, result.type, result.currentPage - 1)}
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
              className="inline-flex h-10 min-w-24 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-estate-700"
              href={notificationsHref(result.status, result.type, result.currentPage + 1)}
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
