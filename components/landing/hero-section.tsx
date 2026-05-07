"use client";

import Image from "next/image";
import { FiShoppingBag } from "react-icons/fi";
import { ButtonLink } from "../ui/button";
import { useStore } from "@/context/StoreContext";

export function HeroSection() {
  const { settings } = useStore();

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
      <div className="relative border border-line bg-surface rounded-lg overflow-hidden">
        <Image
          src={settings.heroMedia}
          alt={settings.heroMediaAlt}
          width={1400}
          height={640}
          className="h-[16rem] w-full object-cover sm:h-[16rem] lg:h-[20rem]"
          priority
        />

        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 flex items-end px-6 pb-8 sm:px-10 sm:pb-10">
          <div className="
            flex w-full 
            flex-col items-center text-center gap-4
            sm:flex-row sm:items-end sm:justify-between sm:text-left
          ">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs sm:text-sm uppercase tracking-widest text-white/70">
                {settings.heroEyebrow}
              </p>

              <h1 className="
                font-display font-semibold tracking-[-0.03em] text-white
                text-2xl sm:text-4xl lg:text-6xl
              ">
                {settings.heroTitle}
              </h1>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
              <ButtonLink href={settings.heroPrimaryCtaHref} className="gap-2">
                {settings.heroPrimaryCtaLabel}
                <FiShoppingBag className="text-[16px]" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}