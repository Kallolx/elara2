"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiSave, FiLoader, FiUpload, FiX, FiAward } from "react-icons/fi";
import { Button, ButtonLink } from "@/components/ui/button";
import { LogoLoader } from "@/components/ui/logo-loader";

export default function AdminBrandEditPage() {
  const params = useParams();
  const router = useRouter();
  const brandId = params.id as string;

  const [formState, setFormState] = useState({
    name: "",
    slug: "",
    status: "Active",
    description: "",
    website: "",
    logo: "",
  });
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadBrand = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/brands/${brandId}`);
        const json = await res.json();
        if (json.success) {
          const data = json.data;
          setFormState({
            name: data.name || "",
            slug: data.slug || "",
            status: data.status || "Active",
            description: data.description || "",
            website: data.website || "",
            logo: data.logo || "",
          });
        } else {
          setError(json.message || "Failed to fetch brand details");
        }
      } catch (err) {
        setError("Error connecting to backend server.");
      } finally {
        setLoading(false);
      }
    };

    if (brandId) {
      loadBrand();
    }
  }, [brandId]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError("");
      
      const formData = new FormData();
      formData.append("image", file);

      const token = localStorage.getItem("elara_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/uploads/single`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        setFormState((prev) => ({ ...prev, logo: json.data.url }));
      } else {
        setError(json.message || "Failed to upload logo.");
      }
    } catch (err) {
      setError("Failed to connect to the upload server.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.slug) {
      setError("Name and Slug are required fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("elara_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/brands/${brandId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formState),
      });

      const json = await res.json();
      if (json.success) {
        router.push("/admin/brands");
        router.refresh();
      } else {
        setError(json.message || "Failed to update brand.");
      }
    } catch (err) {
      setError("Failed to connect to the backend server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <LogoLoader size="lg" />
        <p className="mt-4 text-sm text-text-soft">Loading brand profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <ButtonLink href="/admin/brands" variant="outline" size="sm">
          <FiArrowLeft className="text-[14px]" />
          Back to brands
        </ButtonLink>
        <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground">Edit Brand</h2>
        <div className="w-[140px]" />
      </header>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm font-medium rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          
          {/* Main Content */}
          <div className="space-y-6">
            <section className="border border-line bg-surface px-5 py-5">
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-foreground mb-5">Brand Details</h3>
              
              <div className="grid gap-4">
                <label className="block text-sm">
                  <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Brand Name</span>
                  <input
                    value={formState.name}
                    required
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
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
                    className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                  />
                </label>

                <label className="block text-sm">
                  <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Description</span>
                  <textarea
                    value={formState.description}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    rows={5}
                    className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent resize-none"
                  />
                </label>

                <label className="block text-sm">
                  <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Website</span>
                  <input
                    type="url"
                    value={formState.website}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        website: event.target.value,
                      }))
                    }
                    className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                  />
                </label>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <section className="border border-line bg-surface p-5">
              <h3 className="text-[11px] uppercase tracking-[0.22em] text-text-soft font-bold mb-4">Brand Logo</h3>
              <div className="aspect-square w-full border border-line bg-background relative flex items-center justify-center overflow-hidden">
                {uploading ? (
                  <div className="flex flex-col items-center gap-2 text-text-soft">
                    <FiLoader className="animate-spin text-xl" />
                    <span className="text-[10px]">Uploading...</span>
                  </div>
                ) : formState.logo ? (
                  <>
                    <img src={formState.logo} alt="Preview" className="h-full w-full object-contain p-4" />
                    <button 
                      type="button" 
                      onClick={() => setFormState(p => ({...p, logo: ""}))}
                      className="absolute top-2 right-2 h-7 w-7 bg-white border border-line shadow-sm flex items-center justify-center text-red-500 hover:text-red-600"
                    >
                      <FiX size={14} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-center p-6 text-text-soft">
                    <FiAward className="text-4xl mb-3 opacity-30" />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      <FiUpload className="mr-1.5" /> Upload
                    </Button>
                  </div>
                )}
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </div>
            </section>

            <section className="border border-line bg-surface p-5">
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
                  className="w-full border border-line bg-background px-3 py-2 text-foreground cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
            </section>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border border-line bg-surface px-5 py-4">
          <ButtonLink href="/admin/brands" variant="outline" size="sm">
            Cancel
          </ButtonLink>
          <Button type="submit" disabled={saving || uploading} className="inline-flex items-center gap-2">
            {saving ? (
              <FiLoader className="animate-spin text-[14px]" />
            ) : (
              <FiSave className="text-[14px]" />
            )}
            {saving ? "Saving Updates..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
