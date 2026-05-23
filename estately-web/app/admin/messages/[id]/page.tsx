import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { getAdminConversation } from '@/lib/admin/messages';
import { DeleteAttachmentButton, DeleteMessageButton } from '../moderation-buttons';
import { deleteAttachmentAction, deleteMessageAction } from '../actions';

interface AdminConversationPageProps {
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

export default async function AdminConversationPage({ params }: AdminConversationPageProps) {
  await requireAdmin();
  const { id } = await params;
  const conversationId = Number(id);

  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    notFound();
  }

  const conversation = await getAdminConversation(conversationId);

  if (!conversation) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <Link className="text-xl font-semibold text-slate-950" href="/admin">
            Estately Admin
          </Link>
          <Link className="text-sm font-semibold text-emerald-700 hover:text-emerald-800" href="/admin/messages">
            Back to messages
          </Link>
        </nav>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Conversation #{conversation.id}
          </p>
          <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">{conversation.property.title}</h1>
              <p className="mt-2 text-slate-600">
                {conversation.property.city} · {formatPrice(conversation.property.price)}
              </p>
            </div>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
              href={`/properties/${conversation.property.id}`}
            >
              View listing
            </Link>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Buyer</p>
            <p className="mt-2 font-semibold text-slate-950">{conversation.buyer.fullName}</p>
            <p className="mt-1 text-sm text-slate-600">{conversation.buyer.email}</p>
            <p className="mt-2 font-mono text-xs text-slate-500">User #{conversation.buyer.id}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Owner</p>
            <p className="mt-2 font-semibold text-slate-950">{conversation.owner.fullName}</p>
            <p className="mt-1 text-sm text-slate-600">{conversation.owner.email}</p>
            <p className="mt-2 font-mono text-xs text-slate-500">User #{conversation.owner.id}</p>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-sm font-semibold text-amber-900">Moderation actions are destructive.</p>
          <p className="mt-1 text-sm leading-6 text-amber-800">
            Delete individual messages or attachments only after review. This page does not let admins send replies.
          </p>
        </section>

        <section className="mt-6 grid gap-4">
          {conversation.messages.map((message) => (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={message.id}>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-950">{message.senderName}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      {message.senderUserId === conversation.buyer.id ? 'Buyer' : 'Owner'}
                    </span>
                    {!message.isRead ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                        Unread
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{message.senderEmail}</p>
                  <time className="mt-2 block text-xs font-medium text-slate-500" dateTime={message.createdAt.toISOString()}>
                    {formatDate(message.createdAt)}
                  </time>
                </div>
                <form action={deleteMessageAction}>
                  <input name="messageId" type="hidden" value={message.id} />
                  <DeleteMessageButton />
                </form>
              </div>

              {message.body ? (
                <p className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800">
                  {message.body}
                </p>
              ) : (
                <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm italic text-slate-500">
                  Attachment-only message
                </p>
              )}

              {message.attachments.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {message.attachments.map((attachment) => (
                    <div
                      className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                      key={attachment.id}
                    >
                      <a
                        className="flex min-w-0 items-center gap-3 text-sm text-slate-700 transition hover:text-emerald-700"
                        href={attachmentHref(attachment.id)}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {isImageAttachment(attachment.fileType) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt=""
                            className="h-14 w-14 shrink-0 rounded-md object-cover"
                            src={attachmentHref(attachment.id)}
                          />
                        ) : (
                          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-emerald-700">
                            FILE
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{attachment.fileName}</span>
                          <span className="mt-1 block text-xs text-slate-500">
                            {attachment.fileType} · {formatFileSize(attachment.fileSize)}
                          </span>
                        </span>
                      </a>
                      <form action={deleteAttachmentAction}>
                        <input name="attachmentId" type="hidden" value={attachment.id} />
                        <DeleteAttachmentButton fileName={attachment.fileName} />
                      </form>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
