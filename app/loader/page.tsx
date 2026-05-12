"use client";

import { FullPageLoader } from "@/components/ui/full-page-loader";

export default function TemporaryLoaderSandbox() {
  // This enables direct viewing of the loader UI in isolation.
  return (
    <main className="min-h-screen relative w-full overflow-hidden bg-white">
      <div className="absolute inset-0 flex items-center justify-center">
         <p className="text-text-soft text-xs uppercase tracking-widest">Background underneath loader.</p>
      </div>
      
      {/* Live Loader Instance locked in the foreground for verification */}
      <FullPageLoader />
    </main>
  );
}
