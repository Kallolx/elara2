"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiPlus, FiLoader, FiPackage, FiTrash2, FiEdit3 } from "react-icons/fi";
import { ButtonLink } from "@/components/ui/button";

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
  category: {
    name: string;
    slug: string;
  };
  sizes: ProductSize[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="space-y-6">
      <article className="border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-foreground">
              Manage products and sizes
            </h2>
          </div>
          <ButtonLink href="/admin/products/new">
            <FiPlus className="text-[14px]" />
            Add product
          </ButtonLink>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <FiLoader className="animate-spin text-3xl text-accent" />
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
        ) : products.length === 0 ? (
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
              {products.map((product) => (
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
                        ID: {product.id}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-text-soft">
                        SKU: {product.sku}
                      </p>
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
                        product.hasOffer ? "text-red-500" : "text-text-soft"
                      }`}>
                        {product.hasOffer ? "Offer active" : "Standard"}
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
                    <th className="px-5 py-4 font-normal">Offer</th>
                    <th className="px-5 py-4 font-normal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-line last:border-b-0"
                    >
                      <td className="px-5 py-4 text-xs font-semibold text-text-soft">
                        {product.id}
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
                        <span className={`text-[11px] font-bold uppercase tracking-[0.1em] ${
                          product.hasOffer ? "text-red-500" : "text-text-soft"
                        }`}>
                          {product.hasOffer ? "Offer" : "Standard"}
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
