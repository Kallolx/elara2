import { BannerSection } from "./banner-section";
import { CategoriesSection } from "./categories-section";
import { HeroSection } from "./hero-section";
import { ProductsSection } from "./products-section";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { ProductFeaturesSection } from "./product-features-section";

export function LandingPage() {
  return (
    <div className="min-h-screen text-foreground">
      <SiteHeader />
      <main id="top">
        <HeroSection />
        <CategoriesSection />
        <ProductsSection />
        <BannerSection />
        <ProductFeaturesSection />
      </main>
      <SiteFooter />
    </div>
  );
}
