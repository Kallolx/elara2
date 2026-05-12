"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, products as initialProducts } from "@/lib/data";
import { FullPageLoader } from "@/components/ui/full-page-loader";

export interface HeroBanner {
  image: string;
}

export interface StoreSettings {
  logo: string;
  logoAlt: string;
  heroMedia: string;
  heroMediaAlt: string;
  heroEyebrow: string;
  heroTitle: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaHref: string;
  banners: HeroBanner[];
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
  heroMedia: "",
  heroMediaAlt: "",
  heroEyebrow: "",
  heroTitle: "",
  heroPrimaryCtaLabel: "",
  heroPrimaryCtaHref: "",
  banners: [],
  categories: [],
  featuredProductIds: [],
  colors: {
    primary: "#0f0f0f",
    secondary: "#5c5c5c",
    background: "#FDFBF7",
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

  // Load from database/API on mount
  useEffect(() => {
    const loadData = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      // 1. Fetch live products from DB
      try {
        const prodRes = await fetch(`${baseUrl}/products`);
        const prodJson = await prodRes.json();
        if (prodJson.success && prodJson.data.length > 0) {
          const mapped = prodJson.data.map((p: any) => ({
            id: p.id,
            sku: p.sku,
            name: p.name,
            category: p.category?.name || "",
            price: p.sizes?.[0]?.price || p.price || 0,
            originalPrice: p.sizes?.[0]?.oldPrice || p.oldPrice || null,
            image: p.image || "/products/cleanser.png",
            gallery: p.gallery || [],
            sizes: p.sizes?.map((s: any) => ({ name: s.label, price: s.price })) || [],
            ingredients: p.ingredients || [],
            howToUse: p.howToUse || [],
            reviews: p.reviews?.map((r: any) => ({ author: r.author, rating: r.rating, text: r.text })) || [],
            description: p.description || "",
            shortDescription: p.shortDescription || "",
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error("Failed to load products from database:", err);
      }

      // 2. Fetch live settings from DB
      try {
        const settingsRes = await fetch(`${baseUrl}/site-settings`);
        const settingsJson = await settingsRes.json();
        if (settingsJson.success) {
          setSettings((prev) => ({
            ...prev,
            ...settingsJson.data,
            banners: settingsJson.data.banners || prev.banners || [],
          }));
        }
      } catch (err) {
        console.error("Failed to load settings from database:", err);
      }

      setIsLoaded(true);
    };

    loadData();
  }, []);

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

  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      return updated;
    });

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("elara_token");
      await fetch(`${baseUrl}/site-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...settings,
          ...newSettings,
        }),
      });
    } catch (err) {
      console.error("Failed to save site settings to database:", err);
    }
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
      {!isLoaded ? <FullPageLoader /> : children}
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
