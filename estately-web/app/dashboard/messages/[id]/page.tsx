import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { getConversationForUser } from '@/lib/messages/service';
import { ReplyForm } from './reply-form';

interface ConversationPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatPrice(price: string): string {
  return `$${Number(price).toLocaleString()}`;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const user = await requireAuth();
  const { id } = await params;
  const conversationId = Number(id);

  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    notFound();
  }

  const conversation = await getConversationForUser(conversationId, user.id);

  if (!conversation) {
    notFound();
  }

  const otherParticipant = user.id === conversation.owner.id ? conversation.buyer : conversation.owner;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link className="text-sm font-semibold text-estate-700 hover:text-estate-800" href="/dashboard/messages">
          Back to messages
        </Link>

        <section className="mt-5 rounded-lg border border-stone-200 bg-white p-6 shadow-estate-soft">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-estate-700">Conversation</p>
              <h1 className="mt-2 text-3xl font-semibold text-charcoal-950">{conversation.property.title}</h1>
              <p className="mt-2 text-slate-600">
                {conversation.property.city} · {formatPrice(conversation.property.price)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                With {otherParticipant.fullName} · {otherParticipant.email}
              </p>
            </div>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-stone-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-estate-300 hover:text-estate-700"
              href={`/properties/${conversation.property.id}`}
            >
              View listing
            </Link>
          </div>
        </section>

        <section className="mt-6 grid gap-4">
          {conversation.messages.map((message) => {
            const isOwn = message.senderUserId === user.id;

            return (
              <article className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`} key={message.id}>
                <div
                  className={`max-w-[min(680px,90%)] rounded-2xl px-4 py-3 shadow-sm ${
                    isOwn
                      ? 'rounded-br-md bg-estate-700 text-white'
                      : 'rounded-bl-md border border-stone-200 bg-white text-charcoal-950'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={`text-xs font-semibold ${isOwn ? 'text-emerald-50' : 'text-slate-600'}`}>
                      {message.senderName}
                    </p>
                    <time className={`text-xs ${isOwn ? 'text-emerald-50/80' : 'text-slate-400'}`} dateTime={message.createdAt.toISOString()}>
                      {formatDate(message.createdAt)}
                    </time>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.body}</p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-6">
          <ReplyForm conversationId={conversation.id} />
        </section>
      </div>
    </main>
  );
}
