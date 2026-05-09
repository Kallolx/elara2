import { ButtonLink } from "@/components/ui/button";
import { FiArrowLeft, FiGrid } from "react-icons/fi";
import { SiteHeader } from "@/components/landing/site-header";
import { BiShoppingBag } from "react-icons/bi";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen text-foreground relative bg-background overflow-hidden">
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
        <main className="flex-grow flex items-center justify-center px-6 py-16">
          <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fadeInSoft {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fadeInSoft 0.8s ease-out forwards; }
        ` }} />
        <div className="max-w-md w-full text-center space-y-4">
          
          {/* Top Minimal Visual Anchor */}
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            <span className="inline-block text-[120px] font-bold leading-none tracking-tighter text-line opacity-60 select-none">
              404
            </span>
          </div>

          {/* Content Stacks */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-foreground">
              Lost in the light.
            </h1>
            <p className="text-sm text-text-soft leading-relaxed max-w-xs mx-auto">
              We couldn't find the page you were looking for. It might have been moved or gently washed away.
            </p>
          </div>

          {/* Elegant Dual CTA Grid */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">

            <ButtonLink 
              href="/shop"
              variant="primary"
              className="w-full sm:w-auto"
            >
              <BiShoppingBag className="text-[14px]" />
              Explore Shop
            </ButtonLink>
          </div>

        </div>
      </main>
      </div>
    </div>
  );
}
