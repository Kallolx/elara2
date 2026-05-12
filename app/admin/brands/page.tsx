"use client";

import { useEffect, useState } from "react";
import { FiEdit3, FiAward, FiPlus, FiTrash2 } from "react-icons/fi";
import { LogoLoader } from "@/components/ui/logo-loader";
import { ButtonLink } from "@/components/ui/button";
import Link from "next/link";

interface Brand {
  id: string;
  name: string;
  slug: string;
  status: string;
  logo: string | null;
  description: string | null;
  productsCount: number;
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/brands`);
      const json = await res.json();
      if (json.success) {
        setBrands(json.data);
      } else {
        setError(json.message || "Failed to load brands");
      }
    } catch (err) {
      setError("Failed to connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand? Associated products will no longer have a brand attached.")) {
      return;
    }
    try {
      const token = localStorage.getItem("elara_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/brands/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setBrands((prev) => prev.filter((b) => b.id !== id));
      } else {
        alert(json.message || "Failed to delete brand");
      }
    } catch (err) {
      alert("Error connecting to the backend server.");
    }
  };

  return (
    <div className="space-y-6">
      <article className="border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-foreground">
              Manage Brands
            </h2>
          </div>
          <ButtonLink href="/admin/brands/new">
            <FiPlus className="text-[14px]" />
            New brand
          </ButtonLink>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <LogoLoader size="lg" />
            <p className="text-sm text-text-soft">Loading brands from database...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center space-y-4">
            <p className="text-red-500 font-medium">{error}</p>
            <button
              onClick={fetchBrands}
              className="px-4 py-2 text-xs uppercase tracking-[0.22em] border border-line bg-background text-foreground hover:bg-surface-strong"
            >
              Retry Connection
            </button>
          </div>
        ) : brands.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center border border-line bg-background text-text-soft mb-4">
              <FiAward className="text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-foreground tracking-[-0.02em]">No Brands Found</h3>
            <p className="mt-2 text-sm text-text-soft max-w-sm leading-6">
              Establish brand partnerships or display unique labels by creating your first brand entry.
            </p>
            <div className="mt-6">
              <ButtonLink href="/admin/brands/new">
                <FiPlus className="text-[14px]" />
                Create your first brand
              </ButtonLink>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-line text-[11px] uppercase tracking-[0.26em] text-text-soft">
                  <tr>
                    <th className="px-5 py-4 font-normal">Brand Name</th>
                    <th className="px-5 py-4 font-normal">Logo</th>
                    <th className="px-5 py-4 font-normal">Slug</th>
                    <th className="px-5 py-4 font-normal">Products</th>
                    <th className="px-5 py-4 font-normal">Status</th>
                    <th className="px-5 py-4 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand) => (
                    <tr
                      key={brand.id}
                      className="border-b border-line last:border-b-0 hover:bg-background/50 transition-colors"
                    >
                      <td className="px-5 py-4 font-medium text-foreground">
                        {brand.name}
                      </td>
                      <td className="px-5 py-4 text-text-soft">
                        <div className="inline-flex h-12 w-12 items-center justify-center border border-line bg-background overflow-hidden">
                          {brand.logo ? (
                            <img 
                              src={brand.logo} 
                              alt={brand.name} 
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <FiAward className="text-text-soft opacity-30 text-xl" />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[12px] text-text-soft">
                        {brand.slug}
                      </td>
                      <td className="px-5 py-4 text-text-soft">
                        {brand.productsCount}
                      </td>
                      <td className="px-5 py-4 text-text-soft">
                        <span className={`inline-block px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                          brand.status === "Active" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}>
                          {brand.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2 text-text-soft">
                          <ButtonLink
                            href={`/admin/brands/${brand.id}`}
                            variant="outline"
                            size="sm"
                          >
                            <FiEdit3 className="text-[14px]" />
                            Edit
                          </ButtonLink>
                          <button
                            type="button"
                            onClick={() => handleDelete(brand.id)}
                            className="border border-line bg-background p-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
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
