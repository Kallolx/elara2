import type { Metadata } from "next";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { ShopPage } from "@/components/shop/shop-page";

import Image from "next/image";

export const metadata: Metadata = {
  title: "Shop | Elara",
  description:
    "Browse Elara products with category filters, pricing controls, and compact shop navigation.",
};

import { Suspense } from "react";

export default function ShopRoutePage() {
  return (
    <div className="min-h-screen text-foreground relative bg-background">
      {/* Top Hanging Leaves Background */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none select-none opacity-20 z-0">
        <Image
          src="/bg-2.png"
          alt="Hanging leaves background"
          width={1920}
          height={1080}
          className="w-full h-auto"
          priority
          unoptimized
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <SiteHeader />
        <main id="top" className="flex-grow">
          <Suspense fallback={null}>
            <ShopPage />
          </Suspense>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
