import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/src/db/client';
import { properties, propertyMessages, users } from '@/src/db/schema';
import { logoutAction, requireAuth } from '@/lib/auth';

export const metadata = {
  title: 'Inquiries - Estately',
  description: 'Review property inquiries from prospective buyers and renters.',
};

function formatInquiryDate(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default async function DashboardInquiriesPage() {
  const user = await requireAuth();

  const baseQuery = db
    .select({
      id: propertyMessages.id,
      message: propertyMessages.message,
      createdAt: propertyMessages.createdAt,
      propertyTitle: properties.title,
      propertyId: properties.id,
      senderName: users.fullName,
      senderEmail: users.email,
    })
    .from(propertyMessages)
    .innerJoin(properties, eq(propertyMessages.propertyId, properties.id))
    .innerJoin(users, eq(propertyMessages.userId, users.id));

  const inquiries =
    user.role === 'admin'
      ? await baseQuery.orderBy(desc(propertyMessages.createdAt))
      : await baseQuery
          .where(eq(properties.createdByUserId, user.id))
          .orderBy(desc(propertyMessages.createdAt));

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link className="text-xl font-semibold text-slate-950" href="/">
            Estately
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link className="font-medium text-slate-700 hover:text-emerald-700" href="/dashboard">
              Dashboard
            </Link>
            <Link className="font-medium text-emerald-700" href="/dashboard/inquiries">
              Inquiries
            </Link>
            <Link className="font-medium text-slate-700 hover:text-emerald-700" href="/dashboard/properties/new">
              Add Property
            </Link>
            <form action={logoutAction}>
              <button className="rounded-md border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:border-emerald-700 hover:text-emerald-700">
                Logout
              </button>
            </form>
          </div>
        </nav>

        <section className="rounded-lg border border-stone-200 bg-white p-8 shadow-estate-soft">
          <p className="text-sm font-semibold uppercase tracking-wide text-estate-700">
            Property inquiries
          </p>
          <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-semibold text-charcoal-950">Received messages</h1>
              <p className="mt-2 max-w-2xl text-slate-600">
                {user.role === 'admin'
                  ? 'Review all inquiries submitted across Estately listings.'
                  : 'Review inquiries submitted for properties you created.'}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          {inquiries.length > 0 ? (
            <div className="grid gap-4">
              {inquiries.map((inquiry) => (
                <article
                  className="rounded-lg border border-stone-200 bg-white p-5 shadow-estate-soft"
                  key={inquiry.id}
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <Link
                        className="text-lg font-semibold text-charcoal-950 hover:text-estate-700"
                        href={`/properties/${inquiry.propertyId}`}
                      >
                        {inquiry.propertyTitle}
                      </Link>
                      <p className="mt-1 text-sm text-slate-600">
                        From {inquiry.senderName} · {inquiry.senderEmail}
                      </p>
                    </div>
                    <time className="text-sm font-medium text-slate-500" dateTime={inquiry.createdAt.toISOString()}>
                      {formatInquiryDate(inquiry.createdAt)}
                    </time>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap rounded-lg bg-cream-50 p-4 text-sm leading-6 text-charcoal-950">
                    {inquiry.message}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center shadow-estate-soft">
              <h2 className="text-2xl font-semibold text-charcoal-950">No inquiries yet</h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-600">
                New messages from interested buyers and renters will appear here.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
