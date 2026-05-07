import type { Metadata } from "next";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { ShopPage } from "@/components/shop/shop-page";

export const metadata: Metadata = {
  title: "Shop | Elara",
  description:
    "Browse Elara products with category filters, pricing controls, and compact shop navigation.",
};

export default function ShopRoutePage() {
  return (
    <div className="min-h-screen text-foreground">
      <SiteHeader />
      <main id="top">
        <ShopPage />
      </main>
      <SiteFooter />
    </div>
  );
}
