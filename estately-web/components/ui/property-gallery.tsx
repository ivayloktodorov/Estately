'use client';

import Image from 'next/image';
import { TouchEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  const touchStartXRef = useRef<number | null>(null);
  const selectedImage = images[selectedIndex] ?? mainImage;
  const hasMultipleImages = images.length > 1;

  const showNextImage = useCallback(() => {
    if (!hasMultipleImages) return;
    setSelectedIndex((current) => (current + 1) % images.length);
  }, [hasMultipleImages, images.length]);

  const showPreviousImage = useCallback(() => {
    if (!hasMultipleImages) return;
    setSelectedIndex((current) => (current - 1 + images.length) % images.length);
  }, [hasMultipleImages, images.length]);

  function handleTouchStart(event: TouchEvent) {
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent) {
    const startX = touchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartXRef.current = null;

    if (startX === null || endX === undefined || Math.abs(startX - endX) < 44) {
      return;
    }

    if (startX > endX) {
      showNextImage();
      return;
    }

    showPreviousImage();
  }

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsLightboxOpen(false);
      }

      if (event.key === 'ArrowRight') {
        showNextImage();
      }

      if (event.key === 'ArrowLeft') {
        showPreviousImage();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, showNextImage, showPreviousImage]);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <button
        aria-label="Open property gallery"
        className="relative block aspect-video w-full overflow-hidden rounded-2xl bg-stone-100"
        onClick={() => setIsLightboxOpen(true)}
        onTouchEnd={handleTouchEnd}
        onTouchStart={handleTouchStart}
        type="button"
      >
        <Image
          key={selectedImage}
          src={selectedImage}
          alt={title}
          fill
          priority
          sizes="(min-width: 1024px) 70vw, 100vw"
          className="h-full w-full object-cover opacity-100 transition duration-300 ease-out"
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
        <div className="flex snap-x gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-square w-20 shrink-0 snap-start overflow-hidden rounded-lg transition-all duration-200 sm:w-24 ${
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onTouchEnd={handleTouchEnd}
          onTouchStart={handleTouchStart}
        >
          <button
            aria-label="Close gallery"
            className="absolute right-4 top-4 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            onClick={() => setIsLightboxOpen(false)}
            type="button"
          >
            Close
          </button>
          {hasMultipleImages ? (
            <button
              aria-label="Previous image"
              className="absolute left-4 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full bg-white/10 text-2xl font-semibold text-white backdrop-blur transition hover:bg-white/20"
              onClick={showPreviousImage}
              type="button"
            >
              ‹
            </button>
          ) : null}
          <div className="relative h-[80vh] w-full max-w-6xl">
            <Image
              key={`lightbox-${selectedImage}`}
              alt={`${title} - Image ${selectedIndex + 1}`}
              className="object-contain transition duration-300 ease-out"
              fill
              sizes="100vw"
              src={selectedImage}
            />
          </div>
          {hasMultipleImages ? (
            <button
              aria-label="Next image"
              className="absolute right-4 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full bg-white/10 text-2xl font-semibold text-white backdrop-blur transition hover:bg-white/20"
              onClick={showNextImage}
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
