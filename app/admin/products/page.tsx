"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { FiPlus, FiPackage, FiTrash2, FiEdit3, FiRefreshCw, FiZap } from "react-icons/fi";
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

  const uniqueCategories = useMemo(() => {
    const map = new Map();
    products.forEach(p => {
      if (p.categoryId && p.category) map.set(p.categoryId, p.category.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  const uniqueBrands = useMemo(() => {
    const map = new Map();
    products.forEach((p: any) => {
      if (p.brand && p.brand.id) map.set(p.brand.id, p.brand.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  const uniqueOffers = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      const active = getActiveOffer(p);
      if (active) map.set(active.id, active.title);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      if (filterCategory !== "ALL" && p.categoryId !== filterCategory) return false;
      if (filterBrand !== "ALL" && (!p.brand || p.brand.id !== filterBrand)) return false;
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
  }, [products, filterCategory, filterBrand, filterOffer]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/products`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      } else {
        setError(json.message || "Failed to load products");
      }
    } catch (err) {
      setError("Failed to connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
        <div className="flex items-center justify-between border-b border-line px-5 py-4 bg-surface-strong/30">
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

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3 bg-surface text-sm">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-line bg-background px-3 py-1.5 outline-none focus:border-accent"
          >
            <option value="ALL">All Categories</option>
            {uniqueCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="border border-line bg-background px-3 py-1.5 outline-none focus:border-accent"
          >
            <option value="ALL">All Brands</option>
            {uniqueBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          
          <select
            value={filterOffer}
            onChange={(e) => setFilterOffer(e.target.value)}
            className="border border-line bg-background px-3 py-1.5 outline-none focus:border-accent"
          >
            <option value="ALL">All Offers</option>
            <option value="HAS_OFFER">Any Active Offer</option>
            <option value="NO_OFFER">No Active Offer</option>
            {uniqueOffers.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
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
          </>
        )}
      </article>
    </div>
  );
}
