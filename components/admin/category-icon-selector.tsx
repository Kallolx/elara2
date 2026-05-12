"use client";

import { useEffect, useState } from "react";
import { categoryIcons, getCategoryIconPath } from "./categories-data";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";

interface CategoryIconSelectorProps {
  value: string;
  onChange: (val: string) => void;
  currentCategoryId?: string; // Pass this to avoid disabling current category's own icon when editing
}

export function CategoryIconSelector({
  value,
  onChange,
  currentCategoryId,
}: CategoryIconSelectorProps) {
  const [usedIcons, setUsedIcons] = useState<Record<string, string>>({}); // Maps IconPath -> CategoryName
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsedIcons = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${baseUrl}/categories`);
        const json = await res.json();
        
        if (json.success && Array.isArray(json.data)) {
          const map: Record<string, string> = {};
          json.data.forEach((cat: any) => {
            // Skip if this is the category currently being edited
            if (currentCategoryId && cat.id === currentCategoryId) return;
            
            if (cat.icon) {
              const fullPath = getCategoryIconPath(cat.icon);
              map[fullPath] = cat.name;
            }
          });
          setUsedIcons(map);

          // AUTO-SELECT LOGIC FOR NEW ENTRIES
          // If no value selected, OR selected icon is already taken by another category:
          // Auto-pivot to the VERY FIRST available unused icon automatically.
          const isCurrentlyTaken = map[value];
          if (!value || isCurrentlyTaken) {
             const firstAvailable = categoryIcons.find(icon => !map[icon.path]);
             if (firstAvailable) {
               onChange(firstAvailable.path);
             }
          }
        }
      } catch (error) {
        console.error("Failed to fetch used icons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsedIcons();
  }, [currentCategoryId]); // Intentionally omitted "value" to prevent infinite triggering loops, only run on mount/id change

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="text-[11px] uppercase tracking-[0.22em] text-text-soft font-bold">Select Visual Icon</h4>
      </div>

      {/* Compact Boxed Grid */}
      <div className="flex flex-wrap gap-x-6 gap-y-8">
        {categoryIcons.map((option) => {
          const isSelected = value === option.path;
          const isUsed = !!usedIcons[option.path];
          const usedByName = usedIcons[option.path];

          return (
            <div key={option.path} className="flex flex-col items-center w-28 group/item shrink-0">
              {/* 1. THE VISUAL BOX (BUTTON) */}
              <button
                type="button"
                disabled={isUsed}
                onClick={() => onChange(option.path)}
                className={`
                  relative flex flex-col items-center justify-center w-full aspect-square border rounded-lg transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)]
                  ${isSelected 
                    ? "border-accent bg-white ring-2 ring-accent/20" 
                    : isUsed 
                      ? "border-line bg-surface-strong opacity-60 cursor-not-allowed grayscale" 
                      : "border-line bg-white hover:border-text-soft/40 hover:shadow-md cursor-pointer"}
                `}
              >
                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 text-accent bg-white rounded-full">
                    <FiCheckCircle className="text-[16px]" />
                  </div>
                )}

                {/* LARGE IMAGE CONTAINER - Increased from w-12 to w-20 */}
                <div className="w-20 h-20 relative flex items-center justify-center">
                  <img 
                    src={option.path} 
                    alt={option.name} 
                    className={`w-full h-full object-contain transition-transform duration-300 ${!isUsed && "group-hover/item:scale-110"}`} 
                  />
                </div>

                {/* Disabled overlay overlay */}
                {isUsed && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/20 backdrop-blur-[1px] rounded-lg">
                     <span className="text-[10px] uppercase bg-white/90 border border-line px-2.5 py-1 shadow-sm rounded font-black text-red-600 tracking-wider flex items-center gap-1">
                       <FiAlertCircle className="text-xs" /> TAKEN
                     </span>
                  </div>
                )}
              </button>

              {/* 2. THE TEXT (OUTSIDE BOX) */}
              <div className="mt-3 text-center w-full px-1 flex flex-col items-center">
                <span className={`text-[13px] font-bold leading-tight transition-colors ${
                  isSelected 
                    ? "text-accent" 
                    : isUsed 
                      ? "text-text-soft/60" 
                      : "text-foreground group-hover/item:text-accent"
                }`}>
                  {isUsed ? "In Use" : option.name}
                </span>
                {isUsed && (
                  <span className="text-[10px] text-text-soft/70 font-medium mt-0.5 truncate w-full">
                    ({usedByName})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
