"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { FiPlus, FiShoppingCart, FiStar, FiHeart, FiZap } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { HiOutlineShoppingBag, HiShoppingBag } from "react-icons/hi";
import { MdLocalOffer } from "react-icons/md";

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
    isOutOfStock?: boolean;
    offers?: any[];
    sizes: Array<{
      label: string;
      price: any;
      oldPrice?: any;
    }>;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { user, toggleWishlist, isAuthenticated } = useAuth();

  // Safely get base size price and oldPrice
  const baseSize = product.sizes?.[0] || { price: 0, oldPrice: null };
  const basePrice =
    typeof baseSize.price === "number"
      ? baseSize.price
      : parseFloat(String(baseSize.price || 0).replace(/[^0-9.]/g, "")) || 0;

  const baseOldPrice =
    baseSize.oldPrice !== null && baseSize.oldPrice !== undefined
      ? typeof baseSize.oldPrice === "number"
        ? baseSize.oldPrice
        : parseFloat(String(baseSize.oldPrice).replace(/[^0-9.]/g, "")) || null
      : null;

  let displayPrice = basePrice;
  let displayOldPrice = baseOldPrice;
  let discountPercentage =
    displayOldPrice && displayOldPrice > displayPrice
      ? Math.round(((displayOldPrice - displayPrice) / displayOldPrice) * 100)
      : 0;
  let isFlashSale = false;

  if (product.offers && product.offers.length > 0) {
    const activeOffer = product.offers.find((o: any) => {
      if (o.status !== "ACTIVE" || o.code) return false;

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (o.startDate) {
        const start = new Date(o.startDate);
        start.setHours(0, 0, 0, 0);
        if (start > now) return false;
      }

      if (o.endDate) {
        const end = new Date(o.endDate);
        end.setHours(0, 0, 0, 0);
        if (end < now) return false;
      }

      return true;
    });

    if (activeOffer) {
      isFlashSale = activeOffer.isFlashSale || false;
      const originalPrice = baseOldPrice || basePrice;
      displayOldPrice = originalPrice;

      if (activeOffer.discountType === "PERCENTAGE") {
        displayPrice =
          originalPrice - originalPrice * (activeOffer.discountValue / 100);
        discountPercentage = activeOffer.discountValue;
      } else {
        displayPrice = originalPrice - activeOffer.discountValue;
        discountPercentage = Math.round(
          ((originalPrice - displayPrice) / originalPrice) * 100,
        );
      }

      if (displayPrice < 0) displayPrice = 0;
      displayPrice = Math.round(displayPrice); // Ensure clean numbers
    }
  }

  // Safely parse primary image src
  const imageSrc =
    typeof product.image === "string"
      ? product.image
      : product.image?.src || "/placeholder.jpg";
  const imageAlt =
    typeof product.image === "string"
      ? product.name
      : product.image?.alt || product.name;

  // Safely parse category name
  const categoryName =
    typeof product.category === "object" && product.category !== null
      ? product.category.name
      : product.category || "Uncategorized";

  // Safely parse brand name
  const brandName =
    typeof (product as any).brand === "object" &&
    (product as any).brand !== null
      ? (product as any).brand.name
      : null;

  // Dynamic details page redirection
  const handleNavigate = () => {
    const slug =
      product.slug ||
      product.name
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
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-line bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative w-full overflow-hidden bg-surface">
        {discountPercentage > 0 ? (
          <span className="absolute flex items-center gap-1 left-3 top-3 z-20 bg-black/5 px-2.5 py-1 text-sm text-accent rounded-full">
            <MdLocalOffer className="w-4 h-4" />
            {discountPercentage}% OFF
          </span>
        ) : null}

        {isFlashSale && !product.isOutOfStock && (
          <div className="absolute left-3 top-12 z-20">
            <span className="flex items-center gap-1 bg-red-600/90 backdrop-blur-sm px-2.5 py-1 text-[12px] font-medium text-white rounded-full shadow-sm">
              <FiZap
                className="w-3 h-3 text-yellow-500"
                fill="currentColor"
              />
              Flash Sale
            </span>
          </div>
        )}

        {product.isOutOfStock && (
          <span className="absolute left-1 top-1 z-20 bg-stone-800/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm border border-white/10 rounded-full">
            Sold Out
          </span>
        )}

        {/* Wishlist Toggle Action */}
        <button
          type="button"
          onClick={async (e) => {
            e.stopPropagation();
            if (!isAuthenticated) {
              router.push("/auth/signin");
              return;
            }
            if (product.id) {
              await toggleWishlist(product.id);
            }
          }}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white/80 backdrop-blur-md transition-transform hover:scale-110 shadow-sm"
          aria-label={
            user?.wishlistIds?.includes(product.id || "")
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
        >
          <FiHeart
            className={`text-[15px] transition-colors ${
              user?.wishlistIds?.includes(product.id || "")
                ? "fill-red-500 text-red-500"
                : "text-text-soft hover:text-accent"
            }`}
          />
        </button>

        <div className="relative block">
          <div className="relative h-[300px] w-full overflow-hidden">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className={`object-cover transition-all duration-500 ${
                product.isOutOfStock
                  ? "grayscale opacity-70 group-hover:scale-105"
                  : "group-hover:scale-105"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex flex-col flex-grow px-4 py-4 sm:px-5 sm:py-5">
        {/* Minimal Review Count Top of Name */}
        <div className="mb-2 font-medium flex items-center">
          {(product.reviewCount || 0) > 0 ? (
            <span className="text-sm text-green-600">
              {product.reviewCount}{" "}
              {product.reviewCount === 1 ? "Review" : "Reviews"}
            </span>
          ) : (
            <span className="text-sm text-green-600">0 Reviews</span>
          )}
        </div>

        <h3 className="font-sans font-medium text-foreground mb-1.5 text-lg sm:text-xl leading-tight line-clamp-2 min-h-[2.6em]">
          {product.name}
        </h3>
      </div>

      {/* Footer: Price and Cart */}
      <div className="mt-auto pt-1 px-4 pb-4 sm:px-5 sm:pb-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-2xl font-medium text-foreground">
              ৳{displayPrice}
            </p>
            {displayOldPrice && (
              <p className="text-sm font-medium text-text-soft/60 line-through decoration-text-soft/40">
                ৳{displayOldPrice}
              </p>
            )}
          </div>

          {product.isOutOfStock ? (
            <div className="flex h-8 px-2.5 shrink-0 items-center justify-center bg-stone-100 text-stone-500 rounded-full border border-stone-200/60 cursor-not-allowed">
              <span className="text-[9px] font-bold uppercase tracking-widest">
                Sold Out
              </span>
            </div>
          ) : (
            <button
              type="button"
              aria-label={`Add ${product.name} to cart`}
              onClick={(event) => {
                event.stopPropagation();
                addToCart(product, {
                  name: (baseSize as any).name || baseSize.label || "150 ml",
                  price: displayPrice,
                  oldPrice: displayOldPrice,
                });
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center bg-accent text-white transition-all hover:bg-accent-deep cursor-pointer rounded-full shadow-sm"
            >
              <HiOutlineShoppingBag className="text-[16px]" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
