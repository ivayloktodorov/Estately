import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { getAdminConversations, type AdminMessagesSearchParams } from '@/lib/admin/messages';
import { AdminNavigation } from '../admin-navigation';

interface AdminMessagesPageProps {
  searchParams?: Promise<AdminMessagesSearchParams>;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function preview(message: string): string {
  return message.length > 120 ? `${message.slice(0, 120)}...` : message;
}

function messagesHref(search: string, sort: string, page: number): string {
  const params = new URLSearchParams();

  if (search) params.set('search', search);
  if (sort !== 'newest') params.set('sort', sort);
  if (page > 1) params.set('page', page.toString());

  const query = params.toString();
  return query ? `/admin/messages?${query}` : '/admin/messages';
}

export default async function AdminMessagesPage({ searchParams }: AdminMessagesPageProps) {
  await requireAdmin();
  const result = await getAdminConversations((await searchParams) ?? {});

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <AdminNavigation active="messages" />

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Messaging oversight</p>
          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">Messages</h1>
              <p className="mt-2 text-slate-600">
                Review property conversations, inspect attachments, and remove unsafe message content.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
              {result.totalCount} total
            </span>
          </div>

          <form action="/admin/messages" className="mt-6 grid gap-3 lg:grid-cols-[1fr_180px_auto_auto]">
            <label className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-950 focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/10">
              <span aria-hidden="true" className="text-slate-500">
                ⌕
              </span>
              <input
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400"
                defaultValue={result.search}
                name="search"
                placeholder="Search property, buyer, owner, or email"
                type="search"
              />
            </label>
            <select
              className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10"
              defaultValue={result.sort}
              name="sort"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
            <button className="h-11 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700">
              Apply
            </button>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
              href="/admin/messages"
            >
              Clear
            </Link>
          </form>
        </section>

        {result.conversations.length === 0 ? (
          <section className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">No conversations found.</h2>
          </section>
        ) : (
          <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="hidden lg:block">
              <table className="min-w-full table-fixed divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="w-24 px-4 py-3">ID</th>
                    <th className="w-[24%] px-4 py-3">Property</th>
                    <th className="w-[20%] px-4 py-3">Buyer</th>
                    <th className="w-[20%] px-4 py-3">Owner</th>
                    <th className="w-[24%] px-4 py-3">Last message</th>
                    <th className="w-32 px-4 py-3">Counts</th>
                    <th className="w-28 px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {result.conversations.map((conversation) => (
                    <tr className="align-top" key={conversation.id}>
                      <td className="px-4 py-5 font-mono text-xs text-slate-500">#{conversation.id}</td>
                      <td className="px-4 py-5">
                        <Link
                          className="font-semibold text-slate-950 transition hover:text-emerald-700"
                          href={`/admin/messages/${conversation.id}`}
                        >
                          {conversation.propertyTitle}
                        </Link>
                        <p className="mt-1 font-mono text-xs text-slate-500">Property #{conversation.propertyId}</p>
                      </td>
                      <td className="px-4 py-5">
                        <p className="font-semibold text-slate-950">{conversation.buyer.fullName}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">{conversation.buyer.email}</p>
                      </td>
                      <td className="px-4 py-5">
                        <p className="font-semibold text-slate-950">{conversation.owner.fullName}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">{conversation.owner.email}</p>
                      </td>
                      <td className="px-4 py-5">
                        <p className="line-clamp-2 text-slate-700">{preview(conversation.lastMessagePreview)}</p>
                        <time className="mt-2 block text-xs font-medium text-slate-500" dateTime={conversation.lastMessageDate.toISOString()}>
                          {formatDate(conversation.lastMessageDate)}
                        </time>
                      </td>
                      <td className="px-4 py-5">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {conversation.messageCount} messages
                        </span>
                        {conversation.unreadCount > 0 ? (
                          <span className="mt-2 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                            {conversation.unreadCount} unread
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-5">
                        <Link
                          className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                          href={`/admin/messages/${conversation.id}`}
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-4 p-4 lg:hidden">
              {result.conversations.map((conversation) => (
                <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={conversation.id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-slate-500">Conversation #{conversation.id}</p>
                      <Link
                        className="mt-1 block truncate font-semibold text-slate-950 transition hover:text-emerald-700"
                        href={`/admin/messages/${conversation.id}`}
                      >
                        {conversation.propertyTitle}
                      </Link>
                      <p className="mt-1 font-mono text-xs text-slate-500">Property #{conversation.propertyId}</p>
                    </div>
                    <Link
                      className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                      href={`/admin/messages/${conversation.id}`}
                    >
                      Review
                    </Link>
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div className="min-w-0">
                      <dt className="text-slate-500">Buyer</dt>
                      <dd className="font-semibold text-slate-950">{conversation.buyer.fullName}</dd>
                      <dd className="truncate text-xs text-slate-500">{conversation.buyer.email}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-slate-500">Owner</dt>
                      <dd className="font-semibold text-slate-950">{conversation.owner.fullName}</dd>
                      <dd className="truncate text-xs text-slate-500">{conversation.owner.email}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Counts</dt>
                      <dd className="mt-1 flex flex-wrap gap-2">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {conversation.messageCount} messages
                        </span>
                        {conversation.unreadCount > 0 ? (
                          <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                            {conversation.unreadCount} unread
                          </span>
                        ) : null}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Last message</dt>
                      <dd>
                        <time className="text-xs font-medium text-slate-500" dateTime={conversation.lastMessageDate.toISOString()}>
                          {formatDate(conversation.lastMessageDate)}
                        </time>
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-4 line-clamp-3 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {preview(conversation.lastMessagePreview)}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        <nav className="mt-6 flex flex-col items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
          {result.hasPreviousPage ? (
            <Link
              className="inline-flex h-10 min-w-24 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
              href={messagesHref(result.search, result.sort, result.currentPage - 1)}
            >
              Previous
            </Link>
          ) : (
            <span className="inline-flex h-10 min-w-24 items-center justify-center rounded-md border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-400">
              Previous
            </span>
          )}
          <p className="text-sm font-semibold text-slate-600">
            Page <span className="text-slate-950">{result.currentPage}</span> of{' '}
            <span className="text-slate-950">{result.totalPages}</span>
          </p>
          {result.hasNextPage ? (
            <Link
              className="inline-flex h-10 min-w-24 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
              href={messagesHref(result.search, result.sort, result.currentPage + 1)}
            >
              Next
            </Link>
          ) : (
            <span className="inline-flex h-10 min-w-24 items-center justify-center rounded-md border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-400">
              Next
            </span>
          )}
        </nav>
      </div>
    </main>
  );
}
