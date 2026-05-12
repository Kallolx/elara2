"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiSave } from "react-icons/fi";

export default function EditOfferPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  
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
    // Fetch products and offer data
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("elara_token");
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        
        // Fetch products
        const prodRes = await fetch(`${baseUrl}/products`);
        const prodJson = await prodRes.json();
        if (prodJson.success) {
          setProducts(prodJson.data);
        }

        // Fetch offer
        const offerRes = await fetch(`${baseUrl}/offers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const offerData = await offerRes.json();
        
        if (offerData) {
          setFormData({
            title: offerData.title || "",
            code: offerData.code || "",
            discountType: offerData.discountType || "PERCENTAGE",
            discountValue: offerData.discountValue || 0,
            status: offerData.status || "ACTIVE",
            isFlashSale: offerData.isFlashSale || false,
            startDate: offerData.startDate ? new Date(offerData.startDate).toISOString().split('T')[0] : "",
            endDate: offerData.endDate ? new Date(offerData.endDate).toISOString().split('T')[0] : "",
            productIds: offerData.products ? offerData.products.map((p: any) => p.id) : [],
          });
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setFetching(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("elara_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${baseUrl}/offers/${id}`, {
        method: "PUT",
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
        alert(err.message || "Failed to update offer");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving offer");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-text-soft">Loading offer...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/offers" className="p-2 border border-line bg-surface hover:bg-line transition-colors">
          <FiArrowLeft />
        </Link>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Edit Offer</h2>
          <p className="text-sm text-text-soft">Update discount details and product assignments</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Information */}
          <div className="p-6 border border-line bg-surface space-y-4">
            <h3 className="font-semibold text-foreground border-b border-line pb-2 mb-4">General Information</h3>
            
            <div>
              <label className="block text-xs font-medium text-text-soft mb-1.5 uppercase tracking-wider">Offer Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Summer Sale 2026"
                className="w-full border border-line bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-soft mb-1.5 uppercase tracking-wider">Coupon Code (Optional)</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. SUMMER20 (Leave blank for direct product discount)"
                className="w-full border border-line bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
              />
              <p className="text-[10px] text-text-soft mt-1">If a code is provided, users must enter it at checkout.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-soft mb-1.5 uppercase tracking-wider">Discount Type</label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleChange}
                  className="w-full border border-line bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (৳)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-soft mb-1.5 uppercase tracking-wider">Discount Value</label>
                <input
                  type="number"
                  name="discountValue"
                  required
                  min="0"
                  step="0.01"
                  value={formData.discountValue}
                  onChange={handleChange}
                  className="w-full border border-line bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFlashSale"
                  checked={formData.isFlashSale}
                  onChange={handleChange}
                  className="w-4 h-4 text-accent accent-accent"
                />
                <span className="text-sm font-medium text-foreground">Flag as Flash Sale</span>
              </label>
              <p className="text-[10px] text-text-soft ml-7 mt-0.5">Products will get a special Flash Sale badge.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-soft mb-1.5 uppercase tracking-wider">Start Date (Optional)</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full border border-line bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-soft mb-1.5 uppercase tracking-wider">End Date (Optional)</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full border border-line bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
                />
                <p className="text-[10px] text-text-soft mt-1">Offer disables automatically after this date.</p>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-text-soft mb-1.5 uppercase tracking-wider">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-line bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Applicable Products */}
          <div className="p-6 border border-line bg-surface flex flex-col h-[500px]">
            <h3 className="font-semibold text-foreground border-b border-line pb-2 mb-4 shrink-0">
              Apply to Products ({formData.productIds.length} selected)
            </h3>
            <p className="text-xs text-text-soft mb-3 shrink-0">Select the products this offer applies to.</p>
            
            <div className="flex-1 overflow-y-auto border border-line/50 p-2 space-y-1 scrollbar-thin">
              {products.length === 0 ? (
                <div className="p-4 text-center text-xs text-text-soft">Loading products...</div>
              ) : (
                products.map((p) => (
                  <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-background cursor-pointer rounded border border-transparent hover:border-line transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.productIds.includes(p.id)}
                      onChange={() => handleProductToggle(p.id)}
                      className="w-4 h-4 text-accent accent-accent"
                    />
                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                      <div className="w-8 h-8 bg-background shrink-0 flex items-center justify-center">
                        <img src={p.image?.src || p.image || '/placeholder.jpg'} className="max-w-full max-h-full object-contain" alt="" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                        <p className="text-[10px] text-text-soft truncate">{p.sku}</p>
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-line">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-foreground px-6 py-2.5 text-sm font-medium text-white hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            <FiSave /> {loading ? "Saving..." : "Update Offer"}
          </button>
        </div>
      </form>
    </div>
  );
}
