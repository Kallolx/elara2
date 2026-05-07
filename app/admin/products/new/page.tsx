"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiPlus, FiSave, FiX, FiLoader } from "react-icons/fi";
import { Button, ButtonLink } from "@/components/ui/button";

const sizeUnits = ["ml", "g", "pcs"];

type SizeRow = {
  size: string;
  unit: string;
  price: string;
  oldPrice: string;
};

type ReviewRow = {
  username: string;
  rating: string;
  date: string;
  title: string;
  text: string;
};

interface Category {
  id: string;
  name: string;
  subcategories?: string[];
}

export default function AdminProductCreatePage() {
  const router = useRouter();
  
  // Dynamic Categories from Backend
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Form Field States
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [rating, setRating] = useState("5.0");
  const [reviewCount, setReviewCount] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");

  const selectedCategorySubcategories = useMemo(() => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.subcategories || [];
  }, [categories, categoryId]);

  const [sizeRows, setSizeRows] = useState<SizeRow[]>([
    { size: "", unit: "ml", price: "", oldPrice: "" },
  ]);
  const [howToUseRows, setHowToUseRows] = useState<string[]>([""]);
  const [reviewRows, setReviewRows] = useState<ReviewRow[]>([]);
  
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/categories`);
        const json = await res.json();
        if (json.success) {
          setCategories(json.data);
          if (json.data.length > 0) {
            setCategoryId(json.data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Multi-image local upload using Multer backend
  const handleGalleryChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    try {
      setUploading(true);
      setError("");
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/uploads/multiple`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("elara_token")}`,
        },
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        const urls = json.data.map((f: any) => f.url);
        setGalleryUrls((current) => [...current, ...urls]);
      } else {
        setError(json.message || "Failed to upload images.");
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
    if (!sku || !name || !categoryId) {
      setError("SKU, Name, and Category are required fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const parsedSizes = sizeRows
        .filter((r) => r.size && r.price)
        .map((r) => ({
          label: `${r.size} ${r.unit}`,
          price: Number(r.price),
          oldPrice: r.oldPrice ? Number(r.oldPrice) : undefined,
        }));

      const parsedReviews = reviewRows
        .filter((r) => r.username && r.text)
        .map((r) => ({
          author: r.username,
          rating: Number(r.rating || 5),
          date: r.date ? new Date(r.date) : new Date(),
          title: r.title || undefined,
          text: r.text,
        }));

      const payload = {
        sku,
        name,
        categoryId,
        subcategory: subcategory || undefined,
        hasOffer: parsedSizes.some((s) => s.oldPrice && s.oldPrice > s.price),
        rating: Number(rating),
        reviewCount: Number(reviewCount),
        shortDescription,
        description,
        ingredients: ingredientsText ? ingredientsText.split(",").map((s) => s.trim()).filter(Boolean) : [],
        howToUse: howToUseRows.filter(Boolean),
        image: galleryUrls[0] || undefined, // Primary image is first upload
        gallery: galleryUrls,
        sizes: parsedSizes,
        reviews: parsedReviews,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("elara_token")}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        alert(`Success! Product created successfully with Unique System ID: ${json.data.id}`);
        router.push("/admin/products");
        router.refresh();
      } else {
        setError(json.message || "Failed to create product.");
      }
    } catch (err) {
      setError("Failed to connect to the backend server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <ButtonLink href="/admin/products" variant="ghost" size="sm">
          <FiArrowLeft className="text-[14px]" />
          Back to products
        </ButtonLink>
        <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground">
          Add product
        </h2>
        <div className="w-[140px]" />
      </header>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm font-medium rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Product Information */}
        <section className="border border-line bg-surface px-5 py-5">
          <h3 className="text-lg font-semibold tracking-[-0.03em] text-foreground">
            Product Information
          </h3>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Product name</span>
              <input
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
                }}
                placeholder="e.g. Velvet Cloud Cleanser"
                className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Product code / SKU</span>
              <input
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
                placeholder="e.g. SKU-VC-150"
                className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Slug</span>
              <input
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""))}
                placeholder="e.g. velvet-cloud-cleanser"
                className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Rating (Default: 5.0)</span>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Review count</span>
              <input
                type="number"
                min="0"
                value={reviewCount}
                onChange={(e) => setReviewCount(e.target.value)}
                className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Category</span>
              {categoriesLoading ? (
                <div className="flex h-[50px] items-center px-4 border border-line bg-background text-xs text-text-soft">
                  Loading categories...
                </div>
              ) : (
                <select
                  required
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setSubcategory(""); // Reset subcategory when category changes
                  }}
                  className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Subcategory</span>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
              >
                <option value="">Select Subcategory (Optional)</option>
                {selectedCategorySubcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {/* Descriptions */}
        <section className="border border-line bg-surface px-5 py-5">
          <h3 className="text-lg font-semibold tracking-[-0.03em] text-foreground">
            Descriptions
          </h3>
          <div className="mt-5 grid gap-4">
            <label className="block text-sm">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Short description</span>
              <textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Provide a concise summary of the product (shows on product cards)"
                rows={3}
                className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Full description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed, structured full description"
                rows={5}
                className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
              />
            </label>
          </div>
        </section>

        {/* Ingredients */}
        <section className="border border-line bg-surface px-5 py-5">
          <h3 className="text-lg font-semibold tracking-[-0.03em] text-foreground">
            Ingredients
          </h3>
          <span className="mt-2 block text-xs text-text-soft leading-6">
            Separate ingredients using commas (e.g. Water, Glycerin, Sodium Hyaluronate). They will be saved as a clean list in PostgreSQL.
          </span>
          <textarea
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
            placeholder="Add Ingredients list separated by commas"
            rows={5}
            className="mt-4 w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
          />
        </section>

        {/* How to Use Steps */}
        <section className="border border-line bg-surface px-5 py-5">
          <h3 className="text-lg font-semibold tracking-[-0.03em] text-foreground">
            How to use
          </h3>
          <div className="mt-5 space-y-3">
            {howToUseRows.map((value, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="mt-3 text-sm text-text-soft font-bold">
                  {index + 1}.
                </span>
                <input
                  required
                  value={value}
                  onChange={(event) =>
                    setHowToUseRows((current) =>
                      current.map((item, idx) =>
                        idx === index ? event.target.value : item,
                      ),
                    )
                  }
                  placeholder="Step details (e.g. Massage onto damp face...)"
                  className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setHowToUseRows((current) =>
                      current.length > 1
                        ? current.filter((_, idx) => idx !== index)
                        : current,
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
                onClick={() => setHowToUseRows((current) => [...current, ""])}
              >
                <FiPlus className="text-[14px]" />
                Add step
              </Button>
            </div>
          </div>
        </section>

        {/* Sizes and Pricing */}
        <section className="border border-line bg-surface px-5 py-5">
          <h3 className="text-lg font-semibold tracking-[-0.03em] text-foreground">
            Sizes and pricing
          </h3>
          <div className="mt-5 space-y-4 text-sm">
            {sizeRows.map((row, index) => (
              <div
                key={index}
                className="grid gap-3 border border-line bg-background p-4 lg:grid-cols-[1.5fr_1fr_1.2fr_1.2fr_auto]"
              >
                <label className="block">
                  <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Size Value</span>
                  <input
                    required
                    value={row.size}
                    onChange={(event) =>
                      setSizeRows((current) =>
                        current.map((item, idx) =>
                          idx === index
                            ? { ...item, size: event.target.value }
                            : item,
                        ),
                      )
                    }
                    placeholder="e.g. 15, 30, 150"
                    className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Unit</span>
                  <select
                    value={row.unit}
                    onChange={(event) =>
                      setSizeRows((current) =>
                        current.map((item, idx) =>
                          idx === index
                            ? { ...item, unit: event.target.value }
                            : item,
                        ),
                      )
                    }
                    className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                  >
                    {sizeUnits.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Price (BDT)</span>
                  <input
                    required
                    type="number"
                    min="0"
                    value={row.price}
                    onChange={(event) =>
                      setSizeRows((current) =>
                        current.map((item, idx) =>
                          idx === index
                            ? { ...item, price: event.target.value }
                            : item,
                        ),
                      )
                    }
                    placeholder="750"
                    className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Old price (BDT)</span>
                  <input
                    type="number"
                    min="0"
                    value={row.oldPrice}
                    onChange={(event) =>
                      setSizeRows((current) =>
                        current.map((item, idx) =>
                          idx === index
                            ? { ...item, oldPrice: event.target.value }
                            : item,
                        ),
                      )
                    }
                    placeholder="850 (Optional)"
                    className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                  />
                </label>
                <div className="flex items-end pb-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSizeRows((current) =>
                        current.length > 1
                          ? current.filter((_, idx) => idx !== index)
                          : current,
                      )
                    }
                  >
                    <FiX className="text-[14px]" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setSizeRows((current) => [
                    ...current,
                    { size: "", unit: "ml", price: "", oldPrice: "" },
                  ])
                }
              >
                <FiPlus className="text-[14px]" />
                Add size variant
              </Button>
            </div>
          </div>
        </section>

        {/* Local Image Upload Gallery */}
        <section className="border border-line bg-surface px-5 py-5">
          <h3 className="text-lg font-semibold tracking-[-0.03em] text-foreground">
            Images
          </h3>
          <div className="mt-5 grid gap-4">
            <div className="text-sm">
              <span className="mb-2 block text-sm font-semibold text-foreground">
                Gallery images (Local Uploads folder)
              </span>
              <div className="flex flex-col gap-4 border border-line bg-background px-4 py-4">
                <div className="min-h-[96px]">
                  {uploading ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-2">
                      <FiLoader className="animate-spin text-xl text-accent" />
                      <p className="text-xs text-text-soft">Uploading images to backend...</p>
                    </div>
                  ) : galleryUrls.length > 0 ? (
                    <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,120px)]">
                      {galleryUrls.map((url, index) => (
                        <div
                          key={`${url}-${index}`}
                          className="relative h-32 w-28 bg-surface border border-line p-1.5"
                        >
                          <div className="absolute left-1.5 top-1.5 flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.18em] text-accent">
                            {index === 0 ? "Primary" : `#${index + 1}`}
                          </div>
                          <div className="relative h-20 w-full overflow-hidden mt-4">
                            <img
                              src={url}
                              alt={`Gallery preview ${index + 1}`}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setGalleryUrls((current) =>
                                current.filter((_, idx) => idx !== index),
                              )
                            }
                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center border border-line bg-background text-red-500 hover:bg-red-50"
                          >
                            <FiX className="text-[10px]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-24 items-center justify-center text-sm text-text-soft">
                      No images uploaded yet. Primary image will automatically be set to the first uploaded file.
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center gap-4 flex-wrap border-t border-line pt-4 mt-2">
                  <div className="flex items-center gap-2 grow max-w-md">
                    <input
                      type="text"
                      placeholder="Paste Image URL directly (e.g. Koba image URL)"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="w-full border border-line bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (imageUrlInput.trim()) {
                          setGalleryUrls((current) => [...current, imageUrlInput.trim()]);
                          setImageUrlInput("");
                        }
                      }}
                    >
                      Add URL
                    </Button>
                  </div>
                  <div className="flex justify-end gap-2">
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      onClick={() => galleryInputRef.current?.click()}
                    >
                      <FiPlus className="text-[14px]" />
                      Upload files
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className="border border-line bg-surface px-5 py-5">
          <h3 className="text-lg font-semibold tracking-[-0.03em] text-foreground">
            Customer Reviews (Optional)
          </h3>
          <div className="mt-5 space-y-4">
            {reviewRows.map((review, index) => (
              <div
                key={index}
                className="grid gap-3 border border-line bg-background px-4 py-4 lg:grid-cols-2"
              >
                <label className="block text-sm">
                  <span className="mb-1 block text-xs text-text-soft">Username</span>
                  <input
                    required
                    value={review.username}
                    placeholder="e.g. Nusrat J."
                    onChange={(event) =>
                      setReviewRows((current) =>
                        current.map((item, idx) =>
                          idx === index
                            ? { ...item, username: event.target.value }
                            : item,
                        ),
                      )
                    }
                    className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-xs text-text-soft">Rating (1 - 5)</span>
                  <input
                    required
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={review.rating}
                    placeholder="5.0"
                    onChange={(event) =>
                      setReviewRows((current) =>
                        current.map((item, idx) =>
                          idx === index
                            ? { ...item, rating: event.target.value }
                            : item,
                        ),
                      )
                    }
                    className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-xs text-text-soft">Date</span>
                  <input
                    type="date"
                    value={review.date}
                    onChange={(event) =>
                      setReviewRows((current) =>
                        current.map((item, idx) =>
                          idx === index
                            ? { ...item, date: event.target.value }
                            : item,
                        ),
                      )
                    }
                    className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-xs text-text-soft">Review Title</span>
                  <input
                    value={review.title}
                    placeholder="e.g. Excellent Cleanser!"
                    onChange={(event) =>
                      setReviewRows((current) =>
                        current.map((item, idx) =>
                          idx === index
                            ? { ...item, title: event.target.value }
                            : item,
                        ),
                      )
                    }
                    className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                  />
                </label>
                <label className="block text-sm lg:col-span-2">
                  <span className="mb-1 block text-xs text-text-soft">Review text</span>
                  <textarea
                    required
                    value={review.text}
                    placeholder="Write details of the review..."
                    onChange={(event) =>
                      setReviewRows((current) =>
                        current.map((item, idx) =>
                          idx === index
                            ? { ...item, text: event.target.value }
                            : item,
                        ),
                      )
                    }
                    rows={3}
                    className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                  />
                </label>
                <div className="flex justify-end lg:col-span-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setReviewRows((current) =>
                        current.length > 0
                          ? current.filter((_, idx) => idx !== index)
                          : current,
                      )
                    }
                  >
                    <FiX className="text-[14px]" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setReviewRows((current) => [
                    ...current,
                    { username: "", rating: "5.0", date: "", title: "", text: "" },
                  ])
                }
              >
                <FiPlus className="text-[14px]" />
                Add review
              </Button>
            </div>
          </div>
        </section>

        {/* Submission Panel */}
        <div className="flex flex-wrap items-center justify-end gap-2 border border-line bg-surface px-5 py-4">
          <ButtonLink href="/admin/products" variant="outline" size="sm">
            Cancel
          </ButtonLink>
          <Button type="submit" disabled={saving || uploading} size="sm" className="inline-flex items-center gap-2">
            {saving ? (
              <FiLoader className="animate-spin text-[14px]" />
            ) : (
              <FiSave className="text-[14px]" />
            )}
            {saving ? "Saving..." : "Save product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
