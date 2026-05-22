'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { submitPropertyInquiryAction } from '@/lib/inquiries/actions';
import type { InquiryActionState } from '@/lib/inquiries/types';

const initialState: InquiryActionState = {
  status: 'idle',
  message: '',
};

interface PropertyInquiryFormProps {
  isAuthenticated: boolean;
  propertyId: number;
}

export function PropertyInquiryForm({ isAuthenticated, propertyId }: PropertyInquiryFormProps) {
  const submitAction = submitPropertyInquiryAction.bind(null, propertyId);
  const [state, formAction, pending] = useActionState(submitAction, initialState);
  const messageError = state.errors?.message;

  if (!isAuthenticated) {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white p-8 shadow-estate-soft">
        <h2 className="text-2xl font-bold text-charcoal-950">Contact about this property</h2>
        <p className="mt-3 text-slate-600">
          Sign in to send a private inquiry to the listing owner.
        </p>
        <Link
          className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-estate-700 px-5 text-sm font-semibold text-white shadow-estate-soft transition hover:bg-estate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700 focus-visible:ring-offset-2"
          href="/login"
        >
          Login to contact agent
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-8 shadow-estate-soft">
      <h2 className="text-2xl font-bold text-charcoal-950">Contact about this property</h2>
      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-charcoal-950" htmlFor="message">
            Message
          </label>
          <textarea
            aria-describedby={messageError ? 'message-error' : undefined}
            aria-invalid={Boolean(messageError)}
            className={`min-h-36 w-full resize-y rounded-lg border bg-white px-4 py-3 text-base text-charcoal-950 shadow-sm outline-none transition placeholder:text-stone-400 focus:ring-2 ${
              messageError
                ? 'border-red-300 focus:border-red-700 focus:ring-red-100'
                : 'border-stone-300 focus:border-estate-700 focus:ring-cream-200'
            }`}
            defaultValue={state.status === 'success' ? '' : state.fields?.message}
            disabled={pending}
            id="message"
            maxLength={1000}
            minLength={10}
            name="message"
            placeholder="I would like to know more about this property."
            required
          />
          {messageError ? (
            <p className="mt-2 text-sm text-red-700" id="message-error">
              {messageError}
            </p>
          ) : null}
        </div>

        {state.message ? (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              state.status === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {state.message}
          </div>
        ) : null}

        <button
          className="h-12 w-full rounded-lg bg-charcoal-950 px-5 font-semibold text-white shadow-estate-soft transition hover:bg-charcoal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-400 sm:w-auto"
          disabled={pending}
          type="submit"
        >
          {pending ? 'Sending inquiry...' : 'Send inquiry'}
        </button>
      </form>
    </section>
  );
}
