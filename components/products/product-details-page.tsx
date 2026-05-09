"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import {
  FiArrowLeft,
  FiCheck,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiStar,
  FiTruck,
} from "react-icons/fi";
import { Button, ButtonLink } from "../ui/button";
import { ProductCard } from "../landing/product-card";
import { featuredProducts, type ProductItem } from "../landing/products-data";

type ProductDetailsPageProps = {
  product: any;
};

type DetailTab = "details" | "ingredients" | "usage";

const tabs: Array<{ id: DetailTab; label: string }> = [
  { id: "details", label: "Details" },
  { id: "ingredients", label: "Ingredients" },
  { id: "usage", label: "How to use" },
];

export function ProductDetailsPage({ product }: ProductDetailsPageProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const displaySizes = product.sizes || [];
  const [activeTab, setActiveTab] = useState<DetailTab>("details");
  const [selectedSize, setSelectedSize] = useState<any>(
    displaySizes[0] || { label: "", price: 0, oldPrice: null }
  );
  const [quantity, setQuantity] = useState(1);

  // Safely parse primary image src
  const normalizedImage = useMemo(() => {
    if (typeof product.image === "string") {
      return { src: product.image, alt: product.name };
    }
    return product.image || { src: "/placeholder.jpg", alt: product.name };
  }, [product.image, product.name]);

  // Safely parse gallery list
  const imageList = useMemo(() => {
    const list: Array<{ src: string; alt: string }> = [];
    if (product.gallery && Array.isArray(product.gallery)) {
      product.gallery.forEach((img: any, idx: number) => {
        if (typeof img === "string") {
          list.push({ src: img, alt: `${product.name} ${idx + 1}` });
        } else if (img && img.src) {
          list.push(img);
        }
      });
    }
    if (list.length === 0) {
      list.push(normalizedImage);
    }
    return list;
  }, [product.gallery, product.name, normalizedImage]);

  const [activeImage, setActiveImage] = useState(normalizedImage);

  // Sync activeImage on product load
  useEffect(() => {
    setActiveImage(normalizedImage);
  }, [normalizedImage]);

  // Safely parse category name
  const categoryName = useMemo(() => {
    if (typeof product.category === "object" && product.category !== null) {
      return product.category.name;
    }
    return product.category || "Uncategorized";
  }, [product.category]);

  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${baseUrl}/products`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const getSlug = (p: any) => {
            if (p.slug) return p.slug;
            return String(p.name || "")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)+/g, "");
          };

          const currentSlug = getSlug(product);

          const currentCatId = typeof product.category === "object" && product.category !== null
            ? (product.category.id || product.category._id)
            : String(product.category || "");

          const currentCatName = typeof product.category === "object" && product.category !== null
            ? String(product.category.name || "").toLowerCase().trim()
            : String(product.category || "").toLowerCase().trim();

          const filtered = json.data.filter((item: any) => {
            const itemSlug = getSlug(item);
            const isSelf = 
              itemSlug === currentSlug || 
              (product.id && item.id && item.id === product.id) || 
              (product._id && item._id && item._id === product._id);
            if (isSelf) {
              return false;
            }

            const itemCatId = typeof item.category === "object" && item.category !== null 
              ? (item.category.id || item.category._id)
              : String(item.category || "");

            const itemCatName = typeof item.category === "object" && item.category !== null 
              ? String(item.category.name || "").toLowerCase().trim()
              : String(item.category || "").toLowerCase().trim();

            const matchesId = currentCatId && itemCatId && currentCatId === itemCatId;
            const matchesName = currentCatName && itemCatName && currentCatName === itemCatName;

            return matchesId || matchesName;
          });

          if (filtered.length > 0) {
            setRelatedProducts(filtered.slice(0, 4));
          } else {
            const anyProducts = json.data.filter((item: any) => {
              const itemSlug = getSlug(item);
              const isSelf = 
                itemSlug === currentSlug || 
                (product.id && item.id && item.id === product.id) || 
                (product._id && item._id && item._id === product._id);
              return !isSelf;
            });
            setRelatedProducts(anyProducts.slice(0, 4));
          }
        }
      } catch (err) {
        console.error("Failed to fetch related products from database:", err);
      }
    };
    fetchRelatedProducts();
  }, [categoryName, product.slug, product.name, product.category, product.id, product._id]);

  const buyNowHref = useMemo(() => {
    const subject = encodeURIComponent(`Buy now: ${product.name}`);
    const body = encodeURIComponent(
      `I would like to buy ${product.name} in ${selectedSize.label}. Price: ${selectedSize.price}. Quantity: ${quantity}`,
    );

    return `mailto:hello@elara.com?subject=${subject}&body=${body}`;
  }, [product.name, quantity, selectedSize.label, selectedSize.price]);

  useEffect(() => {
    if (displaySizes.length > 0) {
      setSelectedSize(displaySizes[0]);
    }
  }, [displaySizes]);

  return (
    <section className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-text-soft">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <FiArrowLeft className="text-[14px]" />
            Back to shop
          </Link>
          <p className="text-[11px] uppercase tracking-[0.28em] text-text-soft">
            {categoryName}
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <div className="relative aspect-square overflow-hidden bg-[#f2eadf]">
              <img
                src={activeImage.src}
                alt={activeImage.alt}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {product.hasOffer ? (
                <span className="absolute left-4 top-4 rounded-full border border-accent bg-accent px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white">
                  Offer
                </span>
              ) : null}
            </div>

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {imageList.map((image) => {
                const active = activeImage.src === image.src;

                return (
                  <button
                    key={image.src}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    aria-label={`View ${image.alt}`}
                    className={[
                      "relative aspect-square overflow-hidden bg-surface transition-all",
                      active
                        ? "ring-1 ring-accent/50"
                        : "opacity-70 hover:opacity-100",
                    ].join(" ")}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-10">
            <div className="space-y-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.34em] text-text-soft">
                  Product details
                </p>
                <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-[3.5rem]">
                  {product.name}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-text-soft sm:text-[1.02rem] sm:leading-8">
                  {product.shortDescription}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-md uppercase text-text-soft">
                  <span className="inline-flex items-center gap-2">
                    <FiStar
                      className="text-xs text-[#b38a3a]"
                      fill="currentColor"
                      aria-hidden="true"
                    />
                    {product.rating} ({product.reviewCount})
                  </span>
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-end gap-3">
                  <p className="text-3xl font-semibold tracking-[-0.04em] text-accent-deep sm:text-4xl">
                    {selectedSize.price}
                  </p>
                  <p className="pb-1 text-sm text-text-soft line-through">
                    {selectedSize.oldPrice}
                  </p>
                  <span className="rounded-full border border-line bg-surface px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-text-soft">
                    {selectedSize.label}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.34em] text-text-soft">
                  Size selection
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {displaySizes.map((size: any) => {
                    const active = selectedSize.label === size.label;

                    return (
                      <button
                        key={size.label}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={[
                          "rounded-full border border-line px-4 py-2 text-sm transition-colors",
                          active
                            ? "border-accent bg-accent text-white"
                            : "bg-surface text-foreground hover:border-accent/40 hover:bg-surface-strong",
                        ].join(" ")}
                      >
                        {size.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() =>
                      setQuantity((current) => Math.max(1, current - 1))
                    }
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-foreground transition-colors hover:border-accent/40 hover:bg-surface-strong"
                  >
                    <FiMinus className="text-[14px]" />
                  </button>
                  <div className="flex h-11 min-w-14 items-center justify-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-foreground">
                    {quantity}
                  </div>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((current) => current + 1)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-foreground transition-colors hover:border-accent/40 hover:bg-surface-strong"
                  >
                    <FiPlus className="text-[14px]" />
                  </button>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="h-14 w-full justify-center px-8 text-sm cursor-pointer"
                  type="button"
                  onClick={() => {
                    addToCart(product, {
                      name: selectedSize.label || selectedSize.name || "150 ml",
                      price: typeof selectedSize.price === "number"
                        ? selectedSize.price
                        : parseFloat(String(selectedSize.price || 0).replace(/[^0-9.]/g, "")) || 0,
                    }, quantity);
                  }}
                >
                  <FiShoppingBag className="text-[15px]" />
                  Add to cart
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  className="h-14 px-6 sm:justify-self-end cursor-pointer"
                  type="button"
                  onClick={() => {
                    addToCart(product, {
                      name: selectedSize.label || selectedSize.name || "150 ml",
                      price: typeof selectedSize.price === "number"
                        ? selectedSize.price
                        : parseFloat(String(selectedSize.price || 0).replace(/[^0-9.]/g, "")) || 0,
                    }, quantity);
                    router.push("/checkout");
                  }}
                >
                  Buy now
                </Button>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-text-soft sm:text-xs">
                {[
                  "Free delivery over ৳1500",
                  "Secure packaging",
                  "Easy Bangladesh support",
                ].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <FiCheck className="text-[11px] text-accent" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap gap-6">
                {tabs.map((tab) => {
                  const active = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={[
                        "pb-2 text-xs uppercase tracking-[0.22em] transition-colors",
                        active
                          ? "border-b-2 border-accent text-foreground"
                          : "text-text-soft hover:text-foreground",
                      ].join(" ")}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="pt-6">
                {activeTab === "details" ? (
                  <div className="space-y-4 text-text-soft">
                    <p className="text-sm leading-7 sm:text-base sm:leading-8">
                      {product.description}
                    </p>
                  </div>
                ) : null}

                {activeTab === "ingredients" ? (
                  <div className="space-y-3 text-text-soft">
                    <p className="text-sm leading-7 sm:text-base sm:leading-8">
                      {product.ingredients.join(", ")}.
                    </p>
                  </div>
                ) : null}

                {activeTab === "usage" ? (
                  <ol className="space-y-3 text-text-soft">
                    {product.howToUse.map((step: any, index: any) => (
                      <li
                        key={step}
                        className="flex gap-3 text-sm leading-7 sm:text-base"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 ? (
          <section className="mt-14 space-y-4 border-t border-line pt-10">
            <div>
              <p className="text-[11px] uppercase tracking-[0.34em] text-text-soft">
                Related products
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
                More from {categoryName}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.slug}
                  product={relatedProduct}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-14 space-y-4 border-t border-line pt-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-text-soft">
              Reviews
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
              What people say
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {product.reviews.map((review: any) => (
              <article
                key={`${review.author}-${review.date}`}
                className="border border-line bg-surface p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f2eadf] border border-line text-xs font-semibold text-[#5e4b38] uppercase">
                      {review.author ? review.author.charAt(0) : "U"}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground">
                        {review.author}
                      </p>
                      <p className="text-xs uppercase tracking-[0.22em] text-text-soft">
                        {new Date(review.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-text-soft">
                    <FiStar
                      className="text-[14px] text-[#b38a3a]"
                      fill="currentColor"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-semibold text-foreground">
                      {review.rating}
                    </span>
                  </div>
                </div>

                <h3 className="mt-4 font-medium text-foreground">
                  {review.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-text-soft">
                  {review.text}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
