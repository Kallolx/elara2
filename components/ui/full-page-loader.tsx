"use client";

import React from "react";
import Image from "next/image";

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background select-none pointer-events-none animate-in fade-in duration-500">
      
      {/* Ambient Background Decorator - Full and unclipped */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none select-none opacity-20 z-0">
        <Image
          src="/bg-2.png"
          alt="Hanging leaves background"
          width={1920}
          height={1080}
          className="w-full h-auto object-cover"
          priority
          unoptimized
        />
      </div>

      <div className="relative flex flex-col items-center gap-6 z-10">
        {/* Signature Branded Kinetic Icon */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Dynamic breathing shadow ripples */}
          <div className="absolute inset-0 duration-[2000ms]" />
          
          {/* Rotating Branded Vector */}
          <img 
            src="/logo-icon.svg" 
            alt="Loading Elara" 
            className="w-32 h-32 object-contain opacity-80 animate-[spin_4s_linear_infinite]"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      </div>

      {/* CSS Inlining for slideInfinite keyframes if not defined globally */}
      <style jsx>{`
        @keyframes slideInfinite {
          0% { left: -50%; width: 30%; }
          50% { width: 60%; }
          100% { left: 100%; width: 30%; }
        }
        .animate-slideInfinite {
          animation: slideInfinite 1.8s cubic-bezier(0.4, 0.0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}
