import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { getUserConversations } from '@/lib/messages/service';
import { propertyImageUrl } from '@/lib/properties/images';

/* eslint-disable @next/next/no-img-element */

export const metadata = {
  title: 'Messages - Estately',
  description: 'View and reply to your property conversations.',
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function preview(message: string): string {
  return message.length > 120 ? `${message.slice(0, 120)}...` : message;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default async function MessagesPage() {
  const user = await requireAuth();
  let conversations;

  try {
    conversations = await getUserConversations(user.id);
  } catch {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <section className="rounded-lg border border-red-200 bg-white p-8 text-center shadow-estate-soft">
            <h1 className="text-2xl font-semibold text-charcoal-950">Unable to load inbox</h1>
            <p className="mt-2 text-slate-600">Please refresh the page or try again in a moment.</p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-estate-soft">
          <p className="text-sm font-semibold uppercase tracking-wide text-estate-700">Inbox</p>
          <h1 className="mt-2 text-3xl font-semibold text-charcoal-950">Messages</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Continue conversations with buyers, renters, and property owners.
          </p>
        </section>

        <section className="mt-6" aria-label="Conversation list">
          {conversations.length > 0 ? (
            <div className="grid gap-3">
              {conversations.map((conversation) => {
                const isUnread = conversation.unreadCount > 0;

                return (
                  <Link
                    className={`block rounded-lg border p-4 shadow-estate-soft transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700 focus-visible:ring-offset-2 sm:p-5 ${
                      isUnread
                        ? 'border-emerald-200 bg-emerald-50/70 hover:border-emerald-300'
                        : 'border-stone-200 bg-white hover:border-estate-300 hover:shadow-lg'
                    }`}
                    href={`/dashboard/messages/${conversation.id}`}
                    key={conversation.id}
                  >
                    <div className="grid gap-4 sm:grid-cols-[96px_1fr]">
                      <img
                        alt=""
                        className="aspect-video w-full rounded-lg object-cover sm:h-24 sm:w-24"
                        src={propertyImageUrl(conversation.propertyImageCoverUrl)}
                      />
                      <div className="min-w-0">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2
                                className={`truncate text-lg ${
                                  isUnread ? 'font-bold text-charcoal-950' : 'font-semibold text-charcoal-950'
                                }`}
                              >
                                {conversation.propertyTitle}
                              </h2>
                              {isUnread ? (
                                <span className="inline-flex rounded-full bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white">
                                  {conversation.unreadCount} unread
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-2 flex min-w-0 items-center gap-2">
                              {conversation.otherParticipantAvatarUrl ? (
                                <img
                                  alt=""
                                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                                  src={conversation.otherParticipantAvatarUrl}
                                />
                              ) : (
                                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-estate-700 ring-1 ring-stone-200">
                                  {initials(conversation.otherParticipantName)}
                                </span>
                              )}
                              <p className="min-w-0 truncate text-sm text-slate-600">
                                {conversation.otherParticipantName} · {conversation.propertyCity}
                              </p>
                            </div>
                          </div>
                          <time
                            className="shrink-0 text-sm font-medium text-slate-500"
                            dateTime={conversation.lastMessageAt.toISOString()}
                          >
                            {formatDate(conversation.lastMessageAt)}
                          </time>
                        </div>
                        <p className={`mt-3 text-sm leading-6 ${isUnread ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                          {preview(conversation.lastMessagePreview)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center shadow-estate-soft">
              <h2 className="text-2xl font-semibold text-charcoal-950">No conversations yet.</h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-600">
                Conversations will appear here after someone contacts a listing owner.
              </p>
              <Link
                className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-estate-700 px-5 text-sm font-semibold text-white shadow-estate-soft transition hover:bg-estate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700 focus-visible:ring-offset-2"
                href="/properties"
              >
                Browse properties
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
