import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { getUserConversations } from '@/lib/messages/service';

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

export default async function MessagesPage() {
  const user = await requireAuth();
  const conversations = await getUserConversations(user.id);

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

        <section className="mt-6">
          {conversations.length > 0 ? (
            <div className="grid gap-3">
              {conversations.map((conversation) => (
                <Link
                  className="block rounded-lg border border-stone-200 bg-white p-5 shadow-estate-soft transition hover:border-estate-300 hover:shadow-lg"
                  href={`/dashboard/messages/${conversation.id}`}
                  key={conversation.id}
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-lg font-semibold text-charcoal-950">
                          {conversation.propertyTitle}
                        </h2>
                        {conversation.unreadCount > 0 ? (
                          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                            {conversation.unreadCount} unread
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        {conversation.propertyCity} · {conversation.otherParticipantName}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        {preview(conversation.lastMessagePreview)}
                      </p>
                    </div>
                    <time className="shrink-0 text-sm font-medium text-slate-500" dateTime={conversation.lastMessageAt.toISOString()}>
                      {formatDate(conversation.lastMessageAt)}
                    </time>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center shadow-estate-soft">
              <h2 className="text-2xl font-semibold text-charcoal-950">No messages yet</h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-600">
                Conversations will appear here after someone contacts a listing owner.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
