"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  if (!selectedImage) {
    return null;
  }

  return (
    <div className="grid gap-3">
      <div className="surface overflow-hidden bg-white">
        <Image
          src={selectedImage.url}
          alt={selectedImage.alt}
          width={900}
          height={900}
          unoptimized
          className="aspect-square w-full object-contain p-3"
        />
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((image) => {
            const selected = image.url === selectedImage.url;

            return (
              <button
                key={image.url}
                type="button"
                className={`overflow-hidden rounded-lg border bg-white transition focus-ring ${
                  selected
                    ? "border-electric ring-2 ring-electric/20"
                    : "border-slate-200 hover:border-slate-400"
                }`}
                onClick={() => setSelectedImage(image)}
                aria-label={`View ${image.alt}`}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  width={240}
                  height={180}
                  unoptimized
                  className="aspect-square w-full object-contain p-2"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
