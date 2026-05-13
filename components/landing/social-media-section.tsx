"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  FiVolume2,
  FiVolumeX,
  FiChevronLeft,
  FiChevronRight,
  FiPlay,
} from "react-icons/fi";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface ProductSize {
  price: number;
  oldPrice?: number;
}

interface Product {
  id: string;
  name: string;
  image?: string;
  sizes: ProductSize[];
}

interface SocialPost {
  id: string;
  type: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  link?: string;
  products: Product[];
}

const SocialReelCard = ({ post }: { post: SocialPost }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  const products = post.products || [];

  useEffect(() => {
    if (products.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentProductIndex((prev) => (prev + 1) % products.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [products.length]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const product = products[currentProductIndex];

  const getSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  // Product calculation helper
  const getProductDisplayData = (prod: Product) => {
    let price = 0;
    let oldPrice = 0;
    let saveAmount = 0;

    if (prod && prod.sizes && prod.sizes.length > 0) {
      price = prod.sizes[0].price;
      oldPrice = prod.sizes[0].oldPrice || 0;
      if (oldPrice > price) {
        saveAmount = oldPrice - price;
      }
    }
    return { price, saveAmount };
  };

  return (
    <div className="flex flex-col gap-4 w-[260px] md:w-[280px]">
      {/* Video Container (Portrait 9:16) */}
      <div
        className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-black/5 border border-line/40 shadow-sm group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Thumbnail Overlay */}
        {post.thumbnailUrl && (
          <img
            src={post.thumbnailUrl}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-[5] pointer-events-none ${
              isHovered ? "opacity-0" : "opacity-100"
            }`}
          />
        )}

        {/* Play Icon Overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center z-[6] transition-opacity duration-200 pointer-events-none ${
            isHovered ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-black/70 border border-white/50 flex items-center justify-center shadow-2xl">
            <FiPlay className="text-white text-2xl fill-white translate-x-0.5" />
          </div>
        </div>

        <video
          ref={videoRef}
          src={post.mediaUrl}
          muted={isMuted}
          loop
          playsInline
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />

        {/* Unmute Button */}
        <button
          onClick={toggleMute}
          className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
        </button>
      </div>

      {/* Linked Product Card - Persistent dots with sliding content */}
      <div className="flex items-center gap-2 bg-surface p-2.5 rounded-xl border border-line transition-all duration-300 hover:border-text/30 hover:shadow-sm overflow-hidden h-[86px] relative">
        {/* Persistent Dot Indicators */}
        {products.length > 1 && (
          <div className="flex flex-col gap-1 px-1 shrink-0 z-20">
            {products.map((_, idx) => (
              <div
                key={idx}
                className={`w-1 h-1 rounded-full transition-all duration-300 ${
                  idx === currentProductIndex
                    ? "bg-accent scale-110"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}

        {/* Sliding Area */}
        <div className="relative flex-1 h-full overflow-hidden">
          <AnimatePresence initial={false}>
            {product && (
              <motion.div
                key={product.id}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                className="absolute inset-0 flex items-center gap-3 w-full"
              >
                <Link
                  href={`/products/${getSlug(product.name)}`}
                  className="flex items-center gap-3 w-full group"
                >
                  <div className="w-16 h-16 bg-surface-strong rounded-lg overflow-hidden shrink-0">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-soft text-xs font-medium bg-line/20">
                        No Img
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 min-w-0 pr-1 text-left">
                    <h4 className="text-[13px] leading-tight font-semibold text-text line-clamp-2 min-h-[32px] group-hover:text-accent transition-colors">
                      {product.name}
                    </h4>
                    {(() => {
                      const { price, saveAmount } =
                        getProductDisplayData(product);
                      return (
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-sm font-bold text-[#8ca34f]">
                            ৳{price.toFixed(2)}
                          </span>
                          {saveAmount > 0 && (
                            <span className="text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                              Save ৳{saveAmount.toFixed(2)}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export function SocialMediaSection() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiBase}/social`);
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          // Filter to only show videos since it's a Reels section now
          const videoPosts = json.data.filter((p: any) => p.type === "video");
          setPosts(videoPosts);
        }
      } catch (err) {
        console.error("Error fetching social reels:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading || posts.length === 0) return null;

  return (
    <section className="pb-10 text-foreground relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Header & Navigation */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-6 sm:text-left text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <h2 className="text-3xl font-serif text-text sm:text-4xl">
              Watch & Shop
            </h2>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={scrollPrev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-text transition-all hover:bg-surface-strong hover:scale-105"
            >
              <FiChevronLeft className="text-xl" />
            </button>
            <button
              onClick={scrollNext}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-text transition-all hover:bg-surface-strong hover:scale-105"
            >
              <FiChevronRight className="text-xl" />
            </button>
          </div>
        </motion.div>

        {/* Reels Slider */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-5 touch-pan-y">
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  className="pl-5 min-w-0 flex-none"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <SocialReelCard post={post} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
