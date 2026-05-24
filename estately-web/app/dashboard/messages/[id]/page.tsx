import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { getConversationForUser } from '@/lib/messages/service';
import { propertyImageUrl } from '@/lib/properties/images';
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageAttachment(fileType: string): boolean {
  return fileType.startsWith('image/');
}

function attachmentHref(attachmentId: number): string {
  return `/api/messages/attachments/${attachmentId}`;
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

export default async function ConversationPage({ params }: ConversationPageProps) {
  const user = await requireAuth();
  const { id } = await params;
  const conversationId = Number(id);

  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    notFound();
  }

  let conversation;

  try {
    conversation = await getConversationForUser(conversationId, user.id);
  } catch {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <section className="rounded-lg border border-red-200 bg-white p-8 text-center shadow-estate-soft">
            <h1 className="text-2xl font-semibold text-charcoal-950">Unable to load conversation</h1>
            <p className="mt-2 text-slate-600">Please refresh the page or return to your inbox.</p>
            <Link
              className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-estate-700 px-4 text-sm font-semibold text-white"
              href="/dashboard/messages"
            >
              Back to messages
            </Link>
          </section>
        </div>
      </main>
    );
  }

  if (!conversation) {
    notFound();
  }

  const otherParticipant = user.id === conversation.owner.id ? conversation.buyer : conversation.owner;

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          className="inline-flex rounded-md text-sm font-semibold text-estate-700 hover:text-estate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700 focus-visible:ring-offset-2"
          href="/dashboard/messages"
        >
          Back to messages
        </Link>

        <section className="mt-5 rounded-lg border border-stone-200 bg-white p-4 shadow-estate-soft sm:p-6">
          <div className="grid gap-4 md:grid-cols-[140px_1fr_auto] md:items-center">
            <Image
              alt=""
              className="aspect-video w-full rounded-lg object-cover md:h-28 md:w-36"
              height={112}
              src={propertyImageUrl(conversation.property.imageCoverUrl, conversation.property.propertyType)}
              width={144}
              sizes="(min-width: 768px) 144px, 100vw"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-wide text-estate-700">Conversation</p>
              <h1 className="mt-2 truncate text-2xl font-semibold text-charcoal-950 sm:text-3xl">
                {conversation.property.title}
              </h1>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                {conversation.property.city} · {formatPrice(conversation.property.price)}
              </p>
              <div className="mt-3 flex min-w-0 items-center gap-2">
                {otherParticipant.avatarUrl ? (
                  <Image alt="" className="h-9 w-9 rounded-full object-cover" height={36} src={otherParticipant.avatarUrl} width={36} />
                ) : (
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-estate-700 ring-1 ring-emerald-100">
                    {initials(otherParticipant.fullName)}
                  </span>
                )}
                <p className="min-w-0 truncate text-sm text-slate-500">
                  With <span className="font-semibold text-slate-700">{otherParticipant.fullName}</span> ·{' '}
                  {otherParticipant.email}
                </p>
              </div>
            </div>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-stone-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-estate-300 hover:text-estate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700 focus-visible:ring-offset-2"
              href={`/properties/${conversation.property.id}`}
            >
              View listing
            </Link>
          </div>
        </section>

        <section className="mt-6 grid gap-4" aria-label="Message thread">
          {conversation.messages.length === 0 ? (
            <div className="rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center shadow-estate-soft">
              <h2 className="text-xl font-semibold text-charcoal-950">No messages yet.</h2>
            </div>
          ) : null}
          {conversation.messages.map((message) => {
            const isOwn = message.senderUserId === user.id;

            return (
              <article className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`} key={message.id}>
                {!isOwn ? (
                  message.senderAvatarUrl ? (
                    <Image alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" height={32} src={message.senderAvatarUrl} width={32} />
                  ) : (
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-estate-700 ring-1 ring-stone-200">
                      {initials(message.senderName)}
                    </span>
                  )
                ) : null}
                <div
                  className={`max-w-[min(720px,86%)] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[78%] ${
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
                  {message.body ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.body}</p> : null}
                  {message.attachments.length > 0 ? (
                    <div className="mt-3 grid gap-2">
                      {message.attachments.map((attachment) =>
                        isImageAttachment(attachment.fileType) ? (
                          <a
                            className="block overflow-hidden rounded-lg border border-white/30 bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700 focus-visible:ring-offset-2"
                            href={attachmentHref(attachment.id)}
                            key={attachment.id}
                            rel="noreferrer"
                            target="_blank"
                          >
                            <Image
                              alt={attachment.fileName}
                              className="max-h-56 w-full max-w-sm object-cover"
                              height={224}
                              src={attachmentHref(attachment.id)}
                              width={384}
                              sizes="(min-width: 640px) 384px, 86vw"
                              unoptimized
                            />
                          </a>
                        ) : (
                          <a
                            className={`flex min-w-0 items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                              isOwn
                                ? 'border-white/25 bg-white/10 text-white hover:bg-white/15'
                                : 'border-stone-200 bg-slate-50 text-slate-700 hover:border-estate-300'
                            }`}
                            href={attachmentHref(attachment.id)}
                            key={attachment.id}
                            rel="noreferrer"
                            target="_blank"
                          >
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                                isOwn ? 'bg-white/20 text-white' : 'bg-white text-estate-700'
                              }`}
                            >
                              FILE
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate font-semibold">{attachment.fileName}</span>
                              <span className={`block text-xs ${isOwn ? 'text-emerald-50/80' : 'text-slate-500'}`}>
                                {formatFileSize(attachment.fileSize)}
                              </span>
                            </span>
                          </a>
                        ),
                      )}
                    </div>
                  ) : null}
                </div>
                {isOwn ? (
                  message.senderAvatarUrl ? (
                    <Image alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" height={32} src={message.senderAvatarUrl} width={32} />
                  ) : (
                    <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-estate-700 text-xs font-bold text-white ring-1 ring-estate-700 sm:inline-flex">
                      {initials(message.senderName)}
                    </span>
                  )
                ) : null}
              </article>
            );
          })}
        </section>

        <section className="sticky bottom-0 mt-6 -mx-3 border-t border-stone-200 bg-slate-50/95 px-3 py-3 backdrop-blur sm:static sm:mx-0 sm:border-t-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <ReplyForm conversationId={conversation.id} />
        </section>
      </div>
    </main>
  );
}
