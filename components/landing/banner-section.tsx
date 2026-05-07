"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { FiShoppingBag, FiTag } from "react-icons/fi";
import { Button, ButtonLink } from "../ui/button";
import { useStore } from "@/context/StoreContext";

function getCountdown(targetDate: string) {
  const targetTime = new Date(targetDate).getTime();
  const now = Date.now();
  const remaining = Math.max(targetTime - now, 0);

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((remaining / (1000 * 60)) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    finished: remaining === 0,
  };
}

export function BannerSection() {
  const { products, settings } = useStore();
  const selectedProduct = useMemo(
    () =>
      products.find((product) => product.id === settings.promoProductId) ??
      products[0],
    [products, settings.promoProductId],
  );
  const [countdown, setCountdown] = useState(() =>
    getCountdown(settings.promoEndsAt),
  );

  useEffect(() => {
    const updateCountdown = () =>
      setCountdown(getCountdown(settings.promoEndsAt));

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(timer);
  }, [settings.promoEndsAt]);

  return (
    <section
      id="offer"
      className="mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8 lg:px-10 lg:pb-16"
    >
      <div className="grid overflow-hidden border border-line bg-surface lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative min-h-[320px] bg-[linear-gradient(180deg,#f6ecd9_0%,#f5e8d6_100%)] lg:min-h-[520px]">
          <Image
            src={selectedProduct.image}
            alt={selectedProduct.name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 48vw, 100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,239,229,0.08)_0%,rgba(248,239,229,0.24)_55%,rgba(248,239,229,0.88)_100%)]" />
        </div>

        <div className="flex items-center bg-[linear-gradient(180deg,#f6ecd9_0%,#f5e8d6_100%)] px-6 py-8 sm:px-8 lg:px-10 lg:py-12">
          <div className="w-full max-w-xl">
            <div className="inline-flex items-center gap-2 border border-[#d9b48d] bg-[#f7ead8] px-3 py-2 text-[11px] uppercase tracking-[0.28em] text-accent">
              <FiTag className="text-[14px]" />
              {settings.promoBadge}
            </div>

            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground lg:text-4xl">
              {settings.promoTitle || selectedProduct.name}
            </h2>
            <p className="mt-4 max-w-lg text-md text-gray-500">
              {settings.promoDescription}
            </p>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-4">
                <p className="text-3xl font-semibold text-accent-deep">
                  ৳{selectedProduct.price}
                </p>
                {selectedProduct.originalPrice ? (
                  <p className="text-md text-text-soft line-through">
                    ৳{selectedProduct.originalPrice}
                  </p>
                ) : null}
              </div>
              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <span className="rounded-full border border-line bg-background px-3 py-1 text-xs font-medium text-foreground">
                  {selectedProduct.sizes[0].name}
                </span>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="primary" className="flex-[2] gap-2">
                <FiShoppingBag className="text-[14px]" />
                Add to cart
              </Button>
              <ButtonLink
                href={`/products/${selectedProduct.id}`}
                variant="ghost"
                className="flex-1 gap-2"
              >
                Details
              </ButtonLink>
            </div>

            <div className="mt-8">
              <div className="mt-4 grid max-w-md grid-cols-4 gap-3">
                {[
                  [String(countdown.days).padStart(2, "0"), "Days"],
                  [String(countdown.hours).padStart(2, "0"), "Hours"],
                  [String(countdown.minutes).padStart(2, "0"), "Mins"],
                  [String(countdown.seconds).padStart(2, "0"), "Secs"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="border border-[#dcc8b6] bg-[#fbf3e7] px-3 py-4 text-center"
                  >
                    <div className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
                      {value}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.28em] text-text-soft">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
              {countdown.finished ? (
                <p className="mt-3 text-xs uppercase tracking-[0.24em] text-text-soft">
                  Offer ended
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
