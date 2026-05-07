"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "./product-card";
import { FiLoader } from "react-icons/fi";

export function ProductsSection() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/products`);
        const json = await res.json();
        if (json.success) {
          // Take the first 4 products as curated featured products
          setProducts(json.data.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section id="shop" className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <FiLoader className="animate-spin text-3xl text-accent" />
          <p className="text-sm text-text-soft">Loading curated products...</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section id="shop" className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
      <div className="mb-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.34em] text-text-soft">Featured products</p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
          Curated for everyday skin.
        </h2>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id || product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}