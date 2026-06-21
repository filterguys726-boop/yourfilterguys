"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import type { ProductImage } from "@/lib/types";

export function ProductCardGallery({
  href,
  images
}: {
  href: string;
  images: ProductImage[];
}) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultipleImages = images.length > 1;

  function goTo(index: number) {
    const slider = sliderRef.current;
    const nextIndex = (index + images.length) % images.length;

    setActiveIndex(nextIndex);
    slider?.scrollTo({
      left: slider.clientWidth * nextIndex,
      behavior: "smooth"
    });
  }

  function updateActiveImage() {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    setActiveIndex(Math.round(slider.scrollLeft / slider.clientWidth));
  }

  return (
    <div className="relative bg-white">
      <div
        ref={sliderRef}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={updateActiveImage}
      >
        {images.map((image) => (
          <Link
            key={image.url}
            href={href}
            className="block min-w-full snap-center"
            aria-label={`View product details for ${image.alt}`}
          >
            <Image
              src={image.url}
              alt={image.alt}
              width={900}
              height={700}
              unoptimized
              className="aspect-[4/3] w-full object-contain p-3"
            />
          </Link>
        ))}
      </div>

      {hasMultipleImages ? (
        <>
          <div className="absolute bottom-3 left-3 flex gap-1.5 rounded-md bg-white/90 px-2 py-1 shadow-sm">
            {images.map((image, index) => (
              <button
                key={image.url}
                type="button"
                aria-label={`Show image ${index + 1}`}
                className={`h-1.5 rounded-full transition ${
                  index === activeIndex ? "w-5 bg-electric" : "w-1.5 bg-slate-300"
                }`}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
          <span className="absolute bottom-3 right-3 rounded-md bg-ink/90 px-2 py-1 text-xs font-bold text-white shadow-sm">
            {activeIndex + 1}/{images.length}
          </span>
          <div className="absolute inset-y-0 left-2 flex items-center">
            <button
              type="button"
              aria-label="Previous product photo"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white/92 text-ink shadow-sm transition hover:bg-white focus-ring"
              onClick={() => goTo(activeIndex - 1)}
            >
              <ArrowLeft aria-hidden className="h-4 w-4" />
            </button>
          </div>
          <div className="absolute inset-y-0 right-2 flex items-center">
            <button
              type="button"
              aria-label="Next product photo"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white/92 text-ink shadow-sm transition hover:bg-white focus-ring"
              onClick={() => goTo(activeIndex + 1)}
            >
              <ArrowRight aria-hidden className="h-4 w-4" />
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
