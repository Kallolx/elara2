"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";

const concernContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const concernItemVariants = {
  hidden: { opacity: 0, y: 35 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const concerns = [
  {
    id: "acne",
    title: "Acne & Blemishes",
    image: "/concerns/acne.webp",
    link: "/shop?category=Acne",
  },
  {
    id: "pigmentation",
    title: "Dark Spots & Pigmentation",
    image: "/concerns/pigmentation.webp",
    link: "/shop?category=Pigmentation",
  },
  {
    id: "dry_skin",
    title: "Dry & Dehydrated Skin",
    image: "/concerns/dry_skin.webp",
    link: "/shop?category=Dry%20Skin",
  },
  {
    id: "aging",
    title: "Aging & Fine Lines",
    image: "/concerns/aging.webp",
    link: "/shop?category=Anti-Aging",
  },
  {
    id: "pores",
    title: "Oily Skin & Large Pores",
    image: "/concerns/pores.webp",
    link: "/shop?category=Oily%20Skin",
  },
];

export function ShopByConcernSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    loop: true,
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(true);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 lg:px-10 sm:py-16">
      <div
        className="mb-6 flex flex-row items-center justify-between sm:mb-10 sm:justify-center sm:text-center"
      >
        <h2 className="text-2xl font-serif text-text sm:text-4xl text-left sm:text-center">
          Shop by Concern
        </h2>
        
        {/* Mobile Navigation Arrows */}
        <div className="flex gap-2 sm:hidden">
          <button
            onClick={scrollPrev}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-text active:scale-95 transition-transform"
            aria-label="Previous"
          >
            <FiChevronLeft className="text-lg" />
          </button>
          <button
            onClick={scrollNext}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-text active:scale-95 transition-transform"
            aria-label="Next"
          >
            <FiChevronRight className="text-lg" />
          </button>
        </div>
      </div>

      <div className="group/arrows relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <motion.div
            className="flex -ml-4 touch-pan-y"
            variants={concernContainerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0 }}
          >
            {concerns.map((concern) => (
              <motion.div
                key={concern.id}
                variants={concernItemVariants}
                className="min-w-0 pl-4 flex-[0_0_75%] sm:flex-[0_0_45%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%]"
              >
                <Link href={concern.link} className="group block h-full">
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-surface">
                    <Image
                      src={concern.image}
                      alt={concern.title}
                      fill
                      sizes="(max-width: 640px) 75vw, (max-width: 768px) 45vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                    />

                    {/* Gradient Overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-85" />

                    <div className="absolute bottom-0 left-0 w-full p-6 text-center">
                      <h3 className="text-xl font-medium text-white leading-tight drop-shadow-sm">
                        {concern.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Desktop Navigation Buttons */}
      <div className="mt-8 hidden sm:flex justify-center gap-2">
        <button
          onClick={scrollPrev}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-text transition-all duration-300 hover:bg-surface-strong hover:scale-105 cursor-pointer"
          aria-label="Previous concerns"
        >
          <FiChevronLeft className="text-xl" />
        </button>
        <button
          onClick={scrollNext}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-text transition-all duration-300 hover:bg-surface-strong hover:scale-105 cursor-pointer"
          aria-label="Next concerns"
        >
          <FiChevronRight className="text-xl" />
        </button>
      </div>
    </section>
  );
}
