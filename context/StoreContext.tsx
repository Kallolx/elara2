"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, products as initialProducts } from "@/lib/data";

export interface StoreSettings {
  logo: string;
  logoAlt: string;
  heroMedia: string;
  heroMediaAlt: string;
  heroEyebrow: string;
  heroTitle: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaHref: string;
  promoProductId: string;
  promoBadge: string;
  promoTitle: string;
  promoDescription: string;
  promoEndsAt: string;
  categories: {
    id: string;
    name: string;
    image: string;
    subcategories: { id: string; name: string }[];
  }[];
  featuredProductIds: string[];
  colors: {
    primary: string;
    secondary: string;
    background: string;
  };
}

const defaultSettings: StoreSettings = {
  logo: "",
  logoAlt: "Elara",
  heroMedia: "/products/cleanser.png",
  heroMediaAlt: "Skincare bottles in warm light",
  heroEyebrow: "Natural • Soft • Everyday Care",
  heroTitle: "Creamy skincare for warm routines.",
  heroPrimaryCtaLabel: "Explore products",
  heroPrimaryCtaHref: "#shop",
  promoProductId: "EL-CLN-VC-150",
  promoBadge: "Limited time offer",
  promoTitle: "Featured product offer",
  promoDescription:
    "Highlight one product on the landing page with a timed seasonal offer.",
  promoEndsAt: "2026-05-12T23:59",
  categories: [
    {
      id: "cat-1",
      name: "Serums",
      image: "/categories/serums.png",
      subcategories: [
        { id: "sub-1-1", name: "Vitamin C" },
        { id: "sub-1-2", name: "Retinol" },
        { id: "sub-1-3", name: "Hyaluronic Acid" },
      ],
    },
    {
      id: "cat-2",
      name: "Moisturizers",
      image: "/categories/moisturizers.png",
      subcategories: [
        { id: "sub-2-1", name: "Day Creams" },
        { id: "sub-2-2", name: "Night Creams" },
        { id: "sub-2-3", name: "Face Oils" },
      ],
    },
    {
      id: "cat-3",
      name: "Cleansers",
      image: "/categories/cleansers.png",
      subcategories: [
        { id: "sub-3-1", name: "Foam Cleansers" },
        { id: "sub-3-2", name: "Oil Cleansers" },
        { id: "sub-3-3", name: "Micellar Water" },
      ],
    },
    {
      id: "cat-4",
      name: "Sunscreen",
      image: "/categories/sunscreen.png",
      subcategories: [
        { id: "sub-4-1", name: "Mineral Sunscreen" },
        { id: "sub-4-2", name: "Chemical Sunscreen" },
      ],
    },
    {
      id: "cat-5",
      name: "Treatments",
      image: "/categories/serums.png",
      subcategories: [
        { id: "sub-5-1", name: "Brightening" },
        { id: "sub-5-2", name: "Eye Care" },
        { id: "sub-5-3", name: "Exfoliators" },
      ],
    },
  ],
  featuredProductIds: [
    "EL-CLN-VC-150",
    "EL-CLN-DS-100",
    "EL-MST-CI-50",
    "EL-MST-DG-50",
    "EL-SRM-LV-30",
  ],
  colors: {
    primary: "#0f0f0f", // Dark primary (almost black)
    secondary: "#5c5c5c", // Gray secondary
    background: "#FDFBF7", // Warm off-white
  },
};

interface StoreContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  settings: StoreSettings;
  setSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
  updateProduct: (product: Product) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  isLoaded: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem("elara-products");
      const savedSettings = localStorage.getItem("elara-settings");

      if (savedProducts) {
        const parsedProducts = JSON.parse(savedProducts);
        const idMap: Record<string, string> = {
          "EL-001": "EL-CLN-VC-150",
          "EL-002": "EL-CLN-DS-100",
          "EL-003": "EL-MST-CI-50",
          "EL-004": "EL-MST-DG-50",
          "EL-005": "EL-SRM-LV-30",
          "EL-006": "EL-SRM-OR-30",
          "EL-007": "EL-SUN-IS-50",
          "EL-008": "EL-TRT-HE-15",
        };

        const migratedProducts = parsedProducts.map((p: any) => ({
          ...p,
          id: idMap[p.id] || p.id,
          relatedProducts: p.relatedProducts?.map(
            (relId: string) => idMap[relId] || relId,
          ),
        }));
        setProducts(migratedProducts);
      }
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Ensure new categories from defaultSettings are added to saved settings
        const mergedCategories = [...defaultSettings.categories];
        if (parsed.categories) {
          parsed.categories.forEach((cat: any) => {
            const index = mergedCategories.findIndex((c) => c.id === cat.id);
            if (index !== -1) {
              mergedCategories[index] = cat;
            } else {
              mergedCategories.push(cat);
            }
          });
        }

        // Migrate old IDs in settings
        const idMap: Record<string, string> = {
          "EL-001": "EL-CLN-VC-150",
          "EL-002": "EL-CLN-DS-100",
          "EL-003": "EL-MST-CI-50",
          "EL-004": "EL-MST-DG-50",
          "EL-005": "EL-SRM-LV-30",
          "EL-006": "EL-SRM-OR-30",
          "EL-007": "EL-SUN-IS-50",
          "EL-008": "EL-TRT-HE-15",
        };

        if (parsed.promoProductId && idMap[parsed.promoProductId]) {
          parsed.promoProductId = idMap[parsed.promoProductId];
        }

        if (parsed.featuredProductIds) {
          parsed.featuredProductIds = parsed.featuredProductIds.map(
            (id: string) => idMap[id] || id,
          );
        }

        setSettings({
          ...defaultSettings,
          ...parsed,
          categories: mergedCategories,
          colors: { ...defaultSettings.colors, ...parsed.colors },
        });
      }
    } catch (e) {
      console.error("Failed to load store data", e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("elara-products", JSON.stringify(products));
    localStorage.setItem("elara-settings", JSON.stringify(settings));
  }, [products, settings, isLoaded]);

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
    );
  };

  const addProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        setProducts,
        settings,
        setSettings,
        updateProduct,
        addProduct,
        deleteProduct,
        updateSettings,
        isLoaded,
      }}
    >
      <style
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `
          :root {
            --brand-primary: ${settings.colors?.primary || defaultSettings.colors.primary};
            --brand-secondary: ${settings.colors?.secondary || defaultSettings.colors.secondary};
            --brand-background: ${settings.colors?.background || defaultSettings.colors.background};
          }
        `,
        }}
      />
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
