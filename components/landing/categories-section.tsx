"use client";

import { useEffect, useState } from "react";
import { getCategoryIconPath } from "@/components/admin/categories-data";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  show: {
    opacity: 1,
    y: 0,
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/categories`,
        );
        const json = await res.json();
        console.log("🏷️ API Categories response:", json);
        if (json.success && Array.isArray(json.data)) {
          // Only show active categories
          const active = json.data.filter((c: any) => c.status === "Active");
          // Sort descending from most products to least
          active.sort((a: any, b: any) => (b.products || 0) - (a.products || 0));
          console.log("🏷️ Rendering active categories sorted by product count:", active);
          setCategories(active);
        }
      } catch (err) {
        console.error("❌ FAILED to fetch categories from backend!", err);
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
        <div className="flex flex-wrap justify-center gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex h-[130px] w-[150px] animate-pulse flex-col items-center justify-center rounded-lg border border-line bg-surface px-4 py-4"
            >
              <div className="h-7 w-7 rounded-full bg-surface-strong" />
              <div className="mt-3 h-3 w-16 rounded bg-surface-strong" />
              <div className="mt-1.5 h-2 w-10 rounded bg-surface-strong" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section
      id="categories"
      className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10 py-8"
    >
      <motion.div 
        className="flex flex-wrap justify-center gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {categories.map((category) => {
          return (
            <motion.a
              key={category.id}
              variants={itemVariants}
              href={`/shop?category=${category.id}`}
              className="group flex h-[140px] w-[150px] shrink-0 flex-col rounded-lg items-center justify-center border border-line bg-surface px-4 py-4 text-center transition-all hover:bg-surface-strong hover:-translate-y-0.5 duration-300"
              aria-label={`Browse ${category.name}`}
            >
              <span className="flex items-center justify-center w-20 h-20 mb-1 transition-transform group-hover:scale-110 duration-300">
                <img
                  src={getCategoryIconPath(category.icon)}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </span>
              <span className="text-md font-medium text-foreground text-center truncate w-full px-1">
                {category.name}
              </span>
            </motion.a>
          );
        })}
      </motion.div>
    </section>
  );
}
