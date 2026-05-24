'use client';

import Image from 'next/image';
import { ChangeEvent, FormEvent, useMemo, useState } from 'react';

interface PropertyImageUploadProps {
  propertyId: number;
  initialImages?: PropertyImageItem[];
}

interface PropertyImageItem {
  id: number;
  propertyId: number;
  imageUrl: string;
  sortOrder: number;
  isCover: boolean;
  createdAt: string;
}

interface ImagesResponse {
  status: 'success' | 'error';
  data?: {
    images?: PropertyImageItem[];
  };
  error?: {
    message: string;
  };
}

const maxImages = 10;
const maxFileSizeBytes = 10 * 1024 * 1024;
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

function responseMessage(result: ImagesResponse, fallback: string): string {
  return result.error?.message ?? fallback;
}

function validateFiles(files: File[], existingCount: number): string | null {
  if (files.length === 0) {
    return 'Choose at least one image before uploading.';
  }

  if (existingCount + files.length > maxImages) {
    return `Each property can have up to ${maxImages} images.`;
  }

  const invalidFile = files.find((file) => !allowedTypes.includes(file.type));

  if (invalidFile) {
    return 'Only JPG, JPEG, PNG, and WEBP images are allowed.';
  }

  const oversizedFile = files.find((file) => file.size > maxFileSizeBytes);

  if (oversizedFile) {
    return 'Each image must be 10MB or smaller.';
  }

  return null;
}

export function PropertyImageUpload({ initialImages = [], propertyId }: PropertyImageUploadProps) {
  const [images, setImages] = useState<PropertyImageItem[]>(initialImages);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const orderedImageIds = useMemo(() => images.map((image) => image.id), [images]);

  async function loadImages() {
    setError(null);

    try {
      const response = await fetch(`/api/properties/${propertyId}/images`);
      const result = (await response.json()) as ImagesResponse;

      if (!response.ok || result.status === 'error') {
        throw new Error(responseMessage(result, 'Unable to load images.'));
      }

      setImages(result.data?.images ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load images.');
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles(files);
    setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateFiles(selectedFiles, images.length);

    if (validationError) {
      setError(validationError);
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append('images', file));
    setIsBusy(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/properties/${propertyId}/images`, {
        method: 'POST',
        body: formData,
      });
      const result = (await response.json()) as ImagesResponse;

      if (!response.ok || result.status === 'error') {
        throw new Error(responseMessage(result, 'Unable to upload images.'));
      }

      setMessage('Images uploaded successfully.');
      setSelectedFiles([]);
      setPreviewUrls([]);
      await loadImages();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to upload images.');
    } finally {
      setIsBusy(false);
    }
  };

  async function patchImages(body: { coverImageId?: number; orderedImageIds?: number[] }, successMessage: string) {
    setIsBusy(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/properties/${propertyId}/images`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as ImagesResponse;

      if (!response.ok || result.status === 'error') {
        throw new Error(responseMessage(result, 'Unable to update images.'));
      }

      setMessage(successMessage);
      await loadImages();
    } catch (patchError) {
      setError(patchError instanceof Error ? patchError.message : 'Unable to update images.');
    } finally {
      setIsBusy(false);
    }
  }

  async function deleteImage(imageId: number) {
    setIsBusy(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/properties/${propertyId}/images?imageId=${imageId}`, {
        method: 'DELETE',
      });
      const result = (await response.json()) as ImagesResponse;

      if (!response.ok || result.status === 'error') {
        throw new Error(responseMessage(result, 'Unable to delete image.'));
      }

      setMessage('Image deleted.');
      await loadImages();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete image.');
    } finally {
      setIsBusy(false);
    }
  }

  function moveImage(imageId: number, direction: -1 | 1) {
    const currentIndex = orderedImageIds.indexOf(imageId);
    const targetIndex = currentIndex + direction;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= orderedImageIds.length) {
      return;
    }

    const nextOrder = [...orderedImageIds];
    [nextOrder[currentIndex], nextOrder[targetIndex]] = [nextOrder[targetIndex], nextOrder[currentIndex]];
    void patchImages({ orderedImageIds: nextOrder }, 'Image order updated.');
  }

  return (
    <section className="mt-5 space-y-5 rounded-xl border border-stone-200 bg-cream-50 p-4">
      <div>
        <h3 className="text-sm font-semibold text-charcoal-950">Upload Images</h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Add up to {maxImages} JPG, PNG, or WEBP images. Choose a cover image for listing cards.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          accept="image/jpeg,image/png,image/webp"
          className="block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-charcoal-950 shadow-sm file:mr-4 file:rounded-md file:border-0 file:bg-estate-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          multiple
          onChange={handleFileChange}
          type="file"
        />

        {previewUrls.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {previewUrls.map((url, index) => (
              <div className="relative aspect-square overflow-hidden rounded-lg bg-stone-200" key={url}>
                <Image
                  alt={`Selected property upload preview ${index + 1}`}
                  className="object-cover"
                  fill
                  sizes="120px"
                  src={url}
                  unoptimized
                />
              </div>
            ))}
          </div>
        ) : null}

        <button
          className="h-11 rounded-lg bg-estate-700 px-5 text-sm font-semibold text-white shadow-estate-soft transition hover:bg-estate-800 disabled:cursor-wait disabled:bg-stone-400"
          disabled={isBusy || selectedFiles.length === 0}
          type="submit"
        >
          {isBusy ? 'Uploading...' : 'Upload images'}
        </button>
      </form>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      {message ? <p className="text-sm font-medium text-estate-700">{message}</p> : null}

      {images.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {images.map((image, index) => (
            <article className="rounded-lg border border-stone-200 bg-white p-3 shadow-sm" key={image.id}>
              <div className="relative aspect-video overflow-hidden rounded-md bg-stone-100">
                <Image
                  alt={`Property image ${index + 1}`}
                  className="object-cover"
                  fill
                  loading="lazy"
                  sizes="(min-width: 768px) 260px, 100vw"
                  src={image.imageUrl}
                />
                {image.isCover ? (
                  <span className="absolute left-2 top-2 rounded-full bg-estate-700 px-2.5 py-1 text-xs font-semibold text-white">
                    Cover
                  </span>
                ) : null}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  className="h-9 rounded-md border border-stone-200 px-2 text-xs font-semibold text-slate-700 hover:border-estate-300 hover:text-estate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isBusy || image.isCover}
                  onClick={() => patchImages({ coverImageId: image.id }, 'Cover image updated.')}
                  type="button"
                >
                  Set cover
                </button>
                <button
                  className="h-9 rounded-md border border-red-200 px-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isBusy}
                  onClick={() => deleteImage(image.id)}
                  type="button"
                >
                  Delete
                </button>
                <button
                  className="h-9 rounded-md border border-stone-200 px-2 text-xs font-semibold text-slate-700 hover:border-estate-300 hover:text-estate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isBusy || index === 0}
                  onClick={() => moveImage(image.id, -1)}
                  type="button"
                >
                  Move up
                </button>
                <button
                  className="h-9 rounded-md border border-stone-200 px-2 text-xs font-semibold text-slate-700 hover:border-estate-300 hover:text-estate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isBusy || index === images.length - 1}
                  onClick={() => moveImage(image.id, 1)}
                  type="button"
                >
                  Move down
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-stone-300 bg-white p-4 text-sm text-slate-600">
          No uploaded images yet. The listing will use its fallback cover image until photos are added.
        </p>
      )}
    </section>
  );
}
