"use client";

import React from "react";

interface LogoLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LogoLoader({ className = "", size = "md" }: LogoLoaderProps) {
  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16"
  };

  const sizeClasses = sizeMap[size];

  return (
    <img 
      src="/logo-icon.svg" 
      alt="Loading..." 
      className={`object-contain opacity-80 animate-[spin_4s_linear_infinite] ${sizeClasses} ${className}`}
    />
  );
}
