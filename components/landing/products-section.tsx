"use client";

import { useCallback, useEffect, useState } from "react";
import { ProductCard } from "./product-card";
import { LogoLoader } from "@/components/ui/logo-loader";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export function ProductsSection() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      containScroll: "trimSnaps",
      loop: true,
    },
    [
      Autoplay({
        delay: 3500,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ],
  );

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );

  useEffect(() => {
    const loadRecentProducts = async () => {
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

        // Directly fetch list of all products
        const res = await fetch(`${apiBase}/products`);
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          // 1. Force sort descending by most recently created
          const sorted = [...json.data].sort((a: any, b: any) => {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });

          // 2. Slice top 20 items exactly as requested
          setProducts(sorted.slice(0, 20));
        }
      } catch (err) {
        console.error("Failed to fetch recent arrivals:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRecentProducts();
  }, []);

  if (loading) {
    return (
      <section
        id="shop"
        className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-10"
      >
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <LogoLoader size="md" />
          <p className="text-sm text-text-soft">Unveiling recent arrivals...</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section
      id="shop"
      className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10"
    >
      <div className="mb-6 flex flex-col items-center justify-between sm:flex-row sm:text-left">
        <div>
          <h2 className="text-3xl font-serif text-text sm:text-4xl">
            Recent Arrivals
          </h2>
        </div>

        {/* Navigation Arrows Inline Desktop, Bottom on Mobile */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={scrollPrev}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-text transition-all hover:bg-surface-strong hover:scale-105 cursor-pointer"
            aria-label="Previous"
          >
            <FiChevronLeft className="text-xl" />
          </button>
          <button
            onClick={scrollNext}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-text transition-all hover:bg-surface-strong hover:scale-105 cursor-pointer"
            aria-label="Next"
          >
            <FiChevronRight className="text-xl" />
          </button>
        </div>
      </div>

      {/* Slider Viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4 touch-pan-y">
          {products.map((product) => (
            <div
              key={product.id || product.slug}
              className="min-w-0 pl-4 flex-[0_0_75%] sm:flex-[0_0_45%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%]"
            >
              <div className="h-full py-2">
                <ProductCard product={product} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Navigation arrows */}
      <div className="mt-6 flex justify-center gap-3 sm:hidden">
        <button
          onClick={scrollPrev}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-text"
        >
          <FiChevronLeft className="text-xl" />
        </button>
        <button
          onClick={scrollNext}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-text"
        >
          <FiChevronRight className="text-xl" />
        </button>
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/shop"
          className="inline-flex h-12 items-center justify-center rounded-full border border-line px-10 text-sm font-medium text-text transition-all duration-300 hover:bg-text hover:text-background hover:border-text"
        >
          Explore Collection
        </Link>
      </div>
    </section>
  );
}
