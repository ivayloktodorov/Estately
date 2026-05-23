'use client';

import { useActionState, useRef } from 'react';
import { sendMessageAction, type MessageActionState } from '@/lib/messages/actions';

const initialState: MessageActionState = {
  status: 'idle',
  message: '',
};

export function ReplyForm({ conversationId }: { conversationId: number }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, isPending] = useActionState(async (previous: MessageActionState, formData: FormData) => {
    const result = await sendMessageAction(previous, formData);
    if (result.status === 'success') {
      formRef.current?.reset();
    }
    return result;
  }, initialState);

  return (
    <form action={action} className="rounded-lg border border-stone-200 bg-white p-4 shadow-estate-soft" ref={formRef}>
      <input name="conversationId" type="hidden" value={conversationId} />
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Reply
        <textarea
          className="min-h-28 rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm leading-6 text-charcoal-950 outline-none transition placeholder:text-slate-400 focus:border-estate-700 focus:ring-2 focus:ring-estate-700/10"
          maxLength={2000}
          name="body"
          placeholder="Write a message..."
          required
        />
      </label>
      {state.status === 'error' ? (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{state.message}</p>
      ) : null}
      <div className="mt-4 flex justify-end">
        <button
          className="inline-flex h-11 items-center justify-center rounded-lg bg-estate-700 px-5 text-sm font-semibold text-white shadow-estate-soft transition hover:bg-estate-800 disabled:opacity-60"
          disabled={isPending}
        >
          {isPending ? 'Sending...' : 'Send reply'}
        </button>
      </div>
    </form>
  );
}
