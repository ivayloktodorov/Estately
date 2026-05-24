import Link from 'next/link';
import type { ReactNode } from 'react';
import { requireAuth } from '@/lib/auth';
import { formatCurrencyEUR } from '@/lib/format/currency';
import { getUserOffers, type OfferListItem } from '@/lib/offers/service';
import { updatePropertyOfferStatusAction } from '@/lib/offers/actions';

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function statusClass(status: OfferListItem['status']): string {
  switch (status) {
    case 'accepted':
      return 'border-estate-200 bg-estate-50 text-estate-800';
    case 'rejected':
      return 'border-red-200 bg-red-50 text-red-700';
    case 'pending':
    default:
      return 'border-amber-200 bg-amber-50 text-amber-800';
  }
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-cream-50 p-6 text-sm font-medium text-slate-600">
      {children}
    </div>
  );
}

export default async function DashboardOffersPage() {
  const user = await requireAuth();
  const { received, submitted } = await getUserOffers(user.id);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-stone-200 bg-white p-8 shadow-estate-soft">
          <p className="text-sm font-semibold uppercase tracking-wide text-estate-700">Offers</p>
          <h1 className="mt-3 text-3xl font-semibold text-charcoal-950">Property offers</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Review offers received for your listings and track the proposals you submitted.
          </p>
        </section>

        <section className="mt-8 rounded-lg border border-stone-200 bg-white p-6 shadow-estate-soft">
          <h2 className="text-2xl font-semibold text-charcoal-950">Offers received</h2>
          <div className="mt-5 grid gap-4">
            {received.length === 0 ? (
              <EmptyState>No offers received yet.</EmptyState>
            ) : (
              received.map((offer) => (
                <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm" key={offer.id}>
                  <div className="flex flex-col justify-between gap-4 lg:flex-row">
                    <div>
                      <Link className="text-lg font-semibold text-charcoal-950 hover:text-estate-700" href={`/properties/${offer.propertyId}`}>
                        {offer.propertyTitle}
                      </Link>
                      <p className="mt-1 text-sm text-slate-600">
                        {offer.buyerName} · {offer.buyerEmail}
                      </p>
                      <p className="mt-3 text-2xl font-bold text-charcoal-950">{formatCurrencyEUR(offer.amount)}</p>
                      {offer.message ? <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{offer.message}</p> : null}
                      <time className="mt-3 block text-xs font-medium uppercase tracking-wide text-slate-500" dateTime={offer.createdAt.toISOString()}>
                        {formatDate(offer.createdAt)}
                      </time>
                    </div>
                    <div className="flex shrink-0 flex-col gap-3 sm:min-w-48">
                      <span className={`inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm font-semibold capitalize ${statusClass(offer.status)}`}>
                        {offer.status}
                      </span>
                      {offer.status === 'pending' ? (
                        <div className="grid grid-cols-2 gap-2">
                          <form action={updatePropertyOfferStatusAction}>
                            <input name="offerId" type="hidden" value={offer.id} />
                            <input name="status" type="hidden" value="accepted" />
                            <button className="h-10 w-full rounded-lg bg-estate-700 px-4 text-sm font-semibold text-white hover:bg-estate-800" type="submit">
                              Accept
                            </button>
                          </form>
                          <form action={updatePropertyOfferStatusAction}>
                            <input name="offerId" type="hidden" value={offer.id} />
                            <input name="status" type="hidden" value="rejected" />
                            <button className="h-10 w-full rounded-lg border border-stone-300 bg-white px-4 text-sm font-semibold text-charcoal-950 hover:border-red-300 hover:bg-red-50 hover:text-red-700" type="submit">
                              Reject
                            </button>
                          </form>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-stone-200 bg-white p-6 shadow-estate-soft">
          <h2 className="text-2xl font-semibold text-charcoal-950">Offers submitted</h2>
          <div className="mt-5 grid gap-4">
            {submitted.length === 0 ? (
              <EmptyState>No submitted offers yet.</EmptyState>
            ) : (
              submitted.map((offer) => (
                <article className="flex flex-col justify-between gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center" key={offer.id}>
                  <div>
                    <Link className="font-semibold text-charcoal-950 hover:text-estate-700" href={`/properties/${offer.propertyId}`}>
                      {offer.propertyTitle}
                    </Link>
                    <p className="mt-2 text-xl font-bold text-charcoal-950">{formatCurrencyEUR(offer.amount)}</p>
                    <time className="mt-1 block text-xs font-medium uppercase tracking-wide text-slate-500" dateTime={offer.createdAt.toISOString()}>
                      {formatDate(offer.createdAt)}
                    </time>
                  </div>
                  <span className={`inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm font-semibold capitalize ${statusClass(offer.status)}`}>
                    {offer.status}
                  </span>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
