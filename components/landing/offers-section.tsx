"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { ProductCard } from "./product-card";
import { LogoLoader } from "@/components/ui/logo-loader";
import { ButtonLink } from "../ui/button";
import { motion } from "framer-motion";
import {
  FiTag,
  FiArrowRight,
  FiShoppingBag,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

// Internal Helper: Verify active offers matching standard criteria
function hasActiveOffer(product: any) {
  if (!product.offers || product.offers.length === 0) return false;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return product.offers.some((o: any) => {
    if (o.status !== "ACTIVE" || o.code) return false;

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
}

// Extract the first valid active offer from a single product
function getFirstActiveOffer(product: any) {
  if (!product.offers || product.offers.length === 0) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return product.offers.find((o: any) => {
    if (o.status !== "ACTIVE" || o.code) return false;

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
}

// Unified animation variants mapping literal readonly tuples to pass strict TS checks
const cardContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.45, 
      staggerChildren: 0.1, 
    },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 50 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export function OffersSection() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Establish Embla Carousel Engine Configuration
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      containScroll: "trimSnaps",
      loop: products.length > 4, // Only loop dynamic flow if we exceed base column count
    },
    [
      Autoplay({
        delay: 4000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ],
  );

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );

  useEffect(() => {
    const loadOffers = async () => {
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiBase}/products`);
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          // Isolate products featuring actively running promotions
          const withOffers = json.data.filter(hasActiveOffer);
          setProducts(withOffers);
        }
      } catch (err) {
        console.error("Failed to fetch offers:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, []);

  // Re-initialize Embla tracking when new dynamic product assets are loaded
  useEffect(() => {
    if (emblaApi) emblaApi.reInit();
  }, [products, emblaApi]);

  // Dynamically resolve the pure offer name for CTA button (no extra suffix)
  const dynamicOfferLabel = useMemo(() => {
    if (products.length === 0) return "Exclusive Offer";

    const activeObj = getFirstActiveOffer(products[0]);
    if (!activeObj || !activeObj.title) return "Special Offer";

    return activeObj.title;
  }, [products]);

  if (loading) {
    return (
      <section className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-12">
        <div className="w-full h-[300px] rounded-[2.5rem] bg-surface animate-pulse flex items-center justify-center border border-line/50">
          <LogoLoader size="md" />
        </div>
      </section>
    );
  }

  return (
    <section className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-12">
      {/* Master Enclosure with Deep Vibrant Warm Gradient - Cinematic Top-to-Bottom Slide Down */}
      <motion.div
        className="relative w-full rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#FCF7F2] via-[#F5DEC8] to-[#E8B48C] border border-[#DFB899]/60 px-6 pt-16 pb-10 sm:px-10 md:pt-20 md:pb-12 shadow-[0_12px_40px_rgba(232,180,140,0.15)]"
        initial={{ opacity: 0, y: -80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Visual Accents aligned to primary design spec */}
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-olive/25 blur-[100px] rounded-full pointer-events-none z-0 animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-accent/20 blur-[100px] rounded-full pointer-events-none z-0 animate-pulse" />

        {/* Foliage Texture Overlay (Hanging Leaves mirroring Shop design - ELEVATED z-20 FOR CARD OVERLAP) */}
        <div className="absolute top-0 left-0 right-0 pointer-events-none select-none opacity-40 z-20 pointer-events-none">
          <img
            src="/bg-2.png"
            alt=""
            className="w-full h-auto object-contain object-top opacity-90 saturate-[1.2] pointer-events-none"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-foreground tracking-tight mb-2">
            Special Offer
          </h2>
          <p className="text-sm sm:text-base text-text-soft mb-8 tracking-wide">
            Pick your products
          </p>

          <div className="mb-14">
            <ButtonLink
              href="/shop"
              size="md"
              color="primary"
              className="shadow-md group"
            >
              <span className="flex items-center gap-2 font-bold tracking-wide">
                {dynamicOfferLabel}
                <FiArrowRight className="text-[15px] group-hover:translate-x-1 transition-transform" />
              </span>
            </ButtonLink>
          </div>

          {/* Interactive Viewport Region */}
          <div className="relative w-full px-0 md:px-2">
            {products.length > 0 ? (
              /* Dynamic Carousel Viewport (reverted to outer standard div, staggered track inside) */
              <div className="relative group/carousel">
                {/* Embla Frame */}
                <div className="overflow-hidden w-full" ref={emblaRef}>
                  <motion.div 
                    className="flex -ml-4 touch-pan-y py-2"
                    variants={cardContainerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-40px" }}
                  >
                    {products.map((product) => (
                      <motion.div
                        key={product.id}
                        variants={cardItemVariants}
                        className="min-w-0 pl-4 flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%] h-full"
                      >
                        <div className="h-full text-left transition-all duration-300 transform hover:-translate-y-1.5">
                          <ProductCard product={product} />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Edge Navigation Overlay Arrows (Only renders if multiple products are active) */}
                {products.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={scrollPrev}
                      className="absolute -left-3 md:-left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 backdrop-blur border border-line/60 shadow-md flex items-center justify-center text-foreground hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer opacity-0 group-hover/carousel:opacity-100 pointer-events-auto"
                      aria-label="View previous"
                    >
                      <FiChevronLeft className="text-xl md:text-2xl" />
                    </button>
                    <button
                      type="button"
                      onClick={scrollNext}
                      className="absolute -right-3 md:-right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 backdrop-blur border border-line/60 shadow-md flex items-center justify-center text-foreground hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer opacity-0 group-hover/carousel:opacity-100 pointer-events-auto"
                      aria-label="View next"
                    >
                      <FiChevronRight className="text-xl md:text-2xl" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              /* Minimalist Clean Fallback Alert Box - When no active promotions exist */
              <div className="flex flex-col items-center justify-center py-14 px-6 bg-white/50 backdrop-blur-[2px] rounded-2xl border-2 border-dashed border-[#DFB899]/50 shadow-sm max-w-sm mx-auto select-none">
                <div className="w-14 h-14 rounded-full bg-[#DFB899]/25 flex items-center justify-center text-foreground mb-4">
                  <FiTag className="text-2xl" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-foreground tracking-tight">
                  No Offers Available
                </h3>
                <p className="mt-1.5 text-sm text-text-soft leading-normal max-w-[240px]">
                  Check back later for dynamic season promotions and exclusive skincare bundles!
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
