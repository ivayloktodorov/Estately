'use client';

import { FormEvent, useState } from 'react';

interface UploadResponse {
  status: 'success' | 'error';
  data?: {
    imageUrl: string;
    key: string;
  };
  error?: {
    message: string;
  };
}

export default function TestR2Page() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setError('Choose an image file first.');
      return;
    }

    setIsUploading(true);
    setError('');
    setImageUrl('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/test-r2-upload', {
        method: 'POST',
        body: formData,
      });
      const payload = (await response.json()) as UploadResponse;

      if (!response.ok || payload.status !== 'success' || !payload.data) {
        throw new Error(payload.error?.message ?? 'Upload failed.');
      }

      setImageUrl(payload.data.imageUrl);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-estate-700">Smoke test</p>
        <h1 className="mt-2 text-3xl font-semibold text-charcoal-950">Cloudflare R2 upload</h1>
      </div>

      <form className="flex flex-col gap-4 rounded-lg border border-[var(--border)] bg-white p-5 shadow-estate-soft" onSubmit={handleSubmit}>
        <input
          accept="image/jpeg,image/png,image/webp"
          className="rounded-md border border-[var(--border)] bg-cream-50 px-3 py-2 text-sm"
          name="image"
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />

        <button
          className="w-fit rounded-md bg-estate-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isUploading}
          type="submit"
        >
          {isUploading ? 'Uploading...' : 'Upload test image'}
        </button>
      </form>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {imageUrl ? (
        <section className="flex flex-col gap-4">
          <img
            alt="Uploaded R2 test"
            className="max-h-[420px] w-full rounded-lg border border-[var(--border)] object-contain"
            src={imageUrl}
          />
          <a className="break-all text-sm font-medium text-estate-700 underline" href={imageUrl} rel="noreferrer" target="_blank">
            {imageUrl}
          </a>
        </section>
      ) : null}
    </main>
  );
}
