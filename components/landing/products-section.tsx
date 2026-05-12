"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "./product-card";
import { LogoLoader } from "@/components/ui/logo-loader";
import Link from "next/link";

export function ProductsSection() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedContent = async () => {
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const [prodRes, settingsRes] = await Promise.all([
          fetch(`${apiBase}/products`),
          fetch(`${apiBase}/site-settings`),
        ]);

        const prodJson = await prodRes.json();
        const settingsJson = await settingsRes.json();

        let finalDisplayProducts = [];

        if (prodJson.success) {
          const allProducts = prodJson.data || [];
          const featuredIds = settingsJson.success
            ? settingsJson.data.featuredProductIds || []
            : [];

          if (featuredIds.length > 0) {
            // Filter & Map precisely to the custom selection order defined by Admin
            finalDisplayProducts = featuredIds
              .map((id: string) => allProducts.find((p: any) => p.id === id))
              .filter(Boolean); // Strip out missing products just in case
          } else {
            // Ultimate fallback to default curated subset
            finalDisplayProducts = allProducts.slice(0, 4);
          }
        }

        setProducts(finalDisplayProducts);
      } catch (err) {
        console.error("Failed to hydrate featured products ecosystem:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedContent();
  }, []);

  if (loading) {
    return (
      <section
        id="shop"
        className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10"
      >
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <LogoLoader size="md" />
          <p className="text-sm text-text-soft">Loading curated products...</p>
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
      className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10"
    >
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-serif text-text sm:text-4xl">
          Curated for everyday skin.
        </h2>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id || product.slug} product={product} />
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href="/shop"
          className="inline-flex h-12 items-center justify-center rounded-full border border-line px-10 text-sm font-medium text-text transition-all duration-300 hover:bg-text hover:text-background hover:border-text"
        >
          View all products
        </Link>
      </div>
    </section>
  );
}