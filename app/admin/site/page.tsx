"use client";

import { ChangeEvent, useState } from "react";
import { FiArrowLeft, FiImage, FiSave, FiUpload, FiPlus, FiX } from "react-icons/fi";
import { Button, ButtonLink } from "@/components/ui/button";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/landing/product-card";



export default function AdminSitePage() {
  const { products, settings, updateSettings } = useStore();
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved">("idle");

  const setSetting = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    updateSettings({ [key]: value } as Partial<typeof settings>);
  };

  const handleUploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("images", file);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/uploads/multiple`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("elara_token")}`,
      },
      body: formData,
    });

    const json = await res.json();
    if (json.success && json.data?.[0]?.url) {
      return json.data[0].url;
    }
    throw new Error(json.message || "Failed to upload image.");
  };

  const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const url = await handleUploadFile(file);
      setSetting("logo", url);
    } catch (err) {
      alert("Failed to upload brand logo.");
    } finally {
      event.target.value = "";
    }
  };

  const handleSave = () => {
    setSavingState("saving");
    setTimeout(() => {
      setSavingState("saved");
      setTimeout(() => setSavingState("idle"), 2500);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <ButtonLink href="/admin" variant="outline" size="sm">
          <FiArrowLeft className="text-[14px]" />
          Back to dashboard
        </ButtonLink>
        <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground">Site settings</h2>
        <div className="w-[140px]" />
      </header>

      <div className="grid gap-6">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* Brand logo settings (Upload Only) */}
          <section className="border border-line bg-surface px-5 py-5">
            <h3 className="text-lg font-semibold tracking-[-0.03em] text-foreground">Brand logo</h3>
            <div className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="flex items-center justify-center border border-line bg-background px-4 py-6 min-h-[140px]">
                {settings.logo ? (
                  <span className="relative h-12 w-40 overflow-hidden">
                    <img
                      src={settings.logo}
                      alt={settings.logoAlt}
                      className="object-contain object-center absolute inset-0 h-full w-full"
                    />
                  </span>
                ) : (
                  <div className="flex h-20 w-40 items-center justify-center border border-dashed border-line text-[11px] uppercase tracking-[0.28em] text-text-soft">
                    Logo preview
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="block text-sm">
                  <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Logo alt text</span>
                  <input
                    value={settings.logoAlt}
                    onChange={(event) => setSetting("logoAlt", event.target.value)}
                    className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
                  />
                </label>

                {/* Upload Logo File Only (Styled Upload Box) */}
                <label className="block text-sm">
                  <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Upload Logo Image</span>
                  <div className="flex items-center gap-3 border border-line bg-background hover:bg-background/80 transition-colors px-4 py-3 cursor-pointer">
                    <FiImage className="text-[16px] text-text-soft" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="w-full text-sm text-text-soft file:mr-4 file:border-0 file:bg-transparent file:text-xs file:uppercase file:tracking-[0.22em] file:text-foreground outline-none cursor-pointer"
                    />
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* Dynamic Hero Banners Slideshow */}
          <section className="border border-line bg-surface px-5 py-5">
            <div className="flex items-center justify-between border-b border-line pb-4 mb-5">
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-foreground">
                Hero Banner Slides
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newBanner = {
                    image: "/products/cleanser.png",
                  };
                  setSetting("banners", [...(settings.banners || []), newBanner]);
                }}
              >
                <FiPlus className="text-[14px]" /> Add Banner Slide
              </Button>
            </div>

            <div className="space-y-6">
              {(settings.banners || []).map((banner, index) => (
                <div key={index} className="border border-line bg-background p-5 relative space-y-4">
                  {/* Delete button (Icon-only inside a square close box) */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...settings.banners];
                          const temp = updated[index];
                          updated[index] = updated[index - 1];
                          updated[index - 1] = temp;
                          setSetting("banners", updated);
                        }}
                        className="text-[9px] uppercase tracking-wider font-bold border border-line px-2.5 py-1.5 bg-surface text-stone-500 hover:text-stone-800 cursor-pointer"
                      >
                        ↑ Up
                      </button>
                    )}
                    {index < settings.banners.length - 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...settings.banners];
                          const temp = updated[index];
                          updated[index] = updated[index + 1];
                          updated[index + 1] = temp;
                          setSetting("banners", updated);
                        }}
                        className="text-[9px] uppercase tracking-wider font-bold border border-line px-2.5 py-1.5 bg-surface text-stone-500 hover:text-stone-800 cursor-pointer"
                      >
                        ↓ Down
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = settings.banners.filter((_, idx) => idx !== index);
                        setSetting("banners", updated);
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                      aria-label="Delete slide"
                    >
                      <FiX className="text-[16px]" />
                    </button>
                  </div>

                  <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-accent">
                    Slide #{index + 1}
                  </h4>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="flex items-center justify-center border border-line bg-surface p-4 relative min-h-[140px]">
                      {banner.image ? (
                        <img
                          src={banner.image}
                          alt="Banner image"
                          className="max-h-[120px] object-contain"
                        />
                      ) : (
                        <span className="text-xs uppercase tracking-wider text-stone-400">Preview Image</span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm">
                        <span className="mb-1 block text-[10px] uppercase tracking-wider text-text-soft">Image Source URL</span>
                        <input
                          value={banner.image}
                          onChange={(e) => {
                            const updated = settings.banners.map((b, idx) =>
                              idx === index ? { ...b, image: e.target.value } : b
                            );
                            setSetting("banners", updated);
                          }}
                          className="w-full border border-line bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                        />
                      </label>

                      {/* Styled File Upload Box (Replacing unstyled raw text browser input file) */}
                      <div>
                        <span className="mb-1 block text-[10px] uppercase tracking-wider text-text-soft">Or Upload File</span>
                        <label
                          htmlFor={`banner-upload-${index}`}
                          className="flex flex-col items-center justify-center border border-dashed border-line bg-background hover:bg-surface-strong px-4 py-5 cursor-pointer transition-colors text-center"
                        >
                          <FiUpload className="text-lg text-text-soft mb-1.5" />
                          <span className="text-[10px] uppercase tracking-wider text-text-soft">Choose Image File</span>
                          <input
                            id={`banner-upload-${index}`}
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const url = await handleUploadFile(file);
                                  const updated = settings.banners.map((b, idx) =>
                                    idx === index ? { ...b, image: url } : b
                                  );
                                  setSetting("banners", updated);
                                } catch (err) {
                                  alert("Failed to upload banner image.");
                                }
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>



          {/* Featured Products Showcase Matrix */}
          <section className="border border-line bg-surface px-5 py-5">
            <div className="border-b border-line pb-4 mb-5">
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-foreground">Featured Products Showroom</h3>
              <p className="text-xs text-text-soft mt-1">Select specific items to highlight directly on the landing homepage.</p>
            </div>

            <div className="space-y-6">
              {/* Product Selector Toolbar */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-background p-4 border border-line">
                <div className="flex-grow w-full">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-text-soft mb-2">Select Product to Feature</label>
                  <select 
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const current = settings.featuredProductIds || [];
                      if (!current.includes(val)) {
                        setSetting("featuredProductIds", [...current, val]);
                      }
                      e.target.value = ""; // reset selection
                    }}
                    className="w-full bg-surface border border-line px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="">-- Browse active store catalog --</option>
                    {products
                      .filter(p => !(settings.featuredProductIds || []).includes(p.id || ""))
                      .map(p => (
                        <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Real-Time Live Preview Canvas */}
              <div className="space-y-3">
                <h4 className="text-[11px] uppercase tracking-widest font-bold text-accent flex items-center gap-2">
                  Live Preview Canvas <span className="px-2 py-0.5 bg-accent/10 rounded text-[10px]">{(settings.featuredProductIds || []).length} items selected</span>
                </h4>
                
                {(settings.featuredProductIds || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-line bg-background/50 text-center text-text-soft rounded-lg">
                    <FiPlus className="text-3xl opacity-30 mb-2" />
                    <p className="text-sm font-medium">No specific featured products set.</p>
                    <p className="text-xs mt-1">Default view loads current latest inventory automatically.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
                    {(settings.featuredProductIds || []).map((id: string) => {
                      const prod = products.find(p => p.id === id);
                      if (!prod) return null;
                      
                      // Format minimal required fields that match expected type strictly
                      const sanitizedProd = {
                        ...prod,
                        slug: prod.slug || prod.name.toLowerCase().replace(/ /g, '-'),
                        sizes: (prod.sizes || []).map(s => ({
                          label: s.name,
                          price: s.price,
                          oldPrice: null
                        }))
                      };

                      return (
                        <div key={id} className="relative group ring-1 ring-transparent hover:ring-accent/50 transition-all">
                          {/* Overlay Action: Removability */}
                          <div className="absolute top-4 right-4 z-50 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (settings.featuredProductIds || []).filter(fid => fid !== id);
                                setSetting("featuredProductIds", updated);
                              }}
                              className="h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-xl cursor-pointer"
                              aria-label="Remove from featured"
                            >
                              <FiX />
                            </button>
                          </div>
                          
                          {/* Real storefront card injection */}
                          <div className="pointer-events-none scale-[0.98] origin-top transform opacity-90 hover:opacity-100 transition-opacity">
                             <ProductCard product={sanitizedProd as any} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-end gap-2 border border-line bg-surface px-5 py-4">
            <ButtonLink href="/admin" variant="outline" size="sm">
              Cancel
            </ButtonLink>
            <Button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 cursor-pointer"
            >
              <FiSave className="text-[14px]" />
              {savingState === "saving" ? "Saving..." : savingState === "saved" ? "Saved ✓" : "Save settings"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}