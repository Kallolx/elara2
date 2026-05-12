"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiSave, FiSearch, FiCheckSquare, FiSquare } from "react-icons/fi";

export default function NewOfferPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Master dataset sources
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  // Local filter inputs
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedBrand, setSelectedBrand] = useState("ALL");

  const [formData, setFormData] = useState({
    title: "",
    code: "",
    discountType: "PERCENTAGE",
    discountValue: 0,
    status: "ACTIVE",
    isFlashSale: false,
    startDate: "",
    endDate: "",
    productIds: [] as string[],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setFetching(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        
        // Fetch product catalogue, categories, and brands in parallel
        const [pRes, cRes, bRes] = await Promise.all([
          fetch(`${baseUrl}/products`),
          fetch(`${baseUrl}/categories`),
          fetch(`${baseUrl}/brands`)
        ]);
        
        const [pJson, cJson, bJson] = await Promise.all([
          pRes.json(), 
          cRes.json(), 
          bRes.json()
        ]);
        
        if (pJson.success) setProducts(pJson.data);
        if (cJson.success) setCategories(cJson.data);
        if (bJson.success) setBrands(bJson.data);
      } catch (err) {
        console.error("Failed loading resources:", err);
      } finally {
        setFetching(false);
      }
    };
    loadData();
  }, []);

  // Optimize searching and filtering computations
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const term = searchQuery.trim().toLowerCase();
      const matchSearch = !term || 
        p.name?.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term);
      
      const matchCat = selectedCategory === "ALL" || p.categoryId === selectedCategory;
      const matchBrand = selectedBrand === "ALL" || p.brandId === selectedBrand;
      
      return matchSearch && matchCat && matchBrand;
    });
  }, [products, searchQuery, selectedCategory, selectedBrand]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === "discountValue") {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleProductToggle = (productId: string) => {
    setFormData(prev => {
      const isSelected = prev.productIds.includes(productId);
      if (isSelected) {
        return { ...prev, productIds: prev.productIds.filter(id => id !== productId) };
      } else {
        return { ...prev, productIds: [...prev.productIds, productId] };
      }
    });
  };

  // Multi-link tool logic
  const handleSelectAllFiltered = () => {
    const ids = filteredProducts.map(p => p.id);
    setFormData(prev => {
      const combo = new Set([...prev.productIds, ...ids]);
      return { ...prev, productIds: Array.from(combo) };
    });
  };

  const handleDeselectAllFiltered = () => {
    const idsToRemove = new Set(filteredProducts.map(p => p.id));
    setFormData(prev => ({
      ...prev,
      productIds: prev.productIds.filter(id => !idsToRemove.has(id))
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("elara_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${baseUrl}/offers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        router.push("/admin/offers");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to create offer");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving offer");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-sm text-text-soft">Loading resources...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/offers" className="p-2 border border-line bg-surface hover:bg-line transition-colors">
          <FiArrowLeft />
        </Link>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Create New Offer</h2>
          <p className="text-sm text-text-soft">Configure discount details and apply to products</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* General Information Block */}
          <div className="lg:col-span-5 p-6 border border-line bg-surface space-y-5 h-fit">
            <h3 className="font-semibold text-foreground border-b border-line pb-2 mb-4">General Information</h3>
            
            <div>
              <label className="block text-xs font-semibold text-text-soft mb-1.5 uppercase tracking-wider">Offer Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Summer Sale"
                className="w-full border border-line bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none placeholder:text-text-soft/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-soft mb-1.5 uppercase tracking-wider">Coupon Code (Optional)</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="SUMMER20"
                className="w-full border border-line bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none placeholder:text-text-soft/50 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-soft mb-1.5 uppercase tracking-wider">Discount Type</label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleChange}
                  className="w-full border border-line bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none cursor-pointer"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (৳)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-soft mb-1.5 uppercase tracking-wider">Discount Value</label>
                <input
                  type="number"
                  name="discountValue"
                  required
                  min="0"
                  step="0.01"
                  value={formData.discountValue}
                  onChange={handleChange}
                  className="w-full border border-line bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none font-bold"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFlashSale"
                  checked={formData.isFlashSale}
                  onChange={handleChange}
                  className="w-4 h-4 text-accent accent-accent cursor-pointer"
                />
                <span className="text-sm font-semibold text-foreground">Flag as Flash Sale</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-soft mb-1.5 uppercase tracking-wider">Start Date (Optional)</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full border border-line bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none text-text-soft"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-soft mb-1.5 uppercase tracking-wider">End Date (Optional)</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full border border-line bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none text-text-soft"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-text-soft mb-1.5 uppercase tracking-wider">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-line bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none cursor-pointer"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Select Products Block */}
          <div className="lg:col-span-7 p-6 border border-line bg-surface flex flex-col h-[650px]">
            <div className="flex items-center justify-between border-b border-line pb-3 mb-4 shrink-0">
              <h3 className="font-semibold text-foreground">
                Select Products
              </h3>
              <span className="text-xs font-bold bg-accent/10 border border-accent/20 text-accent px-2.5 py-0.5 rounded">
                {formData.productIds.length} selected
              </span>
            </div>
            
            {/* FILTERS BAR - CLEAN & SIMPLE */}
            <div className="space-y-3 mb-4 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search product name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-line bg-background px-3 py-2 pl-9 text-xs focus:border-accent focus:outline-none"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-soft text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-line bg-background px-2 py-1.5 text-xs focus:border-accent focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="border border-line bg-background px-2 py-1.5 text-xs focus:border-accent focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Brands</option>
                  {brands.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Bulk select controls */}
              <div className="flex items-center justify-between pt-2 border-t border-line/40">
                <span className="text-[10px] text-text-soft font-semibold">
                  {filteredProducts.length} items match criteria
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="text-xs text-accent font-bold hover:underline flex items-center gap-1"
                  >
                    <FiCheckSquare /> Select Filtered
                  </button>
                  <div className="w-[1px] h-3 bg-line" />
                  <button
                    type="button"
                    onClick={handleDeselectAllFiltered}
                    className="text-xs text-red-500 font-bold hover:underline flex items-center gap-1"
                  >
                    <FiSquare /> Deselect Filtered
                  </button>
                </div>
              </div>
            </div>
            
            {/* PRODUCTS LIST: CLEAN SIMPLE ROWS */}
            <div className="flex-1 overflow-y-auto border border-line/50 bg-background p-1 divide-y divide-line/50 scrollbar-thin">
              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-xs text-text-soft">No matching products found.</div>
              ) : (
                filteredProducts.map((p) => {
                  const isChecked = formData.productIds.includes(p.id);
                  return (
                    <label 
                      key={p.id} 
                      className={`flex items-center gap-4 p-3 hover:bg-surface-strong/20 cursor-pointer transition-colors ${
                        isChecked ? "bg-accent/[0.02]" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleProductToggle(p.id)}
                        className="w-4 h-4 text-accent accent-accent cursor-pointer shrink-0"
                      />
                      <div className="flex items-center gap-3 flex-1 overflow-hidden">
                        <div className="w-9 h-9 bg-white border border-line shrink-0 flex items-center justify-center overflow-hidden">
                          <img 
                            src={p.image?.src || p.image || '/placeholder.jpg'} 
                            className="max-w-full max-h-full object-contain" 
                            alt="" 
                          />
                        </div>
                        <div className="truncate flex-1">
                          <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-mono font-bold text-text-soft">{p.sku || "NO-SKU"}</span>
                            <span className="text-[9px] text-text-soft/70 uppercase">|</span>
                            <span className="text-[9px] font-semibold text-text-soft/80 uppercase">{p.category?.name || "Uncategorized"}</span>
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-line">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-foreground px-6 py-2.5 text-sm font-medium text-white hover:bg-foreground/90 transition-colors disabled:opacity-50 shadow-sm"
          >
            <FiSave /> {loading ? "Saving..." : "Save Offer"}
          </button>
        </div>
      </form>
    </div>
  );
}
