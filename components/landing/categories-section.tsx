"use client";

import { useEffect, useState } from "react";
import { getCategoryIconPath } from "@/components/admin/categories-data";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  products: number;
}

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/categories`,
        );
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const active = json.data.filter((c: any) => c.status === "Active");
          active.sort(
            (a: any, b: any) => (b.products || 0) - (a.products || 0),
          );
          setCategories(active);
        }
      } catch (err) {
        console.error("❌ FAILED to fetch categories!", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section
        id="categories"
        className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10"
      >
        <div className="flex gap-3 overflow-hidden sm:flex-wrap sm:justify-center sm:gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex h-[110px] w-[110px] sm:h-[130px] sm:w-[150px] shrink-0 animate-pulse flex-col items-center justify-center rounded-xl border border-line bg-surface p-3"
            >
              <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-surface-strong" />
              <div className="mt-2 h-2.5 w-12 rounded bg-surface-strong" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section
      id="categories"
      className="mx-auto w-full max-w-7xl px-0 sm:px-8 lg:px-10 py-6 sm:py-10"
    >
      <div className="overflow-hidden px-5 sm:px-0 py-4" ref={emblaRef}>
        <motion.div
          className="flex gap-3 sm:flex-wrap sm:justify-center sm:gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {categories.map((category) => (
            <motion.a
              key={category.id}
              variants={itemVariants}
              href={`/shop?category=${category.id}`}
              className="group flex h-[110px] w-[110px] sm:h-[140px] sm:w-[150px] shrink-0 flex-col rounded-xl items-center justify-center border border-line bg-surface p-3 text-center transition-all hover:bg-surface-strong hover:-translate-y-0.5 duration-300"
              aria-label={`Browse ${category.name}`}
            >
              <span className="flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 mb-1 transition-transform group-hover:scale-110 duration-300">
                <img
                  src={getCategoryIconPath(category.icon)}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </span>
              <span className="text-[12px] sm:text-md font-medium text-foreground text-center truncate w-full px-1">
                {category.name}
              </span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
