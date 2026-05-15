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
  FiMessageSquare,
  FiBox,
  FiHash,
  FiSmile,
  FiZap,
  FiHeart,
  FiShare2,
  FiCopy,
  FiX,
} from "react-icons/fi";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaWhatsapp,
  FaTelegramPlane,
  FaPinterestP,
  FaRedditAlien,
  FaEnvelope,
} from "react-icons/fa";
import { Button, ButtonLink } from "../ui/button";
import { ProductCard } from "../landing/product-card";
import { motion } from "framer-motion";
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

  const availableTabs = useMemo(() => {
    const list: Array<{ id: DetailTab; label: string }> = [];
    if (product.description) list.push({ id: "details", label: "Details" });
    if (product.ingredients && product.ingredients.length > 0) {
      list.push({ id: "ingredients", label: "Ingredients" });
    }
    if (product.howToUse && product.howToUse.length > 0) {
      list.push({ id: "usage", label: "How to use" });
    }
    return list;
  }, [product.description, product.ingredients, product.howToUse]);

  const [activeTab, setActiveTab] = useState<DetailTab | "">(
    availableTabs.length > 0 ? availableTabs[0].id : "",
  );

  // Sync tab reset on product changes
  useEffect(() => {
    if (availableTabs.length > 0) {
      setActiveTab(availableTabs[0].id);
    } else {
      setActiveTab("");
    }
  }, [availableTabs]);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageUrl(window.location.href);
    }
  }, [isShareModalOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const [selectedSize, setSelectedSize] = useState<any>(
    displaySizes.find((s: any) => !s.isOutOfStock) || displaySizes[0] || { label: "", price: 0, oldPrice: null, isOutOfStock: false }
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
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
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

          const currentCatId =
            typeof product.category === "object" && product.category !== null
              ? product.category.id || product.category._id
              : String(product.category || "");

          const currentCatName =
            typeof product.category === "object" && product.category !== null
              ? String(product.category.name || "")
                  .toLowerCase()
                  .trim()
              : String(product.category || "")
                  .toLowerCase()
                  .trim();

          const filtered = json.data.filter((item: any) => {
            const itemSlug = getSlug(item);
            const isSelf =
              itemSlug === currentSlug ||
              (product.id && item.id && item.id === product.id) ||
              (product._id && item._id && item._id === product._id);
            if (isSelf) {
              return false;
            }

            const itemCatId =
              typeof item.category === "object" && item.category !== null
                ? item.category.id || item.category._id
                : String(item.category || "");

            const itemCatName =
              typeof item.category === "object" && item.category !== null
                ? String(item.category.name || "")
                    .toLowerCase()
                    .trim()
                : String(item.category || "")
                    .toLowerCase()
                    .trim();

            const matchesId =
              currentCatId && itemCatId && currentCatId === itemCatId;
            const matchesName =
              currentCatName && itemCatName && currentCatName === itemCatName;

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
  }, [
    categoryName,
    product.slug,
    product.name,
    product.category,
    product.id,
    product._id,
  ]);

  // Dynamic Pricing Logic based on Offers
  const { displayPrice, displayOldPrice, isFlashSale, activeOffer } =
    useMemo(() => {
      let finalPrice =
        typeof selectedSize.price === "number"
          ? selectedSize.price
          : parseFloat(
              String(selectedSize.price || 0).replace(/[^0-9.]/g, ""),
            ) || 0;

      let finalOldPrice =
        selectedSize.oldPrice !== null && selectedSize.oldPrice !== undefined
          ? typeof selectedSize.oldPrice === "number"
            ? selectedSize.oldPrice
            : parseFloat(
                String(selectedSize.oldPrice).replace(/[^0-9.]/g, ""),
              ) || null
          : null;

      let flashSale = false;
      let matchedOffer = null;

      if (product.offers && product.offers.length > 0) {
        matchedOffer = product.offers.find((o: any) => {
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

        if (matchedOffer) {
          flashSale = matchedOffer.isFlashSale || false;
          const originalPrice = finalOldPrice || finalPrice;
          finalOldPrice = originalPrice;

          if (matchedOffer.discountType === "PERCENTAGE") {
            finalPrice =
              originalPrice -
              originalPrice * (matchedOffer.discountValue / 100);
          } else {
            finalPrice = originalPrice - matchedOffer.discountValue;
          }
          if (finalPrice < 0) finalPrice = 0;
          finalPrice = Math.round(finalPrice);
        }
      }

      return {
        displayPrice: finalPrice,
        displayOldPrice: finalOldPrice,
        isFlashSale: flashSale,
        activeOffer: matchedOffer,
      };
    }, [selectedSize, product.offers]);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!activeOffer?.endDate) return;

    const calculate = () => {
      const target = new Date(activeOffer.endDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [activeOffer?.endDate]);

  const buyNowHref = useMemo(() => {
    const subject = encodeURIComponent(`Buy now: ${product.name}`);
    const body = encodeURIComponent(
      `I would like to buy ${product.name} in ${selectedSize.label}. Price: ${selectedSize.price}. Quantity: ${quantity}`,
    );

    return `mailto:hello@elara.com?subject=${subject}&body=${body}`;
  }, [product.name, quantity, selectedSize.label, selectedSize.price]);

  useEffect(() => {
    if (displaySizes.length > 0) {
      setSelectedSize(displaySizes.find((s: any) => !s.isOutOfStock) || displaySizes[0]);
    }
  }, [displaySizes]);

  // Computed granular stock state integrating parent overrides & specific size variations
  const isSizeOutOfStock = product.isOutOfStock || selectedSize.isOutOfStock === true;

  // Dynamic Rating and Review Count Calculation
  const { calculatedRating, calculatedReviewCount } = useMemo(() => {
    const reviews = product.reviews || [];
    if (reviews.length === 0) {
      // Fallback to legacy fields if reviews array is empty (unlikely with our system but safe)
      return {
        calculatedRating: Number(product.rating || 0),
        calculatedReviewCount: Number(product.reviewCount || 0),
      };
    }
    const sum = reviews.reduce((acc: number, r: any) => acc + (Number(r.rating) || 0), 0);
    return {
      calculatedRating: sum / reviews.length,
      calculatedReviewCount: reviews.length,
    };
  }, [product.reviews, product.rating, product.reviewCount]);

  return (
    <section className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
          {/* Left Image Block - Slides in from the Left */}
          <motion.div 
            className="space-y-4 lg:sticky lg:top-6 lg:self-start"
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative aspect-square overflow-hidden bg-surface-strong">
              <img
                src={activeImage.src}
                alt={activeImage.alt}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {product.isOutOfStock && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-stone-900/20 backdrop-blur-[1px]">
                  <span className="border border-white/20 bg-stone-900/80 px-6 py-3 text-xs uppercase tracking-[0.3em] font-bold text-white shadow-2xl">
                    Sold Out
                  </span>
                </div>
              )}
              {/* Main Product Actions Overlay */}
              <div className="absolute right-3 top-3 z-20 flex flex-col gap-2 sm:right-4 sm:top-4">
                <button
                  type="button"
                  aria-label="Add to Wishlist"
                  className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-foreground shadow-[0_2px_10px_rgba(0,0,0,0.08)] backdrop-blur-md transition-all duration-300 hover:bg-red-50 hover:text-red-500 sm:h-11 sm:w-11"
                >
                  <FiHeart className="text-lg transition-transform duration-300 group-hover:scale-110 sm:text-xl" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  aria-label="Share Product"
                  className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-foreground shadow-[0_2px_10px_rgba(0,0,0,0.08)] backdrop-blur-md transition-all duration-300 hover:bg-accent hover:text-white sm:h-11 sm:w-11"
                >
                  <FiShare2 className="text-lg transition-transform duration-300 group-hover:scale-110 sm:text-xl" />
                </button>
              </div>
            </div>

            {imageList.length > 1 && (
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
            )}
          </motion.div>

          {/* Right Details Block - Slides in from the Right */}
          <motion.div 
            className="space-y-10"
            initial={{ opacity: 0, x: 35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-text-soft/60">
                  {product.brand?.name && (
                    <>
                      <span className="font-semibold text-green-600">
                        {product.brand.name}
                      </span>
                      <span className="text-text-soft/40">|</span>
                    </>
                  )}
                  <Link
                    href={`/shop?category=${encodeURIComponent(
                      typeof product.category === "object" &&
                        product.category !== null
                        ? product.category.id ||
                            product.category.slug ||
                            categoryName
                        : categoryName,
                    )}`}
                    className="text-text-soft hover:text-accent transition-colors hover:underline underline-offset-4"
                  >
                    {categoryName}
                  </Link>
                </div>
                <h1 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-[3.5rem]">
                  {product.name}
                </h1>
                <div className="mt-5 flex items-center gap-3">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-sm font-semibold text-foreground">
                    <FiStar
                      className="text-lg text-orange-500"
                      fill="currentColor"
                      aria-hidden="true"
                    />
                    {calculatedRating.toFixed(1)}
                  </div>
                  <span className="text-md font-medium text-text-soft/70">
                    {calculatedReviewCount} Reviews
                  </span>
                </div>
              </div>

              <div className="relative w-full p-[4px] overflow-hidden rounded-xl isolate">
                {/* The spinning rainbow border */}
                <div
                  className="absolute left-1/2 top-1/2 aspect-square w-[250%] -translate-x-1/2 -translate-y-1/2 animate-[spin_8s_linear_infinite] -z-10 opacity-90"
                  style={{
                    background:
                      "conic-gradient(from 0deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000)",
                    filter: "blur(1px)",
                  }}
                />
                {/* Inner safe masking background to house the content */}
                <div className="relative z-10 overflow-hidden rounded-[10px] bg-surface">
                  {/* Dynamic Offer Banner Header */}
                  {activeOffer && (
                    <div className="relative flex flex-wrap items-center justify-between gap-5 overflow-hidden border-b border-white/10 px-5 py-7 sm:py-9 text-white sm:px-7" style={{background: "linear-gradient(135deg, #e81d2e 0%, #c64099 50%, #a32cf6 100%)"}}>
                      {/* GIF Decoration – Left */}
                      <img
                        src="/flash-sale.gif"
                        alt=""
                        aria-hidden="true"
                        className="pointer-events-none absolute left-0 lg:left-3 top-0 z-20 h-full w-28 object-cover opacity-90 select-none"
                      />
                      {/* GIF Decoration – Right (flipped) */}
                      <img
                        src="/flash-sale.gif"
                        alt=""
                        aria-hidden="true"
                        className="pointer-events-none absolute right-0 lg:right-3 top-0 z-20 h-full w-28 scale-x-[-1] object-cover opacity-90 select-none"
                      />

                      <div className="relative flex items-center gap-3.5">
                        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center text-yellow-400">
                          <FiZap className="text-4xl fill-current" />
                        </div>
                        <div>
                          <h3 className="font-display text-xl font-bold uppercase sm:text-2xl">
                            {activeOffer.title ||
                              activeOffer.name ||
                              "Flash Sale"}
                          </h3>
                          <p className="mt-0.5 text-sm font-medium text-white/80 sm:text-base">
                            {timeLeft.days > 0 ? (
                              <>
                                Only{" "}
                                <span className="font-bold text-white">
                                  {timeLeft.days}
                                </span>{" "}
                                days remaining!
                              </>
                            ) : (
                              "Hurry! Limited time offer!"
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Interactive Countdowns */}
                      <div className="relative flex items-center gap-1.5 sm:gap-2">
                        {[
                          { value: timeLeft.days, label: "Days" },
                          { value: timeLeft.hours, label: "Hours" },
                          { value: timeLeft.minutes, label: "Min" },
                          { value: timeLeft.seconds, label: "Sec" },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col items-center justify-center"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white font-sans text-base font-semibold tabular-nums text-slate-900 shadow-sm sm:h-11 sm:w-11 sm:text-lg">
                              {String(item.value).padStart(2, "0")}
                            </div>
                            <span className="mt-1.5 text-sm font-medium text-white/80">
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prices Container */}
                  <div
                    className={`space-y-2 ${activeOffer ? "px-5 py-5 sm:px-7 sm:py-6" : "px-6 py-5"}`}
                  >
                    <div className="flex flex-wrap items-end gap-3 sm:gap-4">
                      <p className="text-2xl font-semibold text-accent-deep sm:text-4xl">
                        ৳{displayPrice}.00
                      </p>
                      {displayOldPrice && displayOldPrice > displayPrice && (
                        <>
                          <p className="text-lg font-semibold text-text-soft/50 line-through sm:text-xl">
                            ৳{displayOldPrice}.00
                          </p>
                          <span className="ml-1 rounded bg-accent px-2.5 py-1 text-xs text-white whitespace-nowrap sm:px-3 sm:py-1.5 sm:text-sm">
                            Save{" "}
                            <span className="font-semibold">
                              ৳{displayOldPrice - displayPrice}.00
                            </span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {displaySizes.length > 1 && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.34em] text-text-soft">
                    Size selection
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {displaySizes.map((size: any) => {
                      const active = selectedSize.label === size.label;
                      const outOfStock = size.isOutOfStock === true;

                      return (
                        <button
                          key={size.label}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={[
                            "rounded-full border px-4 py-2 text-sm transition-all duration-200",
                            active
                              ? "border-accent bg-accent text-white ring-1 ring-accent/30"
                              : outOfStock
                                ? "bg-surface text-stone-400/70 border-line border-dashed line-through opacity-50 cursor-pointer"
                                : "border-line bg-surface text-foreground hover:border-accent/40 hover:bg-surface-strong",
                          ].join(" ")}
                        >
                          {size.label}
                          {outOfStock && (
                            <span className="ml-1.5 text-[9px] font-bold uppercase opacity-60 select-none">(Out)</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isSizeOutOfStock}
                    aria-label="Decrease quantity"
                    onClick={() =>
                      setQuantity((current) => Math.max(1, current - 1))
                    }
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-foreground transition-colors hover:border-accent/40 hover:bg-surface-strong disabled:opacity-50"
                  >
                    <FiMinus className="text-[14px]" />
                  </button>
                  <div className="flex h-11 min-w-14 items-center justify-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-foreground opacity-80">
                    {quantity}
                  </div>
                  <button
                    type="button"
                    disabled={isSizeOutOfStock}
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((current) => current + 1)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-foreground transition-colors hover:border-accent/40 hover:bg-surface-strong disabled:opacity-50"
                  >
                    <FiPlus className="text-[14px]" />
                  </button>
                </div>

                <Button
                  variant={isSizeOutOfStock ? "outline" : "primary"}
                  size="md"
                  disabled={isSizeOutOfStock}
                  className="h-14 w-full justify-center px-8 text-sm cursor-pointer disabled:opacity-60"
                  type="button"
                  onClick={() => {
                    if (isSizeOutOfStock) return;
                    addToCart(
                      product,
                      {
                        name:
                          selectedSize.label || selectedSize.name || "150 ml",
                        price: displayPrice,
                        oldPrice: displayOldPrice,
                      },
                      quantity,
                    );
                  }}
                >
                  {!isSizeOutOfStock && (
                    <FiShoppingBag className="text-[15px]" />
                  )}
                  {isSizeOutOfStock ? "Sold Out" : "Add to cart"}
                </Button>

                {!isSizeOutOfStock && (
                  <Button
                    variant="outline"
                    size="md"
                    className="h-14 px-6 sm:justify-self-end cursor-pointer"
                    type="button"
                    onClick={() => {
                      addToCart(
                        product,
                        {
                          name:
                            selectedSize.label || selectedSize.name || "150 ml",
                          price: displayPrice,
                          oldPrice: displayOldPrice,
                        },
                        quantity,
                        false,
                      );
                      router.push("/checkout");
                    }}
                  >
                    Buy now
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-6 rounded-xl bg-surface-strong/50 border border-line/50 p-6 md:p-7">
              {/* Item 1: SKU */}
              <div className="flex flex-col items-center text-center gap-3 sm:flex-row sm:items-start sm:gap-3.5 sm:text-left">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background border border-line/30">
                  <FiHash className="text-[19px] text-accent" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-text-soft opacity-80">
                    SKU Code
                  </p>
                  <p className="mt-0.5 font-sans text-sm font-semibold text-foreground">
                    {product.sku ||
                      `#${String(product._id || product.id || "ELARA")
                        .slice(-6)
                        .toUpperCase()}`}
                  </p>
                </div>
              </div>

              {/* Item 2: Stock */}
              <div className="flex flex-col items-center text-center gap-3 sm:flex-row sm:items-start sm:gap-3.5 sm:text-left">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background border border-line/30">
                  <FiBox className="text-[19px] text-accent" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-text-soft opacity-80">
                    Stock
                  </p>
                  <p className="mt-0.5 font-sans text-sm font-semibold text-foreground">
                    {product.isOutOfStock ? "Out of Stock" : "Available"}
                  </p>
                </div>
              </div>

              {/* Item 3: Estimate Delivery */}
              <div className="flex flex-col items-center text-center gap-3 sm:flex-row sm:items-start sm:gap-3.5 sm:text-left">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background border border-line/30">
                  <FiTruck className="text-[19px] text-accent" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-text-soft opacity-80">
                    Estimate Delivery
                  </p>
                  <p className="mt-0.5 font-sans text-sm font-semibold text-foreground">
                    Within 1 to 3 Days
                  </p>
                </div>
              </div>

              {/* Item 4: Sell */}
              <div className="flex flex-col items-center text-center gap-3 sm:flex-row sm:items-start sm:gap-3.5 sm:text-left">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background border border-line/30">
                  <FiSmile className="text-[19px] text-accent" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-text-soft opacity-80">
                    Sell
                  </p>
                  <p className="mt-0.5 font-sans text-sm font-semibold text-foreground">
                    {product.soldCount || 0} Sold
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* --- TABS SECTION --- */}
        {availableTabs.length > 0 && (
          <div className="mt-4">
            <div className="flex gap-8 relative overflow-x-auto no-scrollbar pt-6">
              {availableTabs.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={[
                      "relative pb-4 text-[13px] font-bold uppercase tracking-[0.1em] transition-colors whitespace-nowrap",
                      active
                        ? "text-foreground"
                        : "text-text-soft hover:text-foreground",
                    ].join(" ")}
                  >
                    {tab.label}
                    {active && (
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-accent" />
                    )}
                  </button>
                );
              })}
              {/* Base line for tabs */}
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-line -z-10" />
            </div>

            <div className="py-8">
              {activeTab === "details" ? (
                <div className="space-y-4 text-text-soft max-w-4xl">
                  <p className="text-sm leading-7 sm:text-base sm:leading-8">
                    {product.description}
                  </p>
                </div>
              ) : null}

              {activeTab === "ingredients" ? (
                <div className="space-y-3 text-text-soft max-w-4xl">
                  <p className="text-sm leading-7 sm:text-base sm:leading-8">
                    {product.ingredients.join(", ")}.
                  </p>
                </div>
              ) : null}

              {activeTab === "usage" ? (
                <ol className="space-y-4 text-text-soft max-w-4xl">
                  {product.howToUse.map((step: any, index: any) => (
                    <li
                      key={step}
                      className="flex gap-4 text-sm leading-7 sm:text-base items-start"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-strong border border-line text-[11px] font-bold text-foreground mt-0.5">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          </div>
        )}

        {/* --- REVIEWS SECTION --- */}
        <section className="mt-8">
          <div>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
              Ratings & Reviews
            </h2>
          </div>

          <div className="mt-8 border border-line bg-surface p-6 sm:p-10 rounded-lg">
            {/* Summary Block (Always visible) */}
            <div className="grid gap-12 md:grid-cols-[auto_1fr] md:items-start lg:px-6">
              <div className="flex flex-col items-center md:items-start justify-center pr-0 md:pr-12 md:min-w-[160px]">
                <span className="text-[52px] font-medium text-foreground leading-none mb-3 font-sans">
                  {calculatedRating.toFixed(1)}
                </span>
                <div className="flex items-center gap-[3px]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FiStar
                      key={s}
                      className={`text-[17px] ${s <= Math.round(calculatedRating) ? "fill-orange-500 text-orange-500" : "text-line fill-none"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4 w-full md:pl-16 lg:pl-32">
                {[5, 4, 3, 2, 1].map((star) => {
                  const reviews = product.reviews || [];
                  const count = reviews.filter(
                    (r: any) => Math.round(r.rating) === star,
                  ).length;
                  const total = reviews.length;
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div
                      key={star}
                      className="flex items-center gap-4 text-sm w-full"
                    >
                      <span className="w-4 text-left text-[13px] font-medium text-text-soft">
                        {star}
                      </span>
                      <div className="flex-1 h-3 rounded-full bg-background overflow-hidden border border-line/30">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-text-soft text-[13px]">
                        ({count})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-10">
              {product.reviews && product.reviews.length > 0 ? (
                <div className="flex flex-col">
                  {product.reviews.map((review: any) => {
                    const date = new Date(review.date);
                    const today = new Date();
                    const seconds = Math.round(
                      (today.getTime() - date.getTime()) / 1000,
                    );
                    const days = Math.round(seconds / (3600 * 24));
                    const months = Math.round(days / 30);
                    const years = Math.round(days / 365);
                    let timeString = "";
                    if (days < 1) timeString = "Today";
                    else if (days < 30) timeString = `${days} days ago`;
                    else if (months < 12) timeString = `${months} months ago`;
                    else timeString = `${years} years ago`;

                    return (
                      <article
                        key={`${review.author}-${review.date}`}
                        className="border-t border-line py-8 first:border-t-0"
                      >
                        <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-12">
                          <div className="flex items-center md:items-start gap-4 md:w-[240px] shrink-0">
                            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-surface-strong border border-line text-xl font-display text-text-soft uppercase">
                              {review.author ? review.author.charAt(0) : "U"}
                            </div>
                            <div className="space-y-1 mt-0.5">
                              <p className="font-display text-[17px] font-medium text-foreground tracking-[-0.01em]">
                                {review.author}
                              </p>
                              <p className="text-[13px] text-text-soft">
                                {timeString}
                              </p>
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-[15px] leading-[1.7] text-text-soft">
                              {review.text}
                            </p>
                            {review.image && (
                              <div className="mt-4 h-20 w-20 rounded border border-line overflow-hidden">
                                <img
                                  src={review.image}
                                  alt="Review attachment"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex items-start md:justify-end shrink-0 pt-1">
                            <div className="flex items-center gap-[3px] text-orange-500">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <FiStar
                                  key={s}
                                  className={`text-[13px] ${s <= Math.round(review.rating) ? "fill-current" : "text-line fill-none"}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-strong mb-6">
                    <FiMessageSquare className="text-3xl text-text-soft" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-foreground">
                    No Reviews Yet
                  </h3>
                  <p className="mt-2 text-text-soft text-[16px]">
                    Be the first to review this product!
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* --- RELATED PRODUCTS SECTION --- */}
        {relatedProducts.length > 0 ? (
          <section className="mt-14 space-y-4">
            <div>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
                More from {categoryName}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {relatedProducts.map((relatedProduct, idx) => (
                <ProductCard
                  key={relatedProduct.id || relatedProduct._id || relatedProduct.slug || idx}
                  product={relatedProduct}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
      {/* Interactive Share Modal Backdrop & Container */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          {/* Dark Background Blur Overlay */}
          <div
            className="absolute inset-0 bg-stone-950/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsShareModalOpen(false)}
          />

          {/* Animated Modal Body */}
          <div className="relative w-full max-w-md scale-100 overflow-hidden rounded-2xl bg-background p-6 shadow-2xl ring-1 ring-line/50 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
                Share this product
              </h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-soft transition-colors hover:bg-surface hover:text-foreground"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Dynamic Social Icons Row */}
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                { icon: FaFacebookF, color: "bg-[#1877F2]", name: "Facebook", href: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}` },
                { icon: FaTwitter, color: "bg-[#1DA1F2]", name: "Twitter", href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}` },
                { icon: FaLinkedinIn, color: "bg-[#0A66C2]", name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}` },
                { icon: FaWhatsapp, color: "bg-[#25D366]", name: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(pageUrl)}` },
                { icon: FaTelegramPlane, color: "bg-[#229ED9]", name: "Telegram", href: `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}` },
                { icon: FaPinterestP, color: "bg-[#BD081C]", name: "Pinterest", href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(pageUrl)}` },
                { icon: FaRedditAlien, color: "bg-[#FF4500]", name: "Reddit", href: `https://reddit.com/submit?url=${encodeURIComponent(pageUrl)}` },
                { icon: FaEnvelope, color: "bg-[#71717a]", name: "Email", href: `mailto:?body=${encodeURIComponent(pageUrl)}` }
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-white hover:opacity-90 transition-opacity shadow-sm ${social.color}`}
                  title={`Share via ${social.name}`}
                >
                  <social.icon className="text-lg" />
                </a>
              ))}
            </div>

            {/* Native Sharing Trigger (Optional Fallback Style) */}
            <div className="mt-5">
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: product.name, url: pageUrl }).catch(console.error);
                  } else {
                    handleCopy();
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-all hover:opacity-90"
              >
                <FiShare2 className="text-base" />
                More sharing options
              </button>
            </div>

            {/* Copy Link Card Container */}
            <div className="mt-6 overflow-hidden rounded-xl border border-line/60 bg-surface p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-text-soft/80 font-mono">
                  {pageUrl || "Loading link..."}
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-line bg-background px-3.5 py-1.5 text-sm font-bold text-foreground shadow-sm transition-all hover:bg-accent hover:border-accent hover:text-white active:scale-95"
                >
                  {isCopied ? (
                    <>
                      <FiCheck className="text-base" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <FiCopy className="text-base" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
