'use client';

interface DeletePropertyButtonProps {
  title: string;
}

export function DeletePropertyButton({ title }: DeletePropertyButtonProps) {
  return (
    <button
      className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-red-300 bg-white px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50"
      onClick={(event) => {
        const confirmed = window.confirm(`Delete "${title}"? This cannot be undone.`);

        if (!confirmed) {
          event.preventDefault();
        }
      }}
      type="submit"
    >
      <span aria-hidden="true">⌫</span>
      Delete
    </button>
  );
}
