"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import type { CatalogProduct } from "@/lib/types";
import { useRef } from "react";

export function FeaturedPartsSlider({
  products
}: {
  products: CatalogProduct[];
}) {
  const sliderRef = useRef<HTMLDivElement>(null);

  function move(direction: "prev" | "next") {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    const card = slider.querySelector<HTMLElement>("[data-featured-card]");
    const distance = card ? card.offsetWidth + 20 : slider.clientWidth * 0.82;

    slider.scrollBy({
      left: direction === "next" ? distance : -distance,
      behavior: "smooth"
    });
  }

  return (
    <div className="relative">
      <div
        ref={sliderRef}
        className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 pt-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product, index) => (
          <div
            key={product.id}
            data-featured-card
            className="min-w-[84%] snap-center sm:min-w-[430px] lg:min-w-[460px]"
          >
            <div
              className={[
                "transition duration-300",
                index === 0 ? "lg:rotate-[-1deg]" : "",
                index === 1 ? "lg:rotate-[1deg]" : "",
                index === 2 ? "lg:rotate-[-0.5deg]" : ""
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <ProductCard product={product} className="shadow-panel" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-slate-600">
          Swipe or tap through featured inventory.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous featured part"
            className="button-secondary h-10 w-10 px-0"
            onClick={() => move("prev")}
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next featured part"
            className="button-secondary h-10 w-10 px-0"
            onClick={() => move("next")}
          >
            <ArrowRight aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
