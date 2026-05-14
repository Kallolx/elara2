import { CategoriesSection } from "./categories-section";
import { HeroSection } from "./hero-section";
import { ProductsSection } from "./products-section";
import { SocialMediaSection } from "./social-media-section";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { ShopByCategorySection } from "./shop-by-category-section";
import { ShopByConcernSection } from "./shop-by-concern-section";
import { OffersSection } from "./offers-section";
import { PromoBannerSection } from "./promo-banner";
import { PromoBadgesSection } from "./promo-badges-section";

export function LandingPage() {
  return (
    <div className="min-h-screen text-foreground relative bg-background">
      {/* Fixed Side Backgrounds (Watercolor Leaves branching inwards from the edges) */}
      <div
        className="fixed left-0 top-0 bottom-0 w-[100px] pointer-events-none z-0 hidden xl:block opacity-20 select-none"
        style={{
          backgroundImage: "url('/bg.png')",
          backgroundRepeat: "repeat-y",
          backgroundSize: "100% auto",
          backgroundPosition: "left top",
        }}
      />
      <div
        className="fixed right-0 top-0 bottom-0 w-[100px] pointer-events-none z-0 hidden xl:block opacity-20 select-none"
        style={{
          backgroundImage: "url('/bg.png')",
          backgroundRepeat: "repeat-y",
          backgroundSize: "100% auto",
          backgroundPosition: "right top",
          transform: "scaleX(-1)", // Flips the straight cut edge to align with the right-most edge
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <SiteHeader />
        <main id="top" className="flex-grow flex flex-col">
          <div className="order-1">
            <HeroSection />
          </div>
          <div className="order-2 lg:order-6 pt-6 lg:pt-0">
            <ProductsSection />
          </div>
          <div className="order-3 lg:order-3">
            <CategoriesSection />
          </div>
          <div className="order-4 lg:order-2">
            <PromoBadgesSection />
          </div>
          <div className="order-5 lg:order-4">
            <OffersSection />
          </div>
          <div className="order-6 lg:order-5">
            <ShopByConcernSection />
          </div>
          <div className="order-7 lg:order-7">
            <PromoBannerSection />
          </div>
          <div className="order-8 lg:order-8">
            <ShopByCategorySection />
          </div>
          <div className="order-9 lg:order-9">
            <SocialMediaSection />
          </div>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
