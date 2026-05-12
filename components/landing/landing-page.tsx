import { CategoriesSection } from "./categories-section";
import { HeroSection } from "./hero-section";
import { ProductsSection } from "./products-section";
import { SocialMediaSection } from "./social-media-section";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { ShopByConcernSection } from "./shop-by-concern-section";

import { PromoBannerSection } from "./promo-banner";

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
        <main id="top" className="flex-grow">
          <HeroSection />
          <CategoriesSection />
          <ShopByConcernSection />
          <ProductsSection />
          <PromoBannerSection />
          <SocialMediaSection />
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
