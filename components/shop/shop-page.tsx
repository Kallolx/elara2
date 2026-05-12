"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FiFilter, FiRefreshCw, FiSliders, FiX } from "react-icons/fi";
import { LogoLoader } from "@/components/ui/logo-loader";
import { Button } from "../ui/button";
import { ProductCard } from "../landing/product-card";
import { getCategoryIconPath } from "@/components/admin/categories-data";

type SortKey = "featured" | "price-asc" | "price-desc";

const sortOptions: Array<{ label: string; value: SortKey }> = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

export function ShopPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search");

  // Dynamic DB states
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("All");
  const [selectedBrandId, setSelectedBrandId] = useState<string>("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("All");
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [topRatedOnly, setTopRatedOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("featured");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Load products and categories from PostgreSQL
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const [prodRes, catRes, brandRes] = await Promise.all([
          fetch(`${baseUrl}/products`),
          fetch(`${baseUrl}/categories`),
          fetch(`${baseUrl}/brands`),
        ]);
        const [prodJson, catJson, brandJson] = await Promise.all([
          prodRes.json(),
          catRes.json(),
          brandRes.json(),
        ]);

        if (prodJson.success) {
          setProducts(prodJson.data);
          const prices = prodJson.data.flatMap((p: any) =>
            (p.sizes || []).map((s: any) => Number(s.price)),
          );
          if (prices.length > 0) {
            setMaxPrice(Math.max(...prices));
          }
        }
        if (catJson.success) {
          setCategories(catJson.data.filter((c: any) => c.status === "Active"));
        }
        if (brandJson.success) {
          setBrands(brandJson.data.filter((b: any) => b.status === "Active"));
        }
      } catch (err) {
        console.error("Failed to load live shop data from database:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Sync category parameter from Landing Page clicks
  useEffect(() => {
    if (categoryParam && categories.length > 0) {
      const matched = categories.find(
        (c) =>
          c.id === categoryParam ||
          c.slug === categoryParam ||
          c.name.toLowerCase() === categoryParam.toLowerCase(),
      );
      if (matched) {
        setSelectedCategoryId(matched.id);
        setSelectedSubcategory("All");
      }
    }
  }, [categoryParam, categories]);

  // Dynamic price limits
  const priceValues = useMemo(() => {
    const vals = products.flatMap((p) =>
      (p.sizes || []).map((s: any) => Number(s.price)),
    );
    return vals.length > 0 ? vals : [0, 3000];
  }, [products]);

  const minAvailablePrice = useMemo(
    () => Math.min(...priceValues),
    [priceValues],
  );
  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedCategoryId, selectedBrandId, selectedSubcategory]);

  const maxAvailablePrice = useMemo(
    () => Math.max(...priceValues),
    [priceValues],
  );

  // Active parent category subcategories
  const activeSubcategories = useMemo(() => {
    const parent = categories.find((c) => c.id === selectedCategoryId);
    return parent?.subcategories || [];
  }, [categories, selectedCategoryId]);

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    let items = products.filter((product) => {
      const price = Number(product.sizes?.[0]?.price || 0);
      const categoryMatch =
        selectedCategoryId === "All" ||
        product.categoryId === selectedCategoryId;
      const brandMatch =
        selectedBrandId === "All" || product.brandId === selectedBrandId;
      const subcategoryMatch =
        selectedSubcategory === "All" ||
        product.subcategory === selectedSubcategory;
      const priceMatch = price <= maxPrice;
      const offerMatch = !onlyOffers || Boolean(product.hasOffer);
      const ratingMatch = !topRatedOnly || Number(product.rating || 5.0) >= 4.5;
      const searchMatch =
        !searchParam ||
        product.name.toLowerCase().includes(searchParam.toLowerCase()) ||
        (product.description || "")
          .toLowerCase()
          .includes(searchParam.toLowerCase());

      return (
        categoryMatch &&
        brandMatch &&
        subcategoryMatch &&
        priceMatch &&
        offerMatch &&
        ratingMatch &&
        searchMatch
      );
    });

    // Sorting logic
    if (sortKey === "price-asc") {
      items = [...items].sort(
        (a, b) =>
          Number(a.sizes?.[0]?.price || 0) - Number(b.sizes?.[0]?.price || 0),
      );
    } else if (sortKey === "price-desc") {
      items = [...items].sort(
        (a, b) =>
          Number(b.sizes?.[0]?.price || 0) - Number(a.sizes?.[0]?.price || 0),
      );
    }

    return items;
  }, [
    products,
    selectedCategoryId,
    selectedBrandId,
    selectedSubcategory,
    maxPrice,
    onlyOffers,
    topRatedOnly,
    sortKey,
    searchParam,
  ]);

  const activeCategoryLabel = useMemo(() => {
    if (selectedCategoryId === "All") return "All Categories";
    const cat = categories.find((c) => c.id === selectedCategoryId);
    const label = cat ? cat.name : "All Categories";
    if (selectedSubcategory !== "All") {
      return `${label} — ${selectedSubcategory}`;
    }
    return label;
  }, [categories, selectedCategoryId, selectedSubcategory]);

  const activeBrandLabel = useMemo(() => {
    if (selectedBrandId === "All") return null;
    const b = brands.find((item) => item.id === selectedBrandId);
    return b ? b.name : null;
  }, [brands, selectedBrandId]);

  const resetFilters = () => {
    setSelectedCategoryId("All");
    setSelectedBrandId("All");
    setSelectedSubcategory("All");
    setMaxPrice(maxAvailablePrice);
    setOnlyOffers(false);
    setTopRatedOnly(false);
    setSortKey("featured");
  };

  const closeFilters = () => setIsFilterOpen(false);

  const filtersPanel = (
    <>
      <div className="flex items-center justify-between pb-4 border-b border-line/50 mb-5">
        <p className="text-sm font-semibold tracking-tight text-foreground">
          Filters
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-3"
          onClick={resetFilters}
        >
          <FiRefreshCw className="text-[14px]" />
          Reset
        </Button>
      </div>

      <div className="space-y-7">
        {/* Category Parent Filter - E-Commerce Vertical List with Icons */}
        <div>
          <p className="text-[11px] uppercase tracking-widest text-text-soft font-bold mb-3">
            CATEGORIES
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => {
                setSelectedCategoryId("All");
                setSelectedSubcategory("All");
              }}
              className={[
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left",
                selectedCategoryId === "All"
                  ? "bg-accent/10 text-accent"
                  : "text-foreground/80 hover:bg-surface-strong hover:text-foreground",
              ].join(" ")}
            >
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <FiFilter className="text-lg" />
              </div>
              <span className="font-medium text-base">All Categories</span>
            </button>
            {categories.map((category) => {
              const active = selectedCategoryId === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setSelectedCategoryId(category.id);
                    setSelectedSubcategory("All");
                  }}
                  className={[
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left",
                    active
                      ? "bg-accent/10 text-accent"
                      : "text-foreground/80 hover:bg-surface-strong hover:text-foreground",
                  ].join(" ")}
                >
                  <div className="w-9 h-9 flex items-center justify-center shrink-0">
                    <img
                      src={getCategoryIconPath(category.icon)}
                      alt=""
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <span className="truncate font-medium text-base">
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Subcategory Nested Filter */}
        {selectedCategoryId !== "All" && activeSubcategories.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-widest text-text-soft font-bold mb-3">
              SUBCATEGORY
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedSubcategory("All")}
                className={[
                  "px-3 py-1.5 rounded-full text-[11px] font-medium transition-all border",
                  selectedSubcategory === "All"
                    ? "border-accent bg-accent text-white"
                    : "border-line bg-transparent text-foreground hover:border-accent/40 hover:bg-surface-strong",
                ].join(" ")}
              >
                All
              </button>
              {activeSubcategories.map((sub: string) => {
                const active = selectedSubcategory === sub;

                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubcategory(sub)}
                    className={[
                      "px-3 py-1.5 rounded-full text-[11px] font-medium transition-all border",
                      active
                        ? "border-accent bg-accent text-white"
                        : "border-line bg-transparent text-foreground hover:border-accent/40 hover:bg-surface-strong",
                    ].join(" ")}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Brand Filter */}
        {brands.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-widest text-text-soft font-bold mb-3">
              BRANDS
            </p>
            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
              <button
                type="button"
                onClick={() => setSelectedBrandId("All")}
                className={[
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  selectedBrandId === "All"
                    ? "bg-accent/10 text-accent"
                    : "text-foreground/80 hover:bg-surface-strong",
                ].join(" ")}
              >
                All Brands
              </button>
              {brands.map((brand) => {
                const active = selectedBrandId === brand.id;
                return (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => setSelectedBrandId(brand.id)}
                    className={[
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-left",
                      active
                        ? "bg-accent/10 text-accent"
                        : "text-foreground/80 hover:bg-surface-strong",
                    ].join(" ")}
                  >
                    <div className="w-7 h-7 shrink-0 bg-white border border-line rounded-full flex items-center justify-center overflow-hidden">
                      {brand.logo ? (
                        <img
                          src={brand.logo}
                          alt=""
                          className="w-full h-full object-contain p-0.5"
                        />
                      ) : (
                        <div className="text-[9px] text-text-soft font-bold">
                          {brand.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="truncate">{brand.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price Filter */}
        <div>
          <p className="text-[11px] uppercase tracking-widest text-text-soft font-bold mb-3">
            PRICE RANGE
          </p>
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-soft">
                {minAvailablePrice}
              </span>
              <input
                type="range"
                min={minAvailablePrice}
                max={maxAvailablePrice}
                value={maxPrice}
                onChange={(event) => {
                  setMaxPrice(Number(event.target.value));
                }}
                className="w-full accent-[color:var(--accent)]"
              />
              <span className="text-sm text-text-soft">{maxPrice}</span>
            </div>
          </div>
        </div>

        {/* Sorting Selection */}
        <div>
          <p className="text-[11px] uppercase tracking-widest text-text-soft font-bold mb-3">
            SORT BY
          </p>
          <div className="space-y-3">
            <label className="block text-sm text-foreground">
              <select
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as SortKey)}
                className="w-full border border-line bg-surface rounded-lg px-3 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <LogoLoader size="lg" />
        <p className="text-sm text-text-soft">Loading Elara shop...</p>
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
      <div className="mb-12 mx-auto max-w-3xl text-center">
        <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl">
          Explore products by category.
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden h-fit border border-line/50 bg-surface rounded-2xl p-6 lg:block lg:sticky lg:top-6">
          {filtersPanel}
        </aside>

        <AnimatePresence>
          {isFilterOpen ? (
            <motion.div
              key="filter-drawer"
              className="fixed inset-0 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.button
                type="button"
                aria-label="Close filters"
                className="absolute inset-0 bg-black/30"
                onClick={closeFilters}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.aside
                className="absolute inset-y-0 left-0 z-50 w-[88vw] max-w-sm overflow-y-auto border-r border-line bg-surface p-5 shadow-[18px_0_40px_rgba(20,17,15,0.12)]"
                initial={{ x: -24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -24, opacity: 0 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-4 flex items-center justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-3"
                    onClick={closeFilters}
                  >
                    <FiX className="text-[14px]" />
                    Close
                  </Button>
                </div>
                {filtersPanel}
              </motion.aside>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Button
                variant="primary"
                size="sm"
                className="h-9 px-3 lg:hidden"
                onClick={() => setIsFilterOpen(true)}
              >
                <FiFilter className="text-[14px]" />
                Filter
              </Button>
              {/* Active Category Tag */}
              {selectedCategoryId !== "All" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId("All");
                    setSelectedSubcategory("All");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium transition-all h-9 rounded-full bg-accent text-white shadow-sm hover:bg-accent-deep"
                >
                  <span>{activeCategoryLabel}</span>
                  <FiX className="text-[12px]" />
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium h-9 rounded-full bg-surface-strong text-foreground/80">
                  All Categories
                </div>
              )}

              {/* Active Brand Tag */}
              {selectedBrandId !== "All" && activeBrandLabel && (
                <button
                  type="button"
                  onClick={() => setSelectedBrandId("All")}
                  className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium transition-all h-9 rounded-full bg-accent text-white shadow-sm hover:bg-accent-deep"
                >
                  <span>Brand: {activeBrandLabel}</span>
                  <FiX className="text-[12px]" />
                </button>
              )}
            </div>
            <span className="hidden lg:block shrink-0 text-xs uppercase tracking-[0.22em] text-text-soft">
              {filteredProducts.length} items
            </span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id || product.slug}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="border border-line bg-surface px-6 py-12 text-center">
              <p className="text-lg font-semibold text-foreground">
                No products match these filters.
              </p>
              <p className="mt-2 text-sm leading-7 text-text-soft">
                Try another category or loosen the price range to see more
                items.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-5 h-10 px-4"
                onClick={resetFilters}
              >
                Reset filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
