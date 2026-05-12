"use client";

import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { ButtonLink } from "../ui/button";

export function PromoBannerSection() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-16 mt-10 mb-10 overflow-visible">
      {/* Backer Container (Gradient Background mapped to Site Themes) */}
      <div className="relative w-full h-[540px] md:h-[360px] rounded-3xl overflow-hidden md:overflow-visible bg-gradient-to-br from-surface via-surface-strong/70 to-[#efe4d9] border border-line/40 flex flex-col md:flex-row items-center">
        
        {/* Decorative Radial Blobs using Theme Colors */}
        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-olive/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-accent/5 blur-[80px] rounded-full pointer-events-none" />

        {/* Corner SVG Decorative Elements */}
        <img 
          src="/corner.svg" 
          alt="" 
          className="absolute top-0 left-0 w-28 md:w-40 opacity-40 pointer-events-none z-0"
        />
        <img 
          src="/corner.svg" 
          alt="" 
          className="absolute bottom-0 right-0 w-28 md:w-40 opacity-40 rotate-180 pointer-events-none z-0"
        />

        {/* Text Block */}
        <div className="relative z-10 w-full px-6 sm:px-16 md:pl-20 md:w-2/3 lg:w-[60%] flex flex-col items-center text-center justify-start pt-10 md:pt-0 md:justify-center md:items-start md:text-left h-auto md:h-full">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-[44px] lg:text-[52px] tracking-tight text-foreground leading-[0.95] mb-2 max-w-lg">
            Find the Perfect Match for Your Skin
          </h2>
          <p className="text-sm md:text-base text-text-soft max-w-md leading-tight mb-8">
            Discover premium skincare collections tailored specifically to address your skin concerns.
          </p>
          
          <ButtonLink
            href="/shop"
            size="md"
            color="primary"
          >
            Explore Collections

          </ButtonLink>
        </div>

        {/* Float / Cutout Image Container */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 md:left-auto md:right-4 lg:right-12 md:translate-x-0 h-[220px] sm:h-[260px] md:h-[135%] w-auto flex items-end select-none pointer-events-none z-20">
          <img
            src="/promo-model.png"
            alt="Skincare model"
            className="h-full w-auto object-contain object-bottom drop-shadow-[-20px_20px_40px_rgba(0,0,0,0.1)] scale-[1.4] origin-bottom md:scale-100"
          />
        </div>
        
        {/* Side Metric Pill (Floating) */}
        <div className="absolute hidden md:flex items-center gap-3 md:right-[35%] bottom-6 md:bottom-12 bg-white/90 backdrop-blur-md border border-white shadow-xl px-5 py-2 rounded-2xl z-30 animate-pulse-subtle">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800 tracking-tight">100% Original</span>
            <div className="flex items-center text-lg text-amber-500 gap-0.5">
              {"★★★★★".split("").map((s, i) => (
                <span key={i}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
