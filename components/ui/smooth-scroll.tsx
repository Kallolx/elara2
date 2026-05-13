"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // ADMIN ROUTE EXEMPTION: Shield administrative grids and tables from virtual scroll systems
    if (pathname?.startsWith("/admin")) {
      document.documentElement.style.scrollBehavior = "auto";
      return;
    }

    // INITIALIZE: Construct a fresh context for this specific route to prevent cached-height locking
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.05,
    });

    lenisRef.current = lenis;
    (window as any).lenis = lenis;

    // INSTANT HARD RESET: Immediately force viewport to the physical top coordinate on page mount
    lenis.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);

    // COORDINATE: Start smooth engine raf loops
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // HYDRATION DELAY: Force a deep resize recalculation after browser paints new DOM content
    const resizeTimer = setTimeout(() => {
      lenis.resize();
    }, 150);

    // VISIBILITY RECOVERY: Explicitly wake and recalculate physics loops when user returns to tab
    const handleVisibility = () => {
      if (!document.hidden && lenisRef.current) {
        lenisRef.current.start();
        lenisRef.current.resize();
      }
    };
    const handleFocus = () => {
      if (lenisRef.current) {
        lenisRef.current.start();
        lenisRef.current.resize();
      }
    };

    // AUTO-RESIZE: Monitor DOM shifts to keep scroll physics in sync with dynamic content
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });
    resizeObserver.observe(document.body);

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);

    // DECONSTRUCT: Cleanly dismantle listeners and remove styling classes to avoid freezing the viewport
    return () => {
      clearTimeout(resizeTimer);
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);

      lenis.destroy();
      lenisRef.current = null;
      (window as any).lenis = null;
      
      // Purge absolute system variables to ensure standard browser scroll takes back over instantly
      document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-scrolling', 'lenis-stopped');
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, [pathname]);
 // Crucial: Triggers exact height calculations and resets whenever path shifts

  return (
    <>
      {/* Raw globally injected styles handle structural layout resets for Lenis constraints */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html.lenis, html.lenis-scrolling {
              scroll-behavior: auto !important;
            }
            .lenis.lenis-smooth {
              scroll-behavior: auto !important;
            }
            .lenis.lenis-smooth [data-lenis-prevent] {
              overscroll-behavior: contain;
            }
            .lenis.lenis-stopped {
              overflow: hidden !important;
            }
            .lenis.lenis-scrolling iframe {
              pointer-events: none;
            }
          `
        }}
      />
      {children}
    </>
  );
}
