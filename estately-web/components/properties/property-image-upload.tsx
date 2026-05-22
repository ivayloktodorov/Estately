'use client';

import { ChangeEvent, FormEvent, useState } from 'react';

interface PropertyImageUploadProps {
  propertyId: number;
}

interface UploadResponse {
  status: 'success' | 'error';
  data?: {
    imageUrl: string;
  };
  error?: {
    message: string;
  };
}

export function PropertyImageUpload({ propertyId }: PropertyImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setMessage(null);
    setError(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setError('Choose an image before uploading.');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);
    setIsUploading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/properties/${propertyId}/images`, {
        method: 'POST',
        body: formData,
      });
      const result = (await response.json()) as UploadResponse;

      if (!response.ok || result.status === 'error') {
        throw new Error(result.error?.message ?? 'Unable to upload image.');
      }

      setMessage('Image uploaded successfully.');
      setSelectedFile(null);
      setPreviewUrl(result.data?.imageUrl ?? null);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form className="mt-5 space-y-4 rounded-xl border border-stone-200 bg-cream-50 p-4" onSubmit={handleSubmit}>
      <label className="block text-sm font-semibold text-charcoal-950" htmlFor={`image-${propertyId}`}>
        Add listing photo
      </label>
      <input
        accept="image/jpeg,image/png,image/webp"
        className="block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-charcoal-950 shadow-sm file:mr-4 file:rounded-md file:border-0 file:bg-estate-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
        id={`image-${propertyId}`}
        onChange={handleFileChange}
        type="file"
      />

      {previewUrl ? (
        <div className="relative aspect-video overflow-hidden rounded-lg bg-stone-200">
          <img
            alt="Selected property upload preview"
            className="h-full w-full object-cover"
            src={previewUrl}
          />
        </div>
      ) : null}

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      {message ? <p className="text-sm font-medium text-estate-700">{message}</p> : null}

      <button
        className="h-11 rounded-lg bg-charcoal-950 px-5 text-sm font-semibold text-white shadow-estate-soft transition hover:bg-charcoal-800 disabled:cursor-wait disabled:bg-stone-400"
        disabled={isUploading}
        type="submit"
      >
        {isUploading ? 'Uploading...' : 'Upload image'}
      </button>
    </form>
  );
}
