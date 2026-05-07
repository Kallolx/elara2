"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiSave, FiLoader, FiPlus, FiX } from "react-icons/fi";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  categoryIcons,
  categoryStatusOptions,
  type CategoryIconName,
} from "@/components/admin/categories-data";

type CategoryEditPageProps = {
  params: Promise<{ slug: string }>;
};

export default function AdminCategoryEditPage({ params }: CategoryEditPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formState, setFormState] = useState({
    name: "",
    slug: "",
    status: "Active",
    description: "",
    icon: "Droplet" as CategoryIconName,
  });
  const [subcategories, setSubcategories] = useState<string[]>([]);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        setLoading(true);
        const resolvedParams = await Promise.resolve(params);
        const id = resolvedParams.slug; // URL parameter contains the category ID
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/categories/${id}`);
        const json = await res.json();
        
        if (json.success) {
          setFormState({
            name: json.data.name,
            slug: json.data.slug,
            status: json.data.status,
            description: json.data.description || "",
            icon: (json.data.icon as CategoryIconName) || "Droplet",
          });
          setSubcategories(json.data.subcategories || []);
        } else {
          setError(json.message || "Failed to load category.");
        }
      } catch (err) {
        setError("Failed to connect to the backend server.");
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
  }, [params]);

  const SelectedIcon = useMemo(
    () => categoryIcons.find((option) => option.name === formState.icon)?.icon ?? categoryIcons[0].icon,
    [formState.icon],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.slug) {
      setError("Name and Slug are required fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const resolvedParams = await Promise.resolve(params);
      const id = resolvedParams.slug;

      const payload = {
        ...formState,
        subcategories: subcategories.filter(Boolean),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        router.push("/admin/categories");
        router.refresh();
      } else {
        setError(json.message || "Failed to update category.");
      }
    } catch (err) {
      setError("Failed to connect to the backend server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <FiLoader className="animate-spin text-3xl text-accent" />
        <p className="text-sm text-text-soft">Loading category details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <ButtonLink href="/admin/categories" variant="outline" size="sm">
          <FiArrowLeft className="text-[14px]" />
          Back to categories
        </ButtonLink>
        <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground">Edit category</h2>
        <div className="w-[140px]" />
      </header>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm font-medium rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="border border-line bg-surface px-5 py-5">
          <h3 className="text-lg font-semibold tracking-[-0.03em] text-foreground">Category information</h3>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Category name</span>
              <input
                value={formState.name}
                required
                onChange={(event) => {
                  const val = event.target.value;
                  setFormState((current) => ({
                    ...current,
                    name: val,
                    slug: val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
                  }));
                }}
                placeholder="Enter category name"
                className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Slug</span>
              <input
                value={formState.slug}
                required
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""),
                  }))
                }
                placeholder="category-slug"
                className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Status</span>
              <select
                value={formState.status}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    status: event.target.value,
                  }))
                }
                className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
              >
                {categoryStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm lg:col-span-2">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Icon</span>
              <div className="flex items-center gap-3 border border-line bg-background px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-line bg-surface text-foreground">
                  <SelectedIcon className="text-[16px]" />
                </span>
                <select
                  value={formState.icon}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      icon: event.target.value as CategoryIconName,
                    }))
                  }
                  className="min-w-0 flex-1 bg-transparent text-foreground outline-none focus:border-accent"
                >
                  {categoryIcons.map((option) => (
                    <option key={option.name} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className="block text-sm lg:col-span-2">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Description</span>
              <textarea
                value={formState.description}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={4}
                className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
              />
            </label>
          </div>
        </section>

        {/* Subcategories Editor */}
        <section className="border border-line bg-surface px-5 py-5">
          <h3 className="text-lg font-semibold tracking-[-0.03em] text-foreground">
            Subcategories
          </h3>
          <span className="mt-2 block text-xs text-text-soft leading-6">
            Define subcategories for this category (e.g. Foam Cleansers, Oil Cleansers). They will automatically appear as options in the product dropdown.
          </span>
          <div className="mt-5 space-y-3">
            {subcategories.map((value, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="mt-3 text-sm text-text-soft font-bold">
                  {index + 1}.
                </span>
                <input
                  required
                  value={value}
                  onChange={(event) =>
                    setSubcategories((current) =>
                      current.map((item, idx) =>
                        idx === index ? event.target.value : item,
                      ),
                    )
                  }
                  placeholder="Subcategory name"
                  className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSubcategories((current) =>
                      current.filter((_, idx) => idx !== index)
                    )
                  }
                >
                  <FiX className="text-[14px]" />
                </Button>
              </div>
            ))}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSubcategories((current) => [...current, ""])}
              >
                <FiPlus className="text-[14px]" />
                Add subcategory
              </Button>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-end gap-2 border border-line bg-surface px-5 py-4">
          <ButtonLink href="/admin/categories" variant="outline" size="sm">
            Cancel
          </ButtonLink>
          <Button type="submit" disabled={saving} className="inline-flex items-center gap-2">
            {saving ? (
              <FiLoader className="animate-spin text-[14px]" />
            ) : (
              <FiSave className="text-[14px]" />
            )}
            {saving ? "Saving..." : "Save category"}
          </Button>
        </div>
      </form>
    </div>
  );
}
