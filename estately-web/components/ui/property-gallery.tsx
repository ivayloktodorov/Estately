'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

interface PropertyGalleryProps {
  mainImage: string;
  title: string;
  allImages?: string[];
}

export function PropertyGallery({
  mainImage,
  title,
  allImages = [],
}: PropertyGalleryProps) {
  const images = useMemo(() => [...new Set([mainImage, ...allImages])].slice(0, 10), [allImages, mainImage]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const selectedImage = images[selectedIndex] ?? mainImage;

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsLightboxOpen(false);
      }

      if (event.key === 'ArrowRight') {
        setSelectedIndex((current) => (current + 1) % images.length);
      }

      if (event.key === 'ArrowLeft') {
        setSelectedIndex((current) => (current - 1 + images.length) % images.length);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, isLightboxOpen]);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <button
        aria-label="Open property gallery"
        className="relative block w-full overflow-hidden rounded-2xl bg-stone-100 aspect-video"
        onClick={() => setIsLightboxOpen(true)}
        type="button"
      >
        <Image
          src={selectedImage}
          alt={title}
          fill
          priority
          sizes="(min-width: 1024px) 70vw, 100vw"
          className="h-full w-full object-cover transition-all duration-300"
        />
        
        {/* Image Badge */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </button>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative overflow-hidden rounded-lg aspect-square transition-all duration-200 ${
                selectedIndex === index
                  ? 'ring-2 ring-estate-700 shadow-lg'
                  : 'ring-1 ring-stone-200 hover:shadow-md'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${title} - Image ${index + 1}`}
                fill
                loading="lazy"
                sizes="(min-width: 768px) 96px, 25vw"
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </button>
          ))}
        </div>
      )}

      {isLightboxOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button
            aria-label="Close gallery"
            className="absolute right-4 top-4 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            onClick={() => setIsLightboxOpen(false)}
            type="button"
          >
            Close
          </button>
          {images.length > 1 ? (
            <button
              aria-label="Previous image"
              className="absolute left-4 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full bg-white/10 text-2xl font-semibold text-white backdrop-blur transition hover:bg-white/20"
              onClick={() => setSelectedIndex((current) => (current - 1 + images.length) % images.length)}
              type="button"
            >
              ‹
            </button>
          ) : null}
          <div className="relative h-[80vh] w-full max-w-6xl">
            <Image
              alt={`${title} - Image ${selectedIndex + 1}`}
              className="object-contain"
              fill
              sizes="100vw"
              src={selectedImage}
            />
          </div>
          {images.length > 1 ? (
            <button
              aria-label="Next image"
              className="absolute right-4 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full bg-white/10 text-2xl font-semibold text-white backdrop-blur transition hover:bg-white/20"
              onClick={() => setSelectedIndex((current) => (current + 1) % images.length)}
              type="button"
            >
              ›
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
