"use client";

import { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiCheck, FiAward } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

interface Brand {
  id: string;
  name: string;
  logo?: string | null;
}

interface BrandSelectProps {
  brands: Brand[];
  value: string;
  onChange: (id: string) => void;
  loading?: boolean;
}

export function BrandSelect({ brands, value, onChange, loading }: BrandSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedBrand = brands.find((b) => b.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50px] items-center px-4 border border-line bg-surface text-xs text-text-soft">
        Loading brands...
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent transition-colors"
      >
        <div className="flex items-center gap-3">
          {selectedBrand ? (
            <>
              <div className="h-6 w-6 shrink-0 border border-line bg-surface flex items-center justify-center overflow-hidden">
                {selectedBrand.logo ? (
                  <img src={selectedBrand.logo} alt="" className="h-full w-full object-contain p-0.5" />
                ) : (
                  <FiAward className="text-text-soft opacity-50 text-xs" />
                )}
              </div>
              <span className="text-sm font-medium">{selectedBrand.name}</span>
            </>
          ) : (
            <span className="text-sm text-text-soft">None / Unbranded</span>
          )}
        </div>
        <FiChevronDown className={`text-text-soft transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto border border-line bg-surface shadow-lg outline-none py-1"
          >
            <li
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className={`flex cursor-pointer items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-background ${!value ? "bg-accent/5 text-accent font-medium" : "text-foreground"}`}
            >
              <span>None / Unbranded</span>
              {!value && <FiCheck />}
            </li>

            {brands.map((brand) => {
              const isSelected = brand.id === value;
              return (
                <li
                  key={brand.id}
                  onClick={() => {
                    onChange(brand.id);
                    setIsOpen(false);
                  }}
                  className={`flex cursor-pointer items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-background ${isSelected ? "bg-accent/5 text-accent font-medium" : "text-foreground"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 shrink-0 border border-line bg-white flex items-center justify-center overflow-hidden">
                      {brand.logo ? (
                        <img src={brand.logo} alt="" className="h-full w-full object-contain p-0.5" />
                      ) : (
                        <FiAward className="text-text-soft opacity-50 text-xs" />
                      )}
                    </div>
                    <span>{brand.name}</span>
                  </div>
                  {isSelected && <FiCheck />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
