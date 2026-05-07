"use client";

import React, { useState } from "react";
import { IoChevronDownOutline } from "react-icons/io5";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-black/5 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left transition-colors hover:text-[var(--brand-primary)]"
      >
        <span className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>{title}</span>
        <IoChevronDownOutline 
          className={`text-xl transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-[1000px] opacity-100 pb-6" : "max-h-0 opacity-0"
        }`}
      >
        <div className="text-sm md:text-base text-[var(--brand-secondary)] opacity-80 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Accordion({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col ${className}`}>
      {children}
    </div>
  );
}
