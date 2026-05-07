"use client";

import Image from "next/image";
import { ChangeEvent, useMemo } from "react";
import { FiArrowLeft, FiClock, FiImage, FiSave, FiUpload } from "react-icons/fi";
import { Button, ButtonLink } from "@/components/ui/button";
import { useStore } from "@/context/StoreContext";

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export default function AdminSitePage() {
  const { products, settings, updateSettings } = useStore();

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === settings.promoProductId) ?? products[0],
    [products, settings.promoProductId],
  );

  const setSetting = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    updateSettings({ [key]: value } as Partial<typeof settings>);
  };

  const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    setSetting("logo", dataUrl);
    event.target.value = "";
  };

  const handleHeroMediaUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    setSetting("heroMedia", dataUrl);
    event.target.value = "";
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
        <form className="space-y-6">
          <section className="border border-line bg-surface px-5 py-5">
            <h3 className="text-lg font-semibold tracking-[-0.03em] text-foreground">Brand logo</h3>
            <div className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="flex items-center justify-center border border-line bg-background px-4 py-6">
                {settings.logo ? (
                  <span className="relative h-12 w-40 overflow-hidden">
                    <Image
                      src={settings.logo}
                      alt={settings.logoAlt}
                      fill
                      className="object-contain object-center"
                      unoptimized
                      sizes="160px"
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
                    className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Upload logo</span>
                  <div className="flex items-center gap-3 border border-line bg-background px-4 py-3">
                    <FiImage className="text-[16px] text-text-soft" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="w-full text-sm text-text-soft file:mr-4 file:border-0 file:bg-transparent file:text-xs file:uppercase file:tracking-[0.22em] file:text-foreground"
                    />
                  </div>
                </label>
              </div>
            </div>
          </section>

          <section className="border border-line bg-surface px-5 py-5">
            <h3 className="text-lg font-semibold tracking-[-0.03em] text-foreground">Hero content</h3>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <label className="block text-sm lg:col-span-2">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Hero media URL</span>
                <input
                  value={settings.heroMedia}
                  onChange={(event) => setSetting("heroMedia", event.target.value)}
                  className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none"
                />
              </label>

              <label className="block text-sm lg:col-span-2">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Upload hero media</span>
                <div className="flex items-center gap-3 border border-line bg-background px-4 py-3">
                  <FiUpload className="text-[16px] text-text-soft" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroMediaUpload}
                    className="w-full text-sm text-text-soft file:mr-4 file:border-0 file:bg-transparent file:text-xs file:uppercase file:tracking-[0.22em] file:text-foreground"
                  />
                </div>
              </label>

              {[
                ["heroEyebrow", "Hero eyebrow"],
                ["heroTitle", "Hero title"],
                ["heroPrimaryCtaLabel", "Primary CTA label"],
                ["heroPrimaryCtaHref", "Primary CTA link"],
              ].map(([key, label]) => (
                <label key={key} className="block text-sm">
                  <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">{label}</span>
                  <input
                    value={settings[key as keyof typeof settings] as string}
                    onChange={(event) => setSetting(key as keyof typeof settings, event.target.value as never)}
                    className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="border border-line bg-surface px-5 py-5">
            <h3 className="text-lg font-semibold tracking-[-0.03em] text-foreground">Featured offer</h3>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <label className="block text-sm lg:col-span-2">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Choose product</span>
                <select
                  value={settings.promoProductId}
                  onChange={(event) => setSetting("promoProductId", event.target.value)}
                  className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none"
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.sku}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Offer badge</span>
                <input
                  value={settings.promoBadge}
                  onChange={(event) => setSetting("promoBadge", event.target.value)}
                  className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Offer title</span>
                <input
                  value={settings.promoTitle}
                  onChange={(event) => setSetting("promoTitle", event.target.value)}
                  className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none"
                />
              </label>

              <label className="block text-sm lg:col-span-2">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Offer description</span>
                <textarea
                  value={settings.promoDescription}
                  onChange={(event) => setSetting("promoDescription", event.target.value)}
                  rows={4}
                  className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none"
                />
              </label>

              <label className="block text-sm lg:col-span-2">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-text-soft">Offer end time</span>
                <div className="flex items-center gap-3 border border-line bg-background px-4 py-3">
                  <FiClock className="text-[16px] text-text-soft" />
                  <input
                    type="datetime-local"
                    value={settings.promoEndsAt}
                    onChange={(event) => setSetting("promoEndsAt", event.target.value)}
                    className="w-full bg-transparent text-foreground outline-none"
                  />
                </div>
              </label>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-end gap-2 border border-line bg-surface px-5 py-4">
            <ButtonLink href="/admin" variant="outline" size="sm">
              Cancel
            </ButtonLink>
            <Button type="button" className="inline-flex items-center gap-2">
              <FiSave className="text-[14px]" />
              Save settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}