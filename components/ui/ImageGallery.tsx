"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Fallback if no images are provided
  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[4/5] bg-black/5 rounded-[2rem] flex items-center justify-center">
        <span className="opacity-40">No Image Available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 sticky top-32">
      {/* Thumbnails - Desktop: Vertical Left, Mobile: Horizontal Bottom (or hidden/scrollable) */}
      <div className="flex md:flex-col gap-3 order-2 md:order-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImageIndex(idx)}
            className={`relative w-20 h-24 md:w-24 md:h-32 rounded-md overflow-hidden flex-shrink-0 transition-all duration-300 border-2 ${
              activeImageIndex === idx 
                ? "border-slate-200 opacity-100" 
                : "border-transparent opacity-50 hover:opacity-100 bg-black/5"
            }`}
          >
            <Image 
              src={img} 
              alt={`${productName} thumbnail ${idx + 1}`} 
              fill 
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative flex-1 aspect-[4/5] bg-black/5 rounded-[2rem] overflow-hidden order-1 md:order-2">
        <Image
          src={images[activeImageIndex]}
          alt={`${productName} main view`}
          fill
          priority
          className="object-cover transition-opacity duration-500"
        />
      </div>
    </div>
  );
}
