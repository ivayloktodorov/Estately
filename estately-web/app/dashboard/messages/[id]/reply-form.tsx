'use client';

import { useActionState, useRef, useState, type FormEvent } from 'react';
import { sendMessageAction, type MessageActionState } from '@/lib/messages/actions';

const initialState: MessageActionState = {
  status: 'idle',
  message: '',
};

export function ReplyForm({ conversationId }: { conversationId: number }) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [state, action, isPending] = useActionState(async (previous: MessageActionState, formData: FormData) => {
    const result = await sendMessageAction(previous, formData);
    if (result.status === 'success') {
      formRef.current?.reset();
      setSelectedFileName(null);
    }
    return result;
  }, initialState);

  function removeSelectedFile() {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setSelectedFileName(null);
  }

  function resizeTextarea(event: FormEvent<HTMLTextAreaElement>) {
    event.currentTarget.style.height = 'auto';
    event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 180)}px`;
  }

  return (
    <form
      action={action}
      className="rounded-lg border border-stone-200 bg-white p-3 shadow-estate-soft sm:p-4"
      ref={formRef}
    >
      <input name="conversationId" type="hidden" value={conversationId} />
      <label className="grid gap-2 text-sm font-semibold text-slate-700" htmlFor="message-reply-body">
        Reply
        <textarea
          className="max-h-44 min-h-20 resize-none rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm leading-6 text-charcoal-950 outline-none transition placeholder:text-slate-400 focus:border-estate-700 focus:ring-2 focus:ring-estate-700/10"
          id="message-reply-body"
          maxLength={2000}
          name="body"
          onInput={resizeTextarea}
          placeholder="Write a message..."
        />
      </label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md border border-stone-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-estate-300 hover:text-estate-700 focus-within:ring-2 focus-within:ring-estate-700 focus-within:ring-offset-2">
          Attach file
          <input
            accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,image/jpeg,image/png,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            name="attachment"
            onChange={(event) => setSelectedFileName(event.target.files?.[0]?.name ?? null)}
            ref={fileInputRef}
            type="file"
          />
        </label>
        {selectedFileName ? (
          <div className="flex min-w-0 items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <span className="truncate">{selectedFileName}</span>
            <button
              className="shrink-0 text-sm font-semibold text-estate-700 transition hover:text-estate-800"
              disabled={isPending}
              onClick={removeSelectedFile}
              type="button"
            >
              Remove
            </button>
          </div>
        ) : null}
      </div>
      {state.status === 'error' ? (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{state.message}</p>
      ) : null}
      <div className="mt-4 flex justify-end">
        <button
          aria-label={isPending ? 'Sending reply' : 'Send reply'}
          className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-estate-700 px-5 text-sm font-semibold text-white shadow-estate-soft transition hover:bg-estate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700 focus-visible:ring-offset-2 disabled:opacity-60 sm:w-auto"
          disabled={isPending}
        >
          {isPending ? 'Sending...' : 'Send reply'}
        </button>
      </div>
    </form>
  );
}
