'use client';

import { useState } from 'react';

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
  const [selectedImage, setSelectedImage] = useState(mainImage);
  
  // Combine main image with additional images
  const images = [mainImage, ...allImages].slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-stone-100 aspect-video">
        <img
          src={selectedImage}
          alt={title}
          className="h-full w-full object-cover transition-all duration-300"
        />
        
        {/* Image Badge */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium">
            1 / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(image)}
              className={`relative overflow-hidden rounded-lg aspect-square transition-all duration-200 ${
                selectedImage === image
                  ? 'ring-2 ring-estate-700 shadow-lg'
                  : 'ring-1 ring-stone-200 hover:shadow-md'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={image}
                alt={`${title} - Image ${index + 1}`}
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
