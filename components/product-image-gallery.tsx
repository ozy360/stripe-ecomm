'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProductImageGalleryProps {
  images: { url: string }[];
  name: string;
}

export default function ProductImageGallery({
  images,
  name,
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images?.[0]?.url);

  if (!images || images.length === 0) {
    return (
      <div className="bg-card relative overflow-hidden rounded-lg p-10">
        <div className="bg-secondary/20 relative flex aspect-square w-full items-center justify-center">
          <span className="text-muted-foreground">No image available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card relative overflow-hidden rounded-lg p-10">
        <div className="relative aspect-square w-full">
          <img
            src={selectedImage}
            alt={name}
            className="h-full w-full object-contain"
          />
        </div>
      </div>
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              className={cn(
                'relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 bg-white',
                selectedImage === image.url
                  ? 'border-primary'
                  : 'hover:border-muted-foreground/25 border-transparent',
              )}
              onClick={() => setSelectedImage(image.url)}
            >
              <img
                src={image.url}
                alt={`${name} thumbnail ${index + 1}`}
                className="h-full w-full object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
