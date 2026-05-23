'use client';

export function DeleteMessageButton() {
  return (
    <button
      className="inline-flex h-9 items-center justify-center rounded-md border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50"
      onClick={(event) => {
        if (!window.confirm('Delete this message? Attachments on this message will also be removed from the conversation.')) {
          event.preventDefault();
        }
      }}
      type="submit"
    >
      Delete message
    </button>
  );
}

export function DeleteAttachmentButton({ fileName }: { fileName: string }) {
  return (
    <button
      className="inline-flex h-8 items-center justify-center rounded-md border border-red-200 bg-white px-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
      onClick={(event) => {
        if (!window.confirm(`Delete attachment "${fileName}" from this conversation?`)) {
          event.preventDefault();
        }
      }}
      type="submit"
    >
      Delete
    </button>
  );
}
