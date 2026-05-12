"use client";

import { useEffect, useState } from "react";
import { FiEdit3, FiGrid, FiPlus, FiTrash2 } from "react-icons/fi";
import { LogoLoader } from "@/components/ui/logo-loader";
import { ButtonLink } from "@/components/ui/button";
import { getCategoryIconPath } from "@/components/admin/categories-data";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  status: string;
  icon: string;
  description: string;
  products: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/categories`);
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      } else {
        setError(json.message || "Failed to load categories");
      }
    } catch (err) {
      setError("Failed to connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? All associated products will be deleted too.")) {
      return;
    }
    try {
      const token = localStorage.getItem("elara_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
      } else {
        alert(json.message || "Failed to delete category");
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
              Organize Categories
            </h2>
          </div>
          <ButtonLink href="/admin/categories/new">
            <FiPlus className="text-[14px]" />
            New category
          </ButtonLink>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <LogoLoader size="lg" />
            <p className="text-sm text-text-soft">Loading categories from database...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center space-y-4">
            <p className="text-red-500 font-medium">{error}</p>
            <button
              onClick={fetchCategories}
              className="px-4 py-2 text-xs uppercase tracking-[0.22em] border border-line bg-background text-foreground hover:bg-surface-strong"
            >
              Retry Connection
            </button>
          </div>
        ) : categories.length === 0 ? (
          /* High Fidelity Empty State */
          <div className="flex flex-col items-center justify-center p-12 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center border border-line bg-background text-text-soft mb-4">
              <FiGrid className="text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-foreground tracking-[-0.02em]">No Categories Found</h3>
            <p className="mt-2 text-sm text-text-soft max-w-sm leading-6">
              Organize your skincare products by creating your first category (e.g. Cleansers, Serums, Moisturizers).
            </p>
            <div className="mt-6">
              <ButtonLink href="/admin/categories/new">
                <FiPlus className="text-[14px]" />
                Create your first category
              </ButtonLink>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="space-y-3 p-5 md:hidden">
              {categories.map((category) => {


                return (
                  <article
                    key={category.id}
                    className="border border-line bg-background px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-line bg-surface p-1 rounded-sm">
                          <img 
                            src={getCategoryIconPath(category.icon)} 
                            alt="" 
                            className="h-full w-full object-contain"
                          />
                        </span>
                        <div>
                          <p className="text-base font-medium text-foreground">
                            {category.name}
                          </p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-text-soft">
                            ID: {category.id.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-foreground">
                        {category.products} products
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm text-text-soft">
                      <span>Status</span>
                      <span className="text-foreground">{category.status}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <ButtonLink
                        href={`/admin/categories/${category.id}/edit`}
                        variant="outline"
                        size="sm"
                      >
                        <FiEdit3 className="text-[14px]" />
                        Edit
                      </ButtonLink>
                      <button
                        type="button"
                        onClick={() => handleDelete(category.id)}
                        className="border border-line bg-surface px-3 py-2 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <FiTrash2 className="text-[14px]" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Desktop View */}
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-line text-[11px] uppercase tracking-[0.26em] text-text-soft">
                  <tr>
                    <th className="px-5 py-4 font-normal">Name</th>
                    <th className="px-5 py-4 font-normal">Icon</th>
                    <th className="px-5 py-4 font-normal">ID</th>
                    <th className="px-5 py-4 font-normal">Products</th>
                    <th className="px-5 py-4 font-normal">Status</th>
                    <th className="px-5 py-4 font-normal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => {


                    return (
                      <tr
                        key={category.id}
                        className="border-b border-line last:border-b-0"
                      >
                        <td className="px-5 py-4 font-medium text-foreground">
                          {category.name}
                        </td>
                        <td className="px-5 py-4 text-text-soft">
                          <span className="inline-flex h-10 w-10 items-center justify-center border border-line bg-background p-1 rounded-sm shadow-sm">
                            <img 
                              src={getCategoryIconPath(category.icon)} 
                              alt="" 
                              className="h-full w-full object-contain"
                            />
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[12px] text-text-soft">
                          {category.id}
                        </td>
                        <td className="px-5 py-4 text-text-soft">
                          {category.products}
                        </td>
                        <td className="px-5 py-4 text-text-soft">
                          <span className={`inline-block px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                            category.status === "Active" 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}>
                            {category.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-text-soft">
                            <ButtonLink
                              href={`/admin/categories/${category.id}/edit`}
                              variant="outline"
                              size="sm"
                            >
                              <FiEdit3 className="text-[14px]" />
                              Edit
                            </ButtonLink>
                            <button
                              type="button"
                              onClick={() => handleDelete(category.id)}
                              className="border border-line bg-background p-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <FiTrash2 className="text-[14px]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </article>
    </div>
  );
}
