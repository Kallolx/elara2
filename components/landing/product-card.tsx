"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { FiPlus, FiShoppingCart, FiStar } from "react-icons/fi";
import { useCart } from "@/context/CartContext";

type ProductCardProps = {
  product: {
    id?: string;
    slug: string;
    name: string;
    sku: string;
    image?: any;
    rating?: any;
    reviewCount?: any;
    hasOffer?: boolean;
    category?: any;
    sizes: Array<{
      label: string;
      price: any;
      oldPrice?: any;
    }>;
  };
};

function getTitleSizeClass(name: string) {
  const wordCount = name.trim().split(/\s+/).length;
  const characterCount = name.length;

  if (wordCount >= 5 || characterCount >= 30) {
    return "text-[1.05rem] sm:text-[1.15rem] leading-[1.08]";
  }

  if (wordCount >= 4 || characterCount >= 24) {
    return "text-[1.15rem] sm:text-[1.25rem] leading-[1.06]";
  }

  return "text-xl sm:text-[1.4rem] leading-[1.02]";
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  // Safely get base size price and oldPrice
  const baseSize = product.sizes?.[0] || { price: 0, oldPrice: null };
  const displayPrice = typeof baseSize.price === "number"
    ? baseSize.price
    : parseFloat(String(baseSize.price || 0).replace(/[^0-9.]/g, "")) || 0;

  const displayOldPrice = baseSize.oldPrice !== null && baseSize.oldPrice !== undefined
    ? (typeof baseSize.oldPrice === "number"
        ? baseSize.oldPrice
        : parseFloat(String(baseSize.oldPrice).replace(/[^0-9.]/g, "")) || null)
    : null;

  // Safely parse primary image src
  const imageSrc = typeof product.image === "string"
    ? product.image
    : (product.image?.src || "/placeholder.jpg");
  const imageAlt = typeof product.image === "string"
    ? product.name
    : (product.image?.alt || product.name);

  // Safely parse category name
  const categoryName = typeof product.category === "object" && product.category !== null
    ? product.category.name
    : (product.category || "Uncategorized");

  // Dynamic details page redirection
  const handleNavigate = () => {
    const slug = product.slug || product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    router.push(`/products/${slug}`);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNavigate();
    }
  };

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Open ${product.name} details`}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      className="group flex h-full cursor-pointer flex-col overflow-hidden border border-line bg-surface px-4 py-4 sm:px-5 sm:py-5"
    >
      <div className="relative rounded-lg overflow-hidden">
        {product.hasOffer ? (
          <span className="absolute left-4 top-4 z-20 bg-accent px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white">
            Offer
          </span>
        ) : null}
        <div className="relative block">
          <div className="relative h-[300px] w-full overflow-hidden">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500"
            />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#24160f]/70 via-[#24160f]/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 bg-[#3f2a1d]/95 px-4 py-4 text-sm font-semibold uppercase tracking-[0.1em] text-white backdrop-blur-[2px] transition-transform duration-300 ease-[0.22,1,0.36,1] group-hover:translate-y-0">
            <FiShoppingCart className="text-[12px]" />
            <span className="text-[12px]">Add to cart</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-wider text-text-soft">
          {categoryName}
        </p>
        <div className="flex items-center gap-2 text-[13px] text-text-soft">
          <FiStar className="text-[15px] text-[#b38a3a]" fill="currentColor" aria-hidden="true" />
          <span className="font-medium text-foreground">{product.rating || "5.0"}</span>
          <span>({product.reviewCount || 0})</span>
        </div>
      </div>
      <h3
        className={`mt-2 font-medium text-foreground ${getTitleSizeClass(product.name)}`}
      >
        {product.name}
      </h3>
      <div className="mt-auto pt-5">
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-wrap items-end gap-3">
            <p className="text-2xl font-semibold text-foreground">
              ৳ {displayPrice}
            </p>
            {displayOldPrice && (
              <p className="text-sm text-text-soft line-through">
                ৳ {displayOldPrice}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label={`Add ${product.name} to cart`}
            onClick={(event) => {
              event.stopPropagation();
              addToCart(product, {
                name: (baseSize as any).name || baseSize.label || "150 ml",
                price: displayPrice,
              });
            }}
            className="flex h-9 w-9 shrink-0 items-center justify-center bg-accent text-white transition-colors hover:bg-accent-deep cursor-pointer"
          >
            <FiPlus className="text-[18px]" />
          </button>
        </div>
      </div>
    </article>
  );
}
