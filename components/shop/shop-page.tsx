"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import * as RadixSlider from "@radix-ui/react-slider";
import {
  FiFilter,
  FiRefreshCw,
  FiSliders,
  FiX,
  FiChevronDown,
  FiSearch,
} from "react-icons/fi";
import { FaChevronRight, FaStar } from "react-icons/fa";
import { LogoLoader } from "@/components/ui/logo-loader";
import { Button } from "../ui/button";
import { ProductCard } from "../landing/product-card";

type SortKey = "featured" | "price-asc" | "price-desc" | "newest" | "oldest";

// ─── Radio: thick inward ring, no fill ──────────────────────────────────────
function Radio({ active }: { active: boolean }) {
  return (
    <span
      style={{ width: 18, height: 18, minWidth: 18 }}
      className={`rounded-full flex-shrink-0 transition-all duration-200 ${
        active ? "border-[6px] border-accent" : "border-2 border-line"
      }`}
    />
  );
}

const shopGridVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const shopCardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function ShopPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search");

  // ── data ──────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);

  // ── filters ────────────────────────────────────────────────────────────────
  const [selectedCategoryId, setSelectedCategoryId] = useState("All");
  const [selectedBrandId, setSelectedBrandId] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [expandedCatId, setExpandedCatId] = useState<string | null>(null);

  // Real price bounds derived from actual product data on first load
  const [priceBounds, setPriceBounds] = useState<[number, number]>([0, 10000]);
  // Price: display values change while dragging/typing; committed values trigger fetch
  const [displayPrice, setDisplayPrice] = useState<[number, number]>([
    0, 10000,
  ]);
  const [committedPrice, setCommittedPrice] = useState<[number, number]>([
    0, 10000,
  ]);

  const [onlyOffers, setOnlyOffers] = useState(false);
  const [topRatedOnly, setTopRatedOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("featured");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState("All");
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [hasInitializedPrice, setHasInitializedPrice] = useState(false);

  const loaderRef = useRef<HTMLDivElement>(null);
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // ── metadata ───────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [cr, br] = await Promise.all([
          fetch(`${apiBase}/categories`),
          fetch(`${apiBase}/brands`),
        ]);
        const [cj, bj] = await Promise.all([cr.json(), br.json()]);
        if (cj.success)
          setCategories(cj.data.filter((c: any) => c.status === "Active"));
        if (bj.success)
          setBrands(bj.data.filter((b: any) => b.status === "Active"));
      } catch (e) {
        console.error(e);
      }
    })();
  }, [apiBase]);

  useEffect(() => {
    if (categoryParam && categories.length > 0) {
      const m = categories.find(
        (c) =>
          c.id === categoryParam ||
          c.slug === categoryParam ||
          c.name.toLowerCase() === categoryParam.toLowerCase(),
      );
      if (m) {
        setSelectedCategoryId(m.id);
        setExpandedCatId(m.id);
      }
    }
  }, [categoryParam, categories]);

  // ── fetch products — driven by committed price, not display ───────────────
  const fetchProducts = useCallback(
    async (pageNum: number, append = false) => {
      try {
        if (pageNum === 1) setLoading(true);
        else setIsFetchingMore(true);
        const q = new URLSearchParams({
          page: pageNum.toString(),
          limit: "12",
          categoryId: selectedCategoryId,
          brandId: selectedBrandId,
          subcategory: selectedSubcategory,
          search: searchParam || "",
          minPrice: committedPrice[0].toString(),
          maxPrice: committedPrice[1].toString(),
          sort: sortKey,
          hasOffer: onlyOffers ? "true" : "false",
          minRating: selectedRating === "All" ? "" : selectedRating,
        });
        const res = await fetch(`${apiBase}/products?${q}`);
        const json = await res.json();
        if (json.success) {
          if (append) {
            setProducts((p) => [...p, ...json.data]);
          } else {
            setProducts(json.data);
            // Derive actual price bounds ONLY on the very first unfiltered load
            if (
              !hasInitializedPrice &&
              pageNum === 1 &&
              json.data.length > 0 &&
              selectedCategoryId === "All" &&
              selectedBrandId === "All" &&
              selectedSubcategory === "All"
            ) {
              const allPrices = json.data
                .flatMap((p: any) => p.sizes?.map((s: any) => s.price) ?? [])
                .filter((v: number) => typeof v === "number" && v > 0);
              if (allPrices.length > 0) {
                const realMin = Math.floor(Math.min(...allPrices));
                const realMax = Math.ceil(Math.max(...allPrices));
                setPriceBounds([realMin, realMax]);
                setDisplayPrice([realMin, realMax]);
                setCommittedPrice([realMin, realMax]);
                setHasInitializedPrice(true);
              }
            }
          }
          setHasMore(json.data.length === 12);
          if (json.pagination) {
            setTotalProducts(json.pagination.total);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
      }
    },
    [
      selectedCategoryId,
      selectedBrandId,
      selectedSubcategory,
      searchParam,
      committedPrice,
      sortKey,
      onlyOffers,
      selectedRating,
      apiBase,
    ],
  );

  useEffect(() => {
    setPage(1);
    fetchProducts(1, false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [fetchProducts]);

  useEffect(() => {
    if (!hasMore || loading || isFetchingMore) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const n = page + 1;
          setPage(n);
          fetchProducts(n, true);
        }
      },
      { threshold: 0.1 },
    );
    if (loaderRef.current) obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore, loading, isFetchingMore, page, fetchProducts]);

  const resetFilters = () => {
    setSelectedCategoryId("All");
    setSelectedBrandId("All");
    setSelectedSubcategory("All");
    setExpandedCatId(null);
    setDisplayPrice(priceBounds);
    setCommittedPrice(priceBounds);
    setOnlyOffers(false);
    setSelectedRating("All");
    setSortKey("featured");
  };

  const totalCount = useMemo(
    () => categories.reduce((a, c) => a + (c.products || 0), 0),
    [categories],
  );

  // ── sidebar ────────────────────────────────────────────────────────────────
  const filtersPanel = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-line/40 mb-5 shrink-0">
        <span className="font-bold text-base text-foreground flex items-center gap-2">
          <FiSliders className="text-accent" /> Filters
        </span>
        <button
          onClick={resetFilters}
          className="text-xs font-bold text-accent flex items-center gap-1 hover:underline"
        >
          <FiRefreshCw size={11} /> Reset
        </button>
      </div>

      <div className="flex-1 pb-6">
        {/* ── Price ── */}
        <div className="mb-6">
          <p className="text-sm text-text-soft mb-5">Price</p>

          {/* Radix dual slider */}
          <div className="px-2 mb-4">
            <RadixSlider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              min={priceBounds[0]}
              max={priceBounds[1]}
              step={10}
              minStepsBetweenThumbs={1}
              value={displayPrice}
              onValueChange={(val) => setDisplayPrice(val as [number, number])}
              onValueCommit={(val) =>
                setCommittedPrice(val as [number, number])
              }
            >
              <RadixSlider.Track className="relative grow rounded-full h-[4px] bg-line/50">
                <RadixSlider.Range className="absolute rounded-full h-full bg-accent" />
              </RadixSlider.Track>
              <RadixSlider.Thumb
                className="block w-5 h-5 bg-white border-4 border-accent rounded-full focus:outline-none hover:scale-110 transition-transform cursor-grab active:cursor-grabbing"
                aria-label="Min price"
              />
              <RadixSlider.Thumb
                className="block w-5 h-5 bg-white border-4 border-accent rounded-full focus:outline-none hover:scale-110 transition-transform cursor-grab active:cursor-grabbing"
                aria-label="Max price"
              />
            </RadixSlider.Root>
          </div>

          {/* Min / Max input boxes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-text-soft mb-1">Min</p>
              <div className="flex items-center gap-1.5 border border-line/60 px-3 py-2 focus-within:border-accent/60 transition-colors">
                <span className="text-xs text-text-soft">৳</span>
                <input
                  type="number"
                  min={0}
                  max={displayPrice[1] - 50}
                  value={displayPrice[0]}
                  onChange={(e) =>
                    setDisplayPrice([Number(e.target.value), displayPrice[1]])
                  }
                  onBlur={(e) =>
                    setCommittedPrice([
                      Number(e.target.value),
                      committedPrice[1],
                    ])
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      setCommittedPrice([
                        Number((e.target as HTMLInputElement).value),
                        committedPrice[1],
                      ]);
                  }}
                  className="w-full bg-transparent text-sm font-semibold outline-none text-foreground"
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-text-soft mb-1">Max</p>
              <div className="flex items-center gap-1.5 border border-line/60 px-3 py-2 focus-within:border-accent/60 transition-colors">
                <span className="text-xs text-text-soft">৳</span>
                <input
                  type="number"
                  min={displayPrice[0] + 50}
                  max={10000}
                  value={displayPrice[1]}
                  onChange={(e) =>
                    setDisplayPrice([displayPrice[0], Number(e.target.value)])
                  }
                  onBlur={(e) =>
                    setCommittedPrice([
                      committedPrice[0],
                      Number(e.target.value),
                    ])
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      setCommittedPrice([
                        committedPrice[0],
                        Number((e.target as HTMLInputElement).value),
                      ]);
                  }}
                  className="w-full bg-transparent text-sm font-semibold outline-none text-foreground"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Categories ── */}
        <p className="text-sm text-text-soft mb-2">Categories</p>
        <div className="flex flex-col mb-6">
          {/* All */}
          <button
            onClick={() => {
              setSelectedCategoryId("All");
              setSelectedSubcategory("All");
              setExpandedCatId(null);
            }}
            className="flex items-center gap-3 py-2 px-1 w-full text-left group"
          >
            <Radio active={selectedCategoryId === "All"} />
            <div className="flex items-baseline gap-2">
              <span
                className={`text-[15px] ${selectedCategoryId === "All" ? "text-accent font-semibold" : "text-foreground/70 group-hover:text-foreground"}`}
              >
                All Categories
              </span>
              <span className="text-[11px] text-text-soft/60 font-bold">
                ({totalCount})
              </span>
            </div>
          </button>

          {/* Each category */}
          {categories.map((cat) => {
            const isActive = selectedCategoryId === cat.id;
            const isExpanded = expandedCatId === cat.id;
            const hasSubs = cat.subcategories?.length > 0;

            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between py-2 px-1 w-full group">
                  <button
                    className="flex items-center gap-3 flex-1 text-left"
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      setSelectedSubcategory("All");
                      setExpandedCatId(isExpanded ? null : cat.id);
                    }}
                  >
                    <Radio active={isActive} />
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`text-[15px] ${isActive ? "text-accent font-semibold" : "text-foreground/70 group-hover:text-foreground"}`}
                      >
                        {cat.name}
                      </span>
                      <span className="text-[11px] text-text-soft/60 font-bold">
                        ({cat.products || 0})
                      </span>
                    </div>
                  </button>
                  {hasSubs && (
                    <button
                      onClick={() =>
                        setExpandedCatId(isExpanded ? null : cat.id)
                      }
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-strong transition-colors"
                    >
                      <FiChevronDown
                        size={14}
                        className={`text-text-soft transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </div>

                {/* Subcategories */}
                <AnimatePresence>
                  {isExpanded && hasSubs && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden pl-8 flex flex-col"
                    >
                      {cat.subcategories.map((sub: string) => (
                        <button
                          key={sub}
                          onClick={() => setSelectedSubcategory(sub)}
                          className="flex items-center gap-3 py-1.5 px-1 text-left group"
                        >
                          <Radio active={selectedSubcategory === sub} />
                          <span
                            className={`text-[14px] ${selectedSubcategory === sub ? "text-accent font-semibold" : "text-text-soft group-hover:text-foreground"}`}
                          >
                            {sub}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* ── Brands ── */}
        {brands.length > 0 && (
          <div className="pt-2 mb-4">
            <button
              onClick={() => setIsBrandOpen((v) => !v)}
              className="w-full flex items-center justify-between mb-3 text-sm text-text-soft hover:text-foreground transition-colors"
            >
              Brands
              <FiChevronDown
                className={`transition-transform duration-300 ${isBrandOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {isBrandOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div
                    className="max-h-56 overflow-y-auto flex flex-col pr-1"
                    style={{ scrollbarWidth: "thin" }}
                  >
                    {[{ id: "All", name: "All Brands" }, ...brands].map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBrandId(b.id)}
                        className="flex items-center gap-3 py-2 px-1 text-left group"
                      >
                        <Radio active={selectedBrandId === b.id} />
                        <span
                          className={`text-[14px] truncate ${selectedBrandId === b.id ? "text-accent font-semibold" : "text-foreground/70 group-hover:text-foreground"}`}
                        >
                          {b.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── Rating ── */}
        <div className="border-t border-line/30 pt-5 mb-6">
          <button
            onClick={() => setIsRatingOpen((v) => !v)}
            className="w-full flex items-center justify-between mb-3 text-sm text-text-soft hover:text-foreground transition-colors"
          >
            Rating
            <FiChevronDown
              className={`transition-transform duration-300 ${isRatingOpen ? "rotate-180" : ""}`}
            />
          </button>
          <AnimatePresence>
            {isRatingOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-1">
                  {["All", "5.0", "4.0", "3.0", "2.0", "1.0"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRating(r)}
                      className="flex items-center gap-3 py-2 px-1 text-left group"
                    >
                      <Radio active={selectedRating === r} />
                      <div className="flex items-center gap-2">
                        {r === "All" ? (
                          <span
                            className={`text-[14px] ${selectedRating === "All" ? "text-accent font-semibold" : "text-foreground/70 group-hover:text-foreground"}`}
                          >
                            All
                          </span>
                        ) : (
                          <>
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  size={12}
                                  className={
                                    i < Math.floor(parseFloat(r))
                                      ? "text-yellow-400"
                                      : "text-line"
                                  }
                                />
                              ))}
                            </div>
                            <span
                              className={`text-[14px] ${selectedRating === r ? "text-accent font-semibold" : "text-foreground/70 group-hover:text-foreground"}`}
                            >
                              {r}
                            </span>
                          </>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  return (
    <section className="w-full pt-8 pb-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* ── Banner ── */}
        <div className="w-full mb-12 text-center flex flex-col items-center">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-text-soft/60 mb-2">
            <Link href="/" className="hover:text-accent transition-colors">
              Home
            </Link>
            <span className="opacity-40">
              <FaChevronRight />
            </span>
            <span className="text-text-soft">Shop</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif tracking-tight text-foreground">
            {selectedCategoryId === "All"
              ? "The Shop"
              : categories.find((c) => c.id === selectedCategoryId)?.name}
            {selectedSubcategory !== "All" && (
              <span className="text-accent/30 font-light ml-4 select-none">
                / {selectedSubcategory}
              </span>
            )}
          </h1>
        </div>

        <div className="grid lg:grid-cols-[250px_minmax(0,1fr)] gap-8 items-start">
          {/* Sidebar — sticky, scrolls independently, Lenis excluded */}
          <aside
            data-lenis-prevent
            className="hidden lg:flex flex-col h-[calc(100vh-120px)] sticky top-24 overflow-y-auto border border-line/40 rounded-3xl p-6 bg-surface shadow-sm custom-sidebar-scroll"
          >
            <style jsx>{`
              .custom-sidebar-scroll::-webkit-scrollbar {
                width: 2px;
              }
              .custom-sidebar-scroll::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-sidebar-scroll::-webkit-scrollbar-thumb {
                background: transparent;
                border-radius: 10px;
              }
              .custom-sidebar-scroll:hover::-webkit-scrollbar-thumb {
                background: #e5e7eb;
              }
              .custom-sidebar-scroll {
                scrollbar-width: none;
              }
              .custom-sidebar-scroll:hover {
                scrollbar-width: thin;
                scrollbar-color: #e5e7eb transparent;
              }
            `}</style>
            {filtersPanel}
          </aside>

          {/* Products — normal page flow */}
          <div className="space-y-2">
            {/* Top Toolbar: mobile trigger + count + Sort */}
            <div className="flex items-center justify-between flex-row-reverse lg:flex-row">
              {/* Desktop: Right-aligned Sort / Mobile: Left-aligned Sort */}
              <div className="relative order-2 lg:order-none">
                <button
                  onClick={() => setIsSortOpen((v) => !v)}
                  className="flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-2.5 rounded-full bg-surface border border-line/40 hover:border-accent/40 transition-all group"
                >
                  <span className="text-[10px] sm:text-[11px] font-bold text-text-soft uppercase tracking-widest group-hover:text-foreground">
                    <span className="hidden sm:inline">Sort: </span>
                    <span className="text-foreground">
                      {sortKey === "featured" && "Featured"}
                      {sortKey === "newest" && "Newest"}
                      {sortKey === "oldest" && "Oldest"}
                      {sortKey === "price-asc" && "Low to High"}
                      {sortKey === "price-desc" && "High to Low"}
                    </span>
                  </span>
                  <FiChevronDown
                    className={`transition-transform duration-300 ${isSortOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isSortOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[60]"
                        onClick={() => setIsSortOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 lg:left-auto lg:right-0 mt-2 w-48 bg-white border border-line/40 rounded-2xl shadow-xl z-[70] p-1.5 overflow-hidden"
                      >
                        {[
                          { id: "featured", label: "Featured" },
                          { id: "newest", label: "Newest" },
                          { id: "oldest", label: "Oldest" },
                          { id: "price-asc", label: "Price: Low to High" },
                          { id: "price-desc", label: "Price: High to Low" },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setSortKey(opt.id as SortKey);
                              setIsSortOpen(false);
                            }}
                            className={`w-full flex items-center px-4 py-2.5 text-[13px] rounded-xl transition-colors ${
                              sortKey === opt.id
                                ? "bg-accent text-white font-bold"
                                : "text-text-soft hover:bg-surface-strong hover:text-foreground"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Desktop: Left-aligned Filter + Count / Mobile: Right-aligned Filter Icon */}
              <div className="flex items-center gap-4 order-1 lg:order-none">
                <button
                  type="button"
                  className="h-10 w-10 flex lg:hidden items-center justify-center rounded-xl border border-line/40 bg-surface text-text-soft transition-all active:scale-95"
                  onClick={() => setIsFilterOpen(true)}
                >
                  <FiFilter size={18} />
                </button>
                
                {/* Product Count - Hidden on mobile */}
                <span className="hidden lg:inline text-[11px] font-bold text-text-soft uppercase tracking-widest">
                  {!loading && `${totalProducts} Products`}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="py-40 flex flex-col items-center gap-5">
                <LogoLoader size="lg" />
                <p className="text-xs text-text-soft animate-pulse uppercase tracking-[0.3em]">
                  Curating…
                </p>
              </div>
            ) : products.length > 0 ? (
              <>
                <div
                  className="grid gap-5 grid-cols-2 xl:grid-cols-3"
                  key={`${selectedCategoryId}-${selectedBrandId}-${selectedSubcategory}-${committedPrice[0]}-${committedPrice[1]}-${searchParam}`}
                >
                  {products.map((p, idx) => (
                    <motion.div
                      key={`${p.id}-${idx}`}
                      initial={{ opacity: 0, y: 25 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.1 }}
                      transition={{
                        duration: 0.5,
                        ease: [0.16, 1, 0.3, 1],
                        delay: (idx % 3) * 0.05, // Subtle stagger for grid rows
                      }}
                    >
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </div>

                <div ref={loaderRef} className="py-20 flex justify-center">
                  {isFetchingMore && (
                    <div className="flex items-center gap-3 bg-white border border-line px-7 py-3 rounded-full shadow-lg">
                      <FiRefreshCw className="animate-spin text-accent" />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        Loading
                      </span>
                    </div>
                  )}
                  {!hasMore && (
                    <p className="text-xs text-text-soft/50 uppercase tracking-widest font-bold">
                      End of Collection
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="border border-line/40 bg-surface rounded-3xl py-32 text-center flex flex-col items-center">
                <FiSearch className="text-5xl text-text-soft/20 mb-6" />
                <p className="text-xl font-serif font-semibold">
                  No products found
                </p>
                <p className="mt-2 text-sm text-text-soft">
                  Try adjusting your filters.
                </p>
                <Button
                  variant="primary"
                  className="mt-8 rounded-full px-8"
                  onClick={resetFilters}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99] lg:hidden"
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 right-0 w-[90%] max-w-sm bg-white z-[100] p-7 flex flex-col shadow-2xl rounded-l-3xl lg:hidden"
            >
              <div className="flex justify-between items-center mb-7">
                <h2 className="text-xl font-bold">Filters</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-strong"
                >
                  <FiX />
                </button>
              </div>
              <div
                className="flex-1 overflow-y-auto"
                style={{ scrollbarWidth: "none" }}
              >
                {filtersPanel}
              </div>
              <Button
                variant="primary"
                className="mt-6 w-full h-12 rounded-2xl"
                onClick={() => setIsFilterOpen(false)}
              >
                Apply
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
