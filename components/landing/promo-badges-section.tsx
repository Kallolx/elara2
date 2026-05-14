"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const BADGES = [
  { id: "buy1", src: "/nav/buy1.png", label: "Buy 1 Get 1" },
  { id: "flash", src: "/nav/flash.png", label: "Flash Sale" },
  { id: "kbrands", src: "/nav/kbrands.png", label: "K-Brands" },
  { id: "eid", src: "/nav/eid.png", label: "Eid Offer" },
];

export function PromoBadgesSection() {
  return (
    <section className="px-4 max-w-7xl mx-auto w-full pt-0 pb-10 sm:py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1 sm:gap-8">
        {BADGES.map((badge) => (
          <Link
            key={badge.id}
            href="/shop"
            className="block group"
          >
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative aspect-square flex items-center justify-center p-2"
            >
              <img
                src={badge.src}
                alt={badge.label}
                className="w-full h-full object-contain filter drop-shadow-[0_30px_50px_rgba(0,0,0,0.2)] transition-all duration-700 ease-in-out group-hover:brightness-105"
              />
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}
