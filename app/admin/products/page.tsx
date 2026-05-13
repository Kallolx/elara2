"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { FiPlus, FiPackage, FiTrash2, FiEdit3, FiRefreshCw, FiZap, FiSearch } from "react-icons/fi";
import { LogoLoader } from "@/components/ui/logo-loader";
import { Button, ButtonLink } from "@/components/ui/button";

interface ProductSize {
  id: string;
  label: string;
  price: number;
  oldPrice: number | null;
  sku?: string | null;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  subcategory: string | null;
  hasOffer: boolean;
  image: string | null;
  offers?: any[];
  category: {
    name: string;
    slug: string;
  };
  sizes: ProductSize[];
  isOutOfStock: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState("");
  const [syncReport, setSyncReport] = useState<any | null>(null);

  // Master Source States (For Dropdowns)
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [allBrands, setAllBrands] = useState<any[]>([]);

  // Paginated & Search States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 20; // Fixed page size for admin

  // Search input
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  // Filters
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterBrand, setFilterBrand] = useState("ALL");
  const [filterOffer, setFilterOffer] = useState("ALL");

  const getActiveOffer = (product: Product) => {
    if (!product.offers || product.offers.length === 0) return null;
    
    return product.offers.find((o: any) => {
      if (o.status !== 'ACTIVE' || o.code) return false;
      
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      if (o.startDate) {
        const start = new Date(o.startDate);
        start.setHours(0, 0, 0, 0);
        if (start > now) return false;
      }
      
      if (o.endDate) {
        const end = new Date(o.endDate);
        end.setHours(0, 0, 0, 0);
        if (end < now) return false;
      }
      
      return true;
    });
  };

  // Load reference data once
  useEffect(() => {
    const loadRefs = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const [catRes, brandRes] = await Promise.all([
          fetch(`${baseUrl}/categories`),
          fetch(`${baseUrl}/brands`)
        ]);
        const [catJson, brandJson] = await Promise.all([catRes.json(), brandRes.json()]);
        if (catJson.success) setAllCategories(catJson.data);
        if (brandJson.success) setAllBrands(brandJson.data);
      } catch (err) {
        console.error("Failed to load references", err);
      }
    };
    loadRefs();
  }, []);

  // Auto-Search Debounce Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveSearch(searchInput);
    }, 500); // 500ms pause triggers backend lookup
    
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (activeSearch.trim()) query.append("search", activeSearch.trim());
      if (filterCategory !== "ALL") query.append("categoryId", filterCategory);
      if (filterBrand !== "ALL") query.append("brandId", filterBrand);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/products?${query.toString()}`);
      const json = await res.json();
      
      if (json.success) {
        setProducts(json.data);
        // Load pagination data safely
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages || 1);
          setTotalItems(json.pagination.total || json.data.length);
        }
      } else {
        setError(json.message || "Failed to load products");
      }
    } catch (err) {
      setError("Failed to connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  // Re-run fetching whenever pagination or filter state changes
  useEffect(() => {
    fetchProducts();
  }, [currentPage, activeSearch, filterCategory, filterBrand]);

  // Reset to page 1 when filter/search changes to prevent blank offsets
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSearch, filterCategory, filterBrand]);

  // Offers Filtering is done client-side on the PAGINATED set for ease, 
  // though for large sets server-side would be better. We'll retain the existing logical split.
  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      if (filterOffer !== "ALL") {
        const active = getActiveOffer(p);
        if (filterOffer === "HAS_OFFER" && !active) return false;
        if (filterOffer === "NO_OFFER" && active) return false;
        if (filterOffer !== "HAS_OFFER" && filterOffer !== "NO_OFFER") {
          if (!active || active.id !== filterOffer) return false;
        }
      }
      return true;
    });
  }, [products, filterOffer]);

  // Smart Initial Sync Telemetry Probe: Discovers if Global Floating Sync Hub is already running!
  useEffect(() => {
    const checkBackendOnMount = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/sourcing/sync-status`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("elara_token")}` }
        });
        const data = await res.json();
        if (data.success && data.isRunning) {
          setIsAutoSyncing(true);
          setSyncStatusMsg(data.progressMsg || "Synchronizing background thread...");
        }
      } catch (err) {
        console.warn("Failed initial mount-time telemetry probe.");
      }
    };
    checkBackendOnMount();
  }, []);

  // Reusable client-side event-loop poller to maintain live state linkages
  useEffect(() => {
    let pollingHandle: NodeJS.Timeout | null = null;

    if (isAutoSyncing) {
      const pollStatus = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/sourcing/sync-status`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("elara_token")}` }
          });
          const data = await res.json();
          if (!data.success) return;

          // Link local status message immediately to floating telemetry feed!
          setSyncStatusMsg(data.progressMsg || "Syncing...");

          if (data.status === "completed") {
            setIsAutoSyncing(false);
            setSyncStatusMsg("");
            setSyncReport(data.result);
            fetchProducts(); // refresh product list
          } else if (data.status === "failed") {
            setIsAutoSyncing(false);
            setSyncStatusMsg("");
            alert(`❌ Cloud Sync Failed:\n\n${data.error || "Unknown error"}`);
          }
        } catch (err) {
          console.warn("Linked telemetry blip:", err);
        }
      };

      pollStatus();
      pollingHandle = setInterval(pollStatus, 2500);
    }

    return () => {
      if (pollingHandle) clearInterval(pollingHandle);
    };
  }, [isAutoSyncing]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("elara_token")}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(json.message || "Failed to delete product");
      }
    } catch (err) {
      alert("Error connecting to the backend server.");
    }
  };

  const runAutoSync = async () => {
    const userConsent = confirm(
      "Initiate Precision Catalog Stock Sync?\n\nThis launches an ultra-targeted search against active local barcodes to reconcile live inventories.\n\nLaunch Sync?"
    );
    if (!userConsent) return;

    setIsAutoSyncing(true);
    setSyncStatusMsg("🚀 Spawning cloud thread...");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/sourcing/auto-sync`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("elara_token")}`,
        },
      });
      
      const data = await res.json();
      if (!data.success) {
        setIsAutoSyncing(false);
        setSyncStatusMsg("");
        alert(`❌ Sync Denied: ${data.message}`);
        return;
      }
      
      // The persistent useEffect above automatically grabs this toggle state and spins the interval!
    } catch (err) {
      setIsAutoSyncing(false);
      setSyncStatusMsg("");
      alert("Automation gateway offline.");
    }
  };

  return (
    <div className="space-y-6">
      <article className="border border-line bg-surface">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line px-4 py-4 bg-surface-strong/30">
          <div>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-foreground">
              Manage products and sizes
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={runAutoSync}
              disabled={isAutoSyncing}
              variant="outline"
              className="border-[#6366f1]/30 text-[#6366f1] hover:bg-[#6366f1] hover:text-white"
            >
              {isAutoSyncing ? (
                <>
                  <FiRefreshCw className="animate-spin text-sm mr-1.5 shrink-0 text-[#6366f1]" />
                  <span className="text-[11px] font-semibold tracking-wide text-[#6366f1]">
                    {syncStatusMsg || "Syncing catalog..."}
                  </span>
                </>
              ) : (
                <>
                  <FiZap className="text-sm" />
                  Sync Live Stocks
                </>
              )}
            </Button>
            
            <ButtonLink href="/admin/products/new">
              <FiPlus className="text-[14px]" />
              Add product
            </ButtonLink>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3 bg-surface text-sm">
          {/* Search Block */}
          <form 
            onSubmit={(e) => { e.preventDefault(); setActiveSearch(searchInput); }}
            className="relative min-w-[240px]"
          >
            <input 
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by Name or SKU..."
              className="w-full border border-line bg-background pl-3 pr-10 py-1.5 outline-none focus:border-accent"
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-soft hover:text-accent"
            >
              <FiSearch className="text-sm" />
            </button>
          </form>

          <div className="h-5 w-[1px] bg-line mx-1 hidden md:block" />

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-line bg-background px-3 py-1.5 outline-none focus:border-accent min-w-[140px]"
          >
            <option value="ALL">All Categories</option>
            {allCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="border border-line bg-background px-3 py-1.5 outline-none focus:border-accent min-w-[140px]"
          >
            <option value="ALL">All Brands</option>
            {allBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          
          <select
            value={filterOffer}
            onChange={(e) => setFilterOffer(e.target.value)}
            className="border border-line bg-background px-3 py-1.5 outline-none focus:border-accent"
          >
            <option value="ALL">All Offers</option>
            <option value="HAS_OFFER">Any Active Offer</option>
            <option value="NO_OFFER">No Active Offer</option>
          </select>

          <Button
            onClick={fetchProducts}
            variant="outline"
            className="ml-auto flex items-center gap-2 h-[34px] px-3 border-line text-text-soft hover:text-foreground"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <LogoLoader size="lg" />
            <p className="text-sm text-text-soft">Loading products from database...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center space-y-4">
            <p className="text-red-500 font-medium">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 text-xs uppercase tracking-[0.22em] border border-line bg-background text-foreground hover:bg-surface-strong"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* High Fidelity Empty State */
          <div className="flex flex-col items-center justify-center p-12 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center border border-line bg-background text-text-soft mb-4">
              <FiPackage className="text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-foreground tracking-[-0.02em]">No Products Found</h3>
            <p className="mt-2 text-sm text-text-soft max-w-sm leading-6">
              Your inventory is currently empty. Get started by adding your first skincare product with prices, sizes, and galleries.
            </p>
            <div className="mt-6">
              <ButtonLink href="/admin/products/new">
                <FiPlus className="text-[14px]" />
                Add your first product
              </ButtonLink>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="space-y-3 p-5 md:hidden">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="border border-line bg-background px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-12 w-12 shrink-0 border border-line object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-line bg-surface text-text-soft">
                        <FiPackage className="text-lg" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-foreground truncate">
                        {product.name}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-text-soft">
                        ID: {product.id.length > 10 ? product.id.substring(0, 10) + "..." : product.id}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] uppercase tracking-[0.22em] font-semibold">
                        <div className="text-text-soft flex flex-wrap gap-1.5 items-center">
                          <span>SKUs:</span>
                          {Array.from(new Set([
                            product.sku,
                            ...(product.sizes?.map((s: any) => s.sku) || [])
                          ].filter(Boolean))).map((s: any, idx) => (
                            <span key={idx} className="bg-surface px-1 border border-line text-[10px] tracking-tight normal-case">{s}</span>
                          ))}
                        </div>
                        <span className={`px-2 py-0.5 rounded-sm text-[9px] border ${
                          product.isOutOfStock ? "border-red-100 bg-red-50 text-red-600" : "border-emerald-100 bg-emerald-50 text-emerald-600"
                        }`}>
                          {product.isOutOfStock ? "Sold Out" : "In Stock"}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-text-soft">
                        Category: {product.category?.name || "Uncategorized"}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-foreground shrink-0">
                      {product.sizes[0] ? `${product.sizes[0].price} BDT` : "No price"}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-text-soft">
                    <div className="flex items-center justify-between border-t border-line pt-3">
                      <span>Sizes</span>
                      <span className="text-foreground">
                        {product.sizes.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-line pt-3">
                      <span>Offer</span>
                      <span className={`font-bold uppercase tracking-[0.1em] text-[11px] ${
                        getActiveOffer(product) ? "text-red-500" : "text-text-soft"
                      }`}>
                        {getActiveOffer(product) ? getActiveOffer(product).title : "Standard"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
                    <ButtonLink
                      href={`/admin/products/${product.id}/edit`}
                      variant="outline"
                      size="sm"
                    >
                      <FiEdit3 className="text-[14px]" />
                      Edit
                    </ButtonLink>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      className="border border-line bg-surface px-3 py-2 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <FiTrash2 className="text-[14px]" />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-line text-[11px] uppercase tracking-[0.26em] text-text-soft">
                  <tr>
                    <th className="px-5 py-4 font-normal">Product ID</th>
                    <th className="px-5 py-4 font-normal">Product</th>
                    <th className="px-5 py-4 font-normal">SKU</th>
                    <th className="px-5 py-4 font-normal">Category</th>
                    <th className="px-5 py-4 font-normal">Sizes</th>
                    <th className="px-5 py-4 font-normal">Base price</th>
                    <th className="px-5 py-4 font-normal">Stock Status</th>
                    <th className="px-5 py-4 font-normal">Offer</th>
                    <th className="px-5 py-4 font-normal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-line last:border-b-0"
                    >
                      <td className="px-5 py-4 text-xs font-semibold text-text-soft">
                        <span title={product.id}>
                          {product.id.length > 12 ? product.id.substring(0, 12) + "..." : product.id}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium text-foreground">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-10 w-10 border border-line object-cover shrink-0"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-line bg-surface text-text-soft">
                              <FiPackage className="text-sm" />
                            </div>
                          )}
                          <span className="truncate max-w-[200px]">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-text-soft">
                        <div className="flex flex-col gap-0.5 min-w-[120px]">
                          {Array.from(new Set([
                            product.sku,
                            ...(product.sizes?.map((s: any) => s.sku) || [])
                          ].filter(Boolean))).map((s: any, idx) => (
                            <span key={idx} className="text-[11px] font-medium tracking-wide text-foreground/90" title={s}>
                              {s}
                            </span>
                          ))}
                          {(!product.sku && (!product.sizes || !product.sizes.some(s => s.sku))) && (
                            <span className="text-xs italic opacity-40">No SKU</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-text-soft">
                        {product.category?.name || "Uncategorized"}
                      </td>
                      <td className="px-5 py-4 text-text-soft">
                        {product.sizes.length}
                      </td>
                      <td className="px-5 py-4 text-text-soft">
                        {product.sizes[0] ? `${product.sizes[0].price} BDT` : "-"}
                      </td>
                      <td className="px-5 py-4 text-text-soft">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.08em] border ${
                          product.isOutOfStock 
                            ? "border-red-100 bg-red-50 text-red-600" 
                            : "border-emerald-100 bg-emerald-50 text-emerald-600"
                        }`}>
                          {product.isOutOfStock ? "Out of Stock" : "Available"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-text-soft">
                        <span className={`text-[11px] font-bold uppercase tracking-[0.1em] ${
                          getActiveOffer(product) ? "text-red-500" : "text-text-soft"
                        }`}>
                          {getActiveOffer(product) ? getActiveOffer(product).title : "Standard"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <ButtonLink
                            href={`/admin/products/${product.id}/edit`}
                            variant="outline"
                            size="sm"
                          >
                            <FiEdit3 className="text-[14px]" />
                            Edit
                          </ButtonLink>
                          <button
                            type="button"
                            onClick={() => handleDelete(product.id)}
                            className="border border-line bg-background p-2 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <FiTrash2 className="text-[14px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Compact Navigation Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-line px-5 py-4 bg-surface-strong/20">
              <span className="text-xs font-medium text-text-soft">
                Showing <span className="text-foreground font-bold">{(currentPage - 1) * limit + 1}</span> to <span className="text-foreground font-bold">{Math.min(currentPage * limit, totalItems)}</span> of <span className="text-foreground font-bold">{totalItems}</span> entries
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                  className="h-8 text-xs px-3"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1 text-xs px-2 font-bold text-foreground">
                  Page {currentPage} of {totalPages || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                  className="h-8 text-xs px-3"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </article>

      {/* Enriched Sync Summary Modal Diagnostics */}
      {syncReport && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white border border-line shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col rounded-xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500 text-slate-900 h-8 w-8 rounded-full flex items-center justify-center font-bold text-lg">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Intelligent Sync Report</h3>
                  <p className="text-[10px] text-slate-300 uppercase tracking-wider font-medium">
                    Koba Automated Crawl Diagnostics
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSyncReport(null)}
                className="text-slate-400 hover:text-white text-xl outline-none leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Stat Summary Grid */}
            <div className="grid grid-cols-3 border-b border-line divide-x divide-line bg-slate-50 flex-shrink-0">
              <div className="p-4 text-center">
                <span className="block text-[10px] font-bold uppercase text-text-soft tracking-wider">
                  Scanned Products
                </span>
                <span className="block text-2xl font-extrabold text-foreground mt-1">
                  {syncReport.totalScanned || 0}
                </span>
              </div>
              <div className="p-4 text-center">
                <span className="block text-[10px] font-bold uppercase text-text-soft tracking-wider">
                  Matches Linked
                </span>
                <span className="block text-2xl font-extrabold text-[#6366f1] mt-1">
                  {syncReport.totalMatches || 0}
                </span>
              </div>
              <div className="p-4 text-center bg-emerald-50/20">
                <span className="block text-[10px] font-bold uppercase text-emerald-800 tracking-wider">
                  SQL Adjustments
                </span>
                <span className="block text-2xl font-extrabold text-emerald-600 mt-1">
                  +{syncReport.updatedCount || 0}
                </span>
              </div>
            </div>

            {/* Scrollable Result Table */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              <h4 className="text-xs font-bold uppercase tracking-widest text-text-soft mb-4">
                Resolved Catalog Items ({syncReport.matches?.length || 0})
              </h4>

              <div className="border border-line rounded-lg overflow-hidden divide-y divide-line">
                {!syncReport.matches || syncReport.matches.length === 0 ? (
                  <div className="p-8 text-center text-sm text-text-soft italic">
                    No catalog items were mapped during this sync cycle.
                  </div>
                ) : (
                  syncReport.matches.map((m: any, idx: number) => (
                    <div
                      key={idx}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-slate-50/80 transition-colors ${
                        m.wasUpdated
                          ? "bg-emerald-50/30 border-l-4 border-l-emerald-500"
                          : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="font-semibold text-foreground text-[13px] truncate">
                          {m.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px]">
                          <span className="font-mono text-text-soft select-all">
                            SKU: {m.sku}
                          </span>
                          <span className="h-1 w-1 bg-text-soft/30 rounded-full"></span>
                          <span
                            className={`font-bold px-1.5 rounded border text-[9px] uppercase tracking-wide ${
                              m.method === "Direct SKU"
                                ? "text-[#6366f1] bg-[#6366f1]/5 border-[#6366f1]/20"
                                : "text-amber-700 bg-amber-50 border-amber-100"
                            }`}
                          >
                            {m.method}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                            m.outOfStock
                              ? "text-red-600 bg-red-50 border-red-100"
                              : "text-emerald-700 bg-emerald-50 border-emerald-100"
                          }`}
                        >
                          {m.outOfStock ? "Out of Stock" : "In Stock"}
                        </span>

                        {m.wasUpdated ? (
                          <span className="text-[9px] uppercase tracking-widest font-extrabold px-2 py-1 bg-emerald-600 text-white rounded flex items-center gap-1 animate-pulse shadow-sm">
                            🔥 UPDATED
                          </span>
                        ) : (
                          <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-1 text-stone-400 border border-stone-200 rounded">
                            SYNCED
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-slate-50 border-t border-line p-4 flex justify-end flex-shrink-0">
              <Button
                onClick={() => setSyncReport(null)}
                variant="primary"
                className="px-8 font-semibold"
              >
                Close Diagnostics
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
