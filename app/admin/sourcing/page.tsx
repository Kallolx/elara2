"use client";

import { span } from "framer-motion/client";
import { useEffect, useState } from "react";
import { CgCopy } from "react-icons/cg";
import {
  FiExternalLink,
  FiDownload,
  FiSearch,
  FiCheck,
  FiLoader,
  FiLayers,
  FiDollarSign,
  FiFilter,
  FiTag,
  FiMaximize2,
} from "react-icons/fi";
import { MdOutlineAddShoppingCart } from "react-icons/md";

interface Category {
  id: string;
  name: string;
}

interface ScrapedProduct {
  sku: string;
  name: string;
  price: number;
  commission: number;
  oldPrice: number | null;
  image: string;
  url: string;
  category: string;
  shortDescription: string;
  description: string;
}

export default function KobaSourcingPage() {
  const [targetUrl, setTargetUrl] = useState(
    "https://www.kobareseller.com/dashboard/products",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [products, setProducts] = useState<ScrapedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [importingMap, setImportingMap] = useState<
    Record<string, "idle" | "loading" | "success">
  >({});
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Category filtering states
  const [selectedKobaCategory, setSelectedKobaCategory] = useState("All");

  // Dynamic retail price controller states (stores [sku]: retailPrice)
  const [retailPrices, setRetailPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${baseUrl}/categories`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
        if (data.data.length > 0) {
          setSelectedCategoryId(data.data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load Elara categories.");
    }
  };

  const scrapeProducts = async (urlToScrape: string) => {
    setLoading(true);
    setProducts([]);
    setSelectedKobaCategory("All");

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("elara_token");

      const res = await fetch(`${baseUrl}/sourcing/scrape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: urlToScrape }),
      });
      const data = await res.json();

      if (data.success) {
        setProducts(data.data);

        // Prefill retail prices with 15% reseller commission markup
        const pricesMap: Record<string, number> = {};
        data.data.forEach((p: ScrapedProduct) => {
          pricesMap[p.sku] = Math.round(p.price * 1.15);
        });
        setRetailPrices(pricesMap);

        triggerToast(
          `Successfully parsed and loaded ${data.data.length} Koba products!`,
        );
      } else {
        alert(data.message || "Failed to scrape Koba International.");
      }
    } catch (err) {
      alert("Failed to connect to Elara WooCommerce Scraper API.");
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    await scrapeProducts(targetUrl);
  };

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1) return;
    setCurrentPage(newPage);
    const newUrl = `https://www.kobareseller.com/dashboard/products?page=${newPage}`;
    setTargetUrl(newUrl);
    await scrapeProducts(newUrl);
  };

  // Helper to extract volumes (e.g. '100 g', '150 ml') from titles dynamically
  const detectSize = (title: string): string => {
    const match = title.match(/\b\d+(?:\s*ml|\s*g|\s*oz|\s*pcs)\b/i);
    return match ? match[0] : "Standard";
  };

  const handleRetailPriceChange = (sku: string, val: number) => {
    setRetailPrices((prev) => ({ ...prev, [sku]: val }));
  };

  const handleImport = async (product: ScrapedProduct) => {
    if (!selectedCategoryId) {
      alert("Please select an Elara category first.");
      return;
    }

    setImportingMap((prev) => ({ ...prev, [product.sku]: "loading" }));

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("elara_token");

      const sellingPrice =
        retailPrices[product.sku] || Math.round(product.price * 1.15);
      const sizeLabel = detectSize(product.name);

      const payload = {
        sku: product.sku,
        name: product.name,
        slug: product.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, ""),
        categoryId: selectedCategoryId,
        price: sellingPrice,
        oldPrice: product.oldPrice ? Math.round(sellingPrice * 1.15) : null,
        image: product.image,
        gallery: [product.image],
        shortDescription: product.shortDescription,
        description: product.description,
        sizes: [
          {
            label: sizeLabel,
            price: sellingPrice,
            oldPrice: product.oldPrice ? Math.round(sellingPrice * 1.15) : null,
          },
        ],
      };

      const res = await fetch(`${baseUrl}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setImportingMap((prev) => ({ ...prev, [product.sku]: "success" }));
        triggerToast(
          `Successfully imported "${product.name}" with size "${sizeLabel}"!`,
        );
      } else {
        alert(data.message || "Product import failed.");
        setImportingMap((prev) => ({ ...prev, [product.sku]: "idle" }));
      }
    } catch (err) {
      alert("Connection to product repository lost.");
      setImportingMap((prev) => ({ ...prev, [product.sku]: "idle" }));
    }
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // Get list of unique Koba categories for filters
  const kobaCategories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean)),
  );

  const filteredProducts =
    selectedKobaCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedKobaCategory);

  // Exact Koba Reseller commission and net profit calculator
  const calculateKobaBreakdown = (
    wholesale: number,
    baseComm: number,
    selling: number,
  ) => {
    const extraProfit = Math.max(0, selling - wholesale);
    const extraShare = Math.round(extraProfit * 0.9);
    const totalProdComm = baseComm + extraShare;
    const codCharge = Math.round(selling * 0.01);
    const packingCharge = 37;
    const invoiceCharge = 1;
    const netProfit = totalProdComm - codCharge - packingCharge - invoiceCharge;

    return {
      baseComm,
      extraShare,
      totalProdComm,
      codCharge,
      packingCharge,
      invoiceCharge,
      netProfit,
    };
  };

  return (
    <div className="space-y-4">
      {/* Dynamic Success Toast */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-5 py-3 shadow-lg rounded-sm animate-in slide-in-from-top-4 duration-300">
          <FiCheck className="text-emerald-600 shrink-0 text-sm" />
          <p className="text-xs uppercase tracking-wider font-semibold text-emerald-800">
            {successToast}
          </p>
        </div>
      )}

      {/* Sourcing Header Block */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Koba Sourcing & Scraper
          </h1>
          <p className="mt-1 text-xs text-text-soft">
            Directly source, scrape, and import premium skincare variants from
            your Koba International partner catalog.
          </p>
        </div>

        {/* Quick External Link to Koba Account Portal */}
        <a
          href="https://www.kobainternational.com/my-account/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 border border-[#c13e2f] bg-[#c13e2f]/5 px-4 py-2.5 text-xs uppercase tracking-widest font-bold text-[#c13e2f] hover:bg-[#c13e2f] hover:text-white transition-colors cursor-pointer outline-none rounded-sm"
        >
          Koba Partner Panel
          <FiExternalLink className="text-[13px]" />
        </a>
      </header>

      {/* Scraper Inputs & DB Category Selector Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {/* Scraper Parameters Form */}
        <form
          onSubmit={handleScrape}
          className="md:col-span-2 border border-stone-200 bg-white p-2 sm:p-4 space-y-4 rounded-sm shadow-sm"
        >
          <div>
            <h2 className="text-sm uppercase tracking-wider font-bold text-foreground">
              Koba URL
            </h2>
          </div>

          <div className="">
            <input
              id="koba-url"
              type="url"
              required
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://www.kobareseller.com/dashboard/products"
              className="block w-full border border-stone-200 px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="border border-accent bg-accent px-5 py-3 text-xs uppercase tracking-widest font-bold text-white hover:bg-accent-deep transition-colors cursor-pointer outline-none flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin text-sm" />
                Parsing Koba Pages...
              </>
            ) : (
              <>
                <FiDownload className="text-sm" />
                Scrape & Load Products
              </>
            )}
          </button>
        </form>

        {/* Database Category Assignment Card */}
        <div className="border border-stone-200 bg-white p-4 sm:p-6 space-y-4 rounded-sm shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h2 className="text-sm uppercase tracking-wider font-bold text-foreground">
                Database Import Settings
              </h2>
            </div>

            <div className="space-y-4">
              <label
                htmlFor="db-category"
                className="text-[10px] uppercase tracking-wider text-text-soft font-bold flex items-center gap-1"
              >
                <FiLayers />
                Elara Category
              </label>
              <select
                id="db-category"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="block w-full border border-stone-200 px-4 py-3 text-xs text-foreground outline-none transition-colors focus:border-accent bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Scraped Preview Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="space-y-1.5">
            <h2 className="text-base uppercase tracking-wider font-bold text-foreground">
              Scraped Products Preview ({filteredProducts.length})
            </h2>
            {products.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-text-soft uppercase tracking-wider">
                  Active Page:
                </span>
                <button
                  type="button"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-40 rounded-sm cursor-pointer border border-stone-200 transition-colors"
                >
                  Prev Page
                </button>
                <span className="text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-2.5 py-0.5 rounded-sm">
                  {currentPage}
                </span>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-40 rounded-sm cursor-pointer border border-stone-200 transition-colors"
                >
                  Next Page
                </button>
              </div>
            )}
          </div>

          {/* Dynamic Koba Category Filters */}
          {products.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedKobaCategory("All")}
                className={[
                  "px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold rounded-sm border transition-colors cursor-pointer outline-none",
                  selectedKobaCategory === "All"
                    ? "border-accent bg-accent text-white"
                    : "border-stone-200 bg-white text-text-soft hover:border-stone-300",
                ].join(" ")}
              >
                All
              </button>
              {kobaCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedKobaCategory(cat)}
                  className={[
                    "px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold rounded-sm border transition-colors cursor-pointer outline-none",
                    selectedKobaCategory === cat
                      ? "border-accent bg-accent text-white"
                      : "border-stone-200 bg-white text-text-soft hover:border-stone-300",
                  ].join(" ")}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="border border-dashed border-stone-200 py-16 text-center text-xs uppercase tracking-wider font-semibold text-text-soft bg-stone-50 flex flex-col items-center justify-center gap-3 rounded-sm">
            <FiLoader className="animate-spin text-lg text-accent" />
            <span className="text-stone-600">
              Scraping products, please wait...
            </span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="border border-dashed border-stone-200 py-16 text-center text-xs uppercase tracking-wider font-semibold text-text-soft bg-stone-50 rounded-sm">
            No products loaded. Specify a URL above and click Scrape to preview
            items.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts
              .filter(
                (p, idx, self) =>
                  self.findIndex((x) => x.sku === p.sku) === idx,
              )
              .map((product, index) => {
                const state = importingMap[product.sku] || "idle";
                const detectedSize = detectSize(product.name);
                const retailPrice =
                  retailPrices[product.sku] || Math.round(product.price * 1.15);

                return (
                  <div
                    key={`${product.sku}-${index}`}
                    className="border border-stone-200/80 bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-all duration-300 flex flex-col gap-5 max-w-lg mx-auto w-full"
                  >
                    {/* Top Section: Flex row with Image on Left and Details on Right */}
                    <div className="flex gap-4">
                      {/* Left: Image Container */}
                      <div className="relative w-32 h-32 bg-[#fffcfc] border border-[#ffebeb] rounded-2xl flex flex-col items-center justify-between p-2 shrink-0">
                        <div className="flex-1 flex items-center justify-center p-1 w-full h-full">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain mix-blend-multiply"
                          />
                        </div>
                        <span className="inline-flex items-center gap-1 bg-white border border-[#ffe6eb] px-2 py-0.5 rounded-full text-[8px] font-bold text-accent shadow-sm uppercase tracking-wide shrink-0">
                          🍃 {product.category || "Skin Care"}
                        </span>
                      </div>

                      {/* Right: Text Information */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-semibold tracking-wide uppercase">
                            <span>SKU: {product.sku}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(product.sku);
                                triggerToast("SKU copied to clipboard!");
                              }}
                              className="hover:text-accent transition-colors cursor-pointer text-xs"
                              title="Copy SKU"
                            >
                              <CgCopy />
                            </button>
                          </div>
                          <h3 className="font-bold text-sm text-[#1e293b] leading-snug line-clamp-3">
                            {product.name}
                          </h3>
                        </div>

                        {/* Volume badge */}
                        <div className="mt-2 inline-flex self-start items-center gap-1 bg-[#f8fafc] border border-stone-100 px-2.5 py-1 rounded-lg text-[10px] font-bold text-stone-600 shadow-sm uppercase tracking-wider shrink-0">
                          🧴 Volume: {detectedSize}
                        </div>
                      </div>
                    </div>

                    {/* Middle Section: Side-by-side Pricing Blocks */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Left Block: Koba Wholesale Price */}
                      <div className="bg-[#f1f3f9]/70 rounded-2xl p-3.5 text-center flex flex-col justify-center gap-1 border border-[#e2e8f0]/40">
                        <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">
                          Reseller Price
                        </span>
                        <span className="text-xl font-bold text-[#1e293b]">
                          ৳ {product.price.toLocaleString()}
                        </span>
                      </div>

                      {/* Right Block: Editable Selling Price */}
                      <div className="bg-[#fff1f4] rounded-2xl p-3.5 text-center flex flex-col justify-center gap-0.5 border border-[#ffe4e6]">
                        <span className="text-[10px] uppercase tracking-wider text-accent font-bold">
                          Selling Price (৳)
                        </span>
                        <input
                          type="number"
                          value={retailPrice}
                          onChange={(e) =>
                            handleRetailPriceChange(
                              product.sku,
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="w-full bg-transparent border-none text-center font-bold text-2xl text-accent focus:outline-none select-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text"
                        />
                      </div>
                    </div>

                    {/* Breakdown Table Section */}
                    {(() => {
                      const bk = calculateKobaBreakdown(
                        product.price,
                        product.commission || Math.round(product.price * 0.2),
                        retailPrice,
                      );
                      return (
                        <div className="border border-stone-100 bg-white p-4 rounded-2xl space-y-3 shadow-sm text-xs">
                          <div className="flex justify-between items-center text-stone-500">
                            <span>Base Commission</span>
                            <span className="h-px flex-1 border-b border-dashed border-stone-200/70 mx-3"></span>
                            <span className="font-semibold text-stone-800">
                              + ৳ {bk.baseComm.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-stone-500">
                            <span>Extra Profit Share (90%)</span>
                            <span className="h-px flex-1 border-b border-dashed border-stone-200/70 mx-3"></span>
                            <span className="font-semibold text-stone-800">
                              + ৳ {bk.extraShare.toLocaleString()}
                            </span>
                          </div>

                          <div className="border-t border-stone-100/80 my-1"></div>

                          <div className="flex justify-between items-center text-stone-600 font-medium">
                            <span>Total Product Comm.</span>
                            <span className="h-px flex-1 border-b border-dashed border-stone-200/70 mx-3"></span>
                            <span className="font-semibold text-stone-800">
                              + ৳ {bk.totalProdComm.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-red-500">
                            <span>COD (1%) & Packing</span>
                            <span className="h-px flex-1 border-b border-dashed border-red-100 mx-3"></span>
                            <span className="font-semibold">
                              - ৳{" "}
                              {(
                                bk.codCharge +
                                bk.packingCharge +
                                bk.invoiceCharge
                              ).toLocaleString()}
                            </span>
                          </div>

                          {/* Highlight Net Reseller Profit Block */}
                          <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-800 font-bold mt-1 shadow-sm">
                            <span className="flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                              Net Reseller Profit
                            </span>
                            <span className="text-sm">
                              + ৳ {bk.netProfit.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Footer Actions Section */}
                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-stone-100/60">
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3 text-[10px] uppercase tracking-widest font-bold text-stone-500 hover:text-stone-800 border border-stone-200 hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5 outline-none"
                      >
                        🔗 Koba Link ↗
                      </a>

                      <button
                        type="button"
                        disabled={state !== "idle"}
                        onClick={() => handleImport(product)}
                        className={[
                          "py-3 text-[10px] uppercase tracking-widest font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer shadow-sm outline-none",
                          state === "success"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 font-bold"
                            : state === "loading"
                              ? "border-stone-200 bg-stone-100 text-stone-500 cursor-not-allowed"
                              : "border-accent bg-accent text-white hover:bg-accent-deep active:scale-[0.98]",
                        ].join(" ")}
                      >
                        {state === "success" ? (
                          <>
                            <span>✓</span>
                            <span>Imported</span>
                          </>
                        ) : state === "loading" ? (
                          "Importing..."
                        ) : (
                          <>
                            <span><MdOutlineAddShoppingCart /></span>
                            <span>Add products</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>
    </div>
  );
}
