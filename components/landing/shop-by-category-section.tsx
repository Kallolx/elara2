"use client";

import { useCallback, useEffect, useState } from "react";
import { ProductCard } from "./product-card";
import { LogoLoader } from "@/components/ui/logo-loader";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { getCategoryIconPath } from "@/components/admin/categories-data";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 45 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function ShopByCategorySection() {
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: "start", containScroll: "trimSnaps", loop: false },
    [Autoplay({ delay: 3500, stopOnInteraction: true })],
  );

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );

  // Seamless Pre-loader: Fetch Categories and a massive batch of products ONCE
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

        const [catRes, prodRes] = await Promise.all([
          fetch(`${apiBase}/categories`),
          fetch(`${apiBase}/products?limit=250`),
        ]);

        const catJson = await catRes.json();
        const prodJson = await prodRes.json();

        if (prodJson.success && Array.isArray(prodJson.data)) {
          setAllProducts(prodJson.data);
        }

        if (catJson.success && Array.isArray(catJson.data)) {
          const active = catJson.data.filter((c: any) => c.status === "Active");
          active.sort(
            (a: any, b: any) => (b.products || 0) - (a.products || 0),
          );
          setCategories(active);
          if (active.length > 0) {
            setActiveCategory(active[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch initial category data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Compute live products natively (0 latency)
  const displayProducts = allProducts
    .filter((p) => p.categoryId === activeCategory)
    .slice(0, 20);

  // Instantly reset carousel track when category tabs switch
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
      emblaApi.scrollTo(0, true);
    }
  }, [activeCategory, emblaApi]);

  if (loading || categories.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10 pb-10">
      <motion.div
        className="mb-8 flex flex-col sm:flex-row items-center justify-between sm:text-left gap-4"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h2 className="flex items-center gap-2 sm:gap-3 text-2xl sm:text-3xl md:text-4xl font-serif text-text">
            <img
              src="/category-icon.png"
              alt="Category"
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain shrink-0"
            />
            Shop by Category
          </h2>
        </div>

        {/* Desktop Navigation Arrows */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={scrollPrev}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-text transition-all hover:bg-surface-strong hover:scale-105 cursor-pointer"
          >
            <FiChevronLeft className="text-xl" />
          </button>
          <button
            onClick={scrollNext}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-text transition-all hover:bg-surface-strong hover:scale-105 cursor-pointer"
          >
            <FiChevronRight className="text-xl" />
          </button>
        </div>
      </motion.div>

      {/* Category Pills - Full Bleed Row on Mobile */}
      <motion.div
        className="flex overflow-x-auto hide-scrollbar gap-3 py-2 px-5 -mx-5 mb-6 sm:mx-0 sm:px-1"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center whitespace-nowrap px-5 py-2.5 rounded-full text-sm  transition-colors duration-200 ${
              activeCategory === cat.id
                ? "bg-accent text-white"
                : "bg-surface border border-line text-text-soft hover:text-foreground hover:bg-surface-strong hover:border-text-soft/30"
            }`}
          >
            <img
              src={getCategoryIconPath(cat.icon)}
              alt=""
              className="w-6 h-6 object-contain shrink-0"
            />
            <span className="whitespace-nowrap leading-none">{cat.name}</span>
          </button>
        ))}
      </motion.div>

      {/* Slider Viewport (Seamless Render Engine) */}
      <div className="relative min-h-[300px]">
        {displayProducts.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-text-soft">
            <p>No products available in this category yet.</p>
          </div>
        ) : null}

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-4 touch-pan-y">
            {displayProducts.map((product) => (
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

      {activeCategory && (
        <div className="mt-8 flex justify-center">
          <Link
            href={`/shop?category=${activeCategory}`}
            className="inline-flex h-12 items-center justify-center rounded-full border border-line px-10 text-sm font-medium text-text transition-all duration-300 hover:bg-text hover:text-background hover:border-text"
          >
            View All in Category
          </Link>
        </div>
      )}
    </section>
  );
}
