"use client";

import { useEffect, useState } from "react";
import { getCategoryIconPath } from "@/components/admin/categories-data";

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
        if (json.success) {
          // Only show active categories
          setCategories(json.data.filter((c: any) => c.status === "Active"));
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
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
        <div className="mb-8 text-center">
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
            Categories
          </h2>
        </div>
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
      className="mx-auto w-full max-w-7xl px-5 py-4 sm:px-8 lg:px-10 pb-8"
    >
      <div className="mb-8 text-center pt-4">
        <h2 className="text-3xl font-serif text-text sm:text-4xl">
          Categories
        </h2>
      </div>

      {/* Centered Dynamic Row Layout - preserving original brand borders & colors */}
      <div className="flex flex-wrap justify-center gap-4">
        {categories.map((category) => {
          return (
            <a
              key={category.id}
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
            </a>
          );
        })}
      </div>
    </section>
  );
}
