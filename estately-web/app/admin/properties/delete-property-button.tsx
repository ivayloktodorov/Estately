'use client';

interface DeletePropertyButtonProps {
  title: string;
}

export function DeletePropertyButton({ title }: DeletePropertyButtonProps) {
  return (
    <button
      className="inline-flex h-8 items-center justify-center rounded-md border border-red-200 px-3 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50"
      onClick={(event) => {
        const confirmed = window.confirm(`Delete "${title}"? This cannot be undone.`);

        if (!confirmed) {
          event.preventDefault();
        }
      }}
      type="submit"
    >
      Delete
    </button>
  );
}
