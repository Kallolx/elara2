"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FiImage } from "react-icons/fi";
import { useStore } from "@/context/StoreContext";
import { motion, AnimatePresence } from "framer-motion";

export function HeroSection() {
  const { settings, isLoaded } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = settings.banners && settings.banners.length > 0
    ? settings.banners
    : [
        {
          image: "/banner.png",
        },
      ];

  const paginate = (newDirection: number) => {
    setCurrentSlide((prev) => {
      let next = prev + newDirection;
      if (next < 0) next = banners.length - 1;
      if (next >= banners.length) next = 0;
      return next;
    });
  };

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      paginate(1);
    }, 8000); // Serene timing between auto transitions
    return () => clearInterval(interval);
  }, [banners.length]);

  // Slider animation motion variants
  const sliderVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 1.05,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.95,
    }),
  };

  const [[page, direction], setPage] = useState([0, 0]);
  // Map derived page index so standard setCurrentSlide stays working natively for indicators
  useEffect(() => {
    setPage([currentSlide, currentSlide > page ? 1 : -1]);
  }, [currentSlide]);

  if (!isLoaded) {
    return (
      <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="w-full border border-line bg-surface rounded-xl sm:rounded-[2rem] overflow-hidden aspect-[2.2/1] h-auto sm:aspect-auto sm:h-[24rem] lg:h-[28rem] animate-pulse flex items-center justify-center relative">
          {/* A soft, glowing shimmer block to fill visual weight */}
          <div className="absolute inset-0 bg-gradient-to-tr from-surface-strong/50 to-transparent opacity-60" />
          
          <div className="relative z-10 flex flex-col items-center justify-center gap-3 text-text-soft/40">
            <FiImage className="text-4xl" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-medium">Loading Canvas</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-5 pt-4 sm:px-8 lg:px-10">
      <div className="relative border border-line bg-surface rounded-xl sm:rounded-[2rem] overflow-hidden aspect-[2.2/1] h-auto sm:aspect-auto sm:h-[24rem] lg:h-[28rem] select-none group cursor-grab active:cursor-grabbing">
        
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={sliderVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.5 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 500;
              if (swipe) {
                if (offset.x > 0) {
                  paginate(-1);
                } else {
                  paginate(1);
                }
              }
            }}
            className="absolute inset-0 w-full h-full touch-pan-y"
          >
            <Image
              src={banners[currentSlide]?.image || "/banner.png"}
              alt="Hero banner"
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover pointer-events-none"
              priority
              unoptimized
            />
          </motion.div>
        </AnimatePresence>

        {/* Minimalist Navigation Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {banners.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`group relative w-8 h-8 flex items-center justify-center cursor-pointer outline-none`}
                aria-label={`Go to slide ${index + 1}`}
              >
                {/* Thin background track dot */}
                <span className="w-6 h-[2px] bg-white/30 rounded-full overflow-hidden relative">
                  {/* Active progress line */}
                  <span 
                    className={`absolute top-0 left-0 h-full bg-white transition-all ease-linear duration-7000 ${
                      index === currentSlide ? "w-full opacity-100" : "w-0 opacity-0"
                    }`}
                  />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}