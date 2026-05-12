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
      "Run Full Inventory Sync?\n\nThis will boot our automated crawler, log into the supplier portal, scrape the last 15 pages of products, and bulk-update your store automatically.\n\nThis might take 30-60 seconds to complete. Do you want to proceed?"
    );
    if (!userConsent) return;

    setIsAutoSyncing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/sourcing/auto-sync`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("elara_token")}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        alert(`✅ Sync Completed Successfully!\n\nTotal Scanned: ${json.totalScanned} products.\nRecords Updated: ${json.updatedCount}`);
        fetchProducts(); // reload locally to reflect changes
      } else {
        alert(`❌ Sync Failed: ${json.message}`);
      }
    } catch (err) {
      alert("Automation link broken. Ensure backend is running.");
    } finally {
      setIsAutoSyncing(false);
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
                  <FiRefreshCw className="animate-spin text-sm mr-1" />
                  Syncing...
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
                        <p className="text-text-soft">SKU: {product.sku}</p>
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
                      <td className="px-5 py-4 text-text-soft">{product.sku}</td>
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
    </div>
  );
}
