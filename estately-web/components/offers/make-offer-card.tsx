'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { submitPropertyOfferAction } from '@/lib/offers/actions';
import type { OfferActionState } from '@/lib/offers/types';

const initialState: OfferActionState = {
  status: 'idle',
  message: '',
};

interface MakeOfferCardProps {
  isAuthenticated: boolean;
  propertyId: number;
  currentUserIsOwner: boolean;
  shouldOpen?: boolean;
}

function authHref(pathname: '/login' | '/register', propertyId: number): string {
  const redirect = `/properties/${propertyId}?intent=offer`;
  const params = new URLSearchParams({ redirect });

  return `${pathname}?${params.toString()}`;
}

export function MakeOfferCard({
  currentUserIsOwner,
  isAuthenticated,
  propertyId,
  shouldOpen = false,
}: MakeOfferCardProps) {
  const [isOpen, setIsOpen] = useState(shouldOpen);
  const submitAction = submitPropertyOfferAction.bind(null, propertyId);
  const [state, formAction, pending] = useActionState(submitAction, initialState);
  const amountError = state.errors?.amount;
  const messageError = state.errors?.message;

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-estate-100 bg-estate-50 p-6 shadow-estate-soft">
        <button
          className="h-11 w-full rounded-lg bg-estate-700 px-5 text-sm font-semibold text-white shadow-estate-soft transition hover:bg-estate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700 focus-visible:ring-offset-2"
          type="button"
          onClick={() => {
            window.location.href = authHref('/login', propertyId);
          }}
        >
          Make an offer
        </button>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            className="inline-flex h-10 items-center justify-center rounded-lg border border-estate-200 bg-white px-4 text-sm font-semibold text-estate-700 transition hover:border-estate-300 hover:bg-cream-50"
            href={authHref('/login', propertyId)}
          >
            Login
          </Link>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-lg border border-estate-200 bg-white px-4 text-sm font-semibold text-estate-700 transition hover:border-estate-300 hover:bg-cream-50"
            href={authHref('/register', propertyId)}
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  if (currentUserIsOwner) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 text-sm font-medium text-slate-600 shadow-estate-soft">
        You cannot submit an offer on your own property.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-estate-soft">
      <button
        className="h-11 w-full rounded-lg bg-estate-700 px-5 text-sm font-semibold text-white shadow-estate-soft transition hover:bg-estate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700 focus-visible:ring-offset-2"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        Make an offer
      </button>

      {isOpen ? (
        <form action={formAction} className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-charcoal-950" htmlFor="offer-amount">
              Offer amount
            </label>
            <input
              aria-describedby={amountError ? 'offer-amount-error' : undefined}
              aria-invalid={Boolean(amountError)}
              className={`h-11 w-full rounded-lg border bg-white px-4 text-base text-charcoal-950 shadow-sm outline-none transition focus:ring-2 ${
                amountError
                  ? 'border-red-300 focus:border-red-700 focus:ring-red-100'
                  : 'border-stone-300 focus:border-estate-700 focus:ring-cream-200'
              }`}
              defaultValue={state.status === 'success' ? '' : state.fields?.amount}
              disabled={pending}
              id="offer-amount"
              min="1"
              name="amount"
              placeholder="92000"
              required
              step="0.01"
              type="number"
            />
            {amountError ? (
              <p className="mt-2 text-sm text-red-700" id="offer-amount-error">
                {amountError}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-charcoal-950" htmlFor="offer-message">
              Message
            </label>
            <textarea
              aria-describedby={messageError ? 'offer-message-error' : undefined}
              aria-invalid={Boolean(messageError)}
              className={`min-h-28 w-full resize-y rounded-lg border bg-white px-4 py-3 text-base text-charcoal-950 shadow-sm outline-none transition placeholder:text-stone-400 focus:ring-2 ${
                messageError
                  ? 'border-red-300 focus:border-red-700 focus:ring-red-100'
                  : 'border-stone-300 focus:border-estate-700 focus:ring-cream-200'
              }`}
              defaultValue={state.status === 'success' ? '' : state.fields?.message}
              disabled={pending}
              id="offer-message"
              maxLength={1000}
              name="message"
              placeholder="Optional note for the owner"
            />
            {messageError ? (
              <p className="mt-2 text-sm text-red-700" id="offer-message-error">
                {messageError}
              </p>
            ) : null}
          </div>

          {state.message ? (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                state.status === 'success'
                  ? 'border-estate-200 bg-estate-50 text-estate-800'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {state.message}
            </div>
          ) : null}

          <button
            className="h-11 w-full rounded-lg bg-estate-700 px-5 text-sm font-semibold text-white shadow-estate-soft transition hover:bg-estate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-400"
            disabled={pending}
            type="submit"
          >
            {pending ? 'Submitting offer...' : 'Submit offer'}
          </button>
        </form>
      ) : null}
    </div>
  );
}
