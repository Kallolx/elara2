"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { FiImage } from "react-icons/fi";
import { useStore } from "@/context/StoreContext";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";

export function HeroSection() {
  const { settings, isLoaded } = useStore();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const banners =
    settings.banners && settings.banners.length > 0
      ? settings.banners
      : [
          {
            image: "/banner.png",
          },
        ];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      duration: 30
    }, 
    [
      Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })
    ]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (!isLoaded) {
    return (
      <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="w-full border border-line bg-surface rounded-xl sm:rounded-[2rem] overflow-hidden aspect-[2.2/1] h-auto sm:aspect-auto sm:h-[24rem] lg:h-[28rem] animate-pulse flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-surface-strong/50 to-transparent opacity-60" />
          <div className="relative z-10 flex flex-col items-center justify-center gap-3 text-text-soft/40">
            <FiImage className="text-4xl" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-medium">
              Loading Canvas
            </span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-5 pt-4 sm:px-8 lg:px-10">
      <motion.div 
        className="relative border border-line bg-surface rounded-xl sm:rounded-[2rem] overflow-hidden select-none group cursor-grab active:cursor-grabbing"
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {banners.map((banner: any, index: number) => (
              <div 
                key={index} 
                className="relative flex-[0_0_100%] min-w-0 aspect-[2.2/1] h-auto sm:aspect-auto sm:h-[24rem] lg:h-[28rem]"
              >
                <Image
                  src={banner?.image || "/banner.png"}
                  alt={`Hero banner ${index + 1}`}
                  fill
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className="object-cover pointer-events-none"
                  priority={index === 0}
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>

        {/* Minimalist Navigation Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {banners.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className="group relative w-8 h-8 flex items-center justify-center cursor-pointer outline-none"
                aria-label={`Go to slide ${index + 1}`}
              >
                {/* Thin background track dot */}
                <span className="w-6 h-[2px] bg-white/30 rounded-full overflow-hidden relative">
                  {/* Active indicator line */}
                  <span
                    className={`absolute top-0 left-0 h-full bg-white transition-all duration-300 ${
                      index === selectedIndex
                        ? "w-full opacity-100"
                        : "w-0 opacity-0"
                    }`}
                  />
                </span>
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
