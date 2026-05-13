"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiSearch,
  FiShoppingBag,
  FiUser,
  FiSliders,
  FiShoppingBag as FiBag,
  FiLogOut,
  FiX,
  FiChevronDown,
  FiMenu,
  FiHeart,
} from "react-icons/fi";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getCategoryIconPath } from "@/components/admin/categories-data";
import { motion } from "framer-motion";
import { ButtonLink } from "../ui/button";

interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

interface SearchResults {
  products: any[];
  brands: any[];
  categories: any[];
}

export function SiteHeader() {
  const { settings } = useStore();
  const { user, logout } = useAuth();
  const { cartCount, setIsCartOpen, addToCart } = useCart();
  const router = useRouter();

  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/categories`,
        );
        const json = await res.json();
        if (json.success) {
          setCategories(json.data.filter((c: any) => c.status === "Active"));
        }
      } catch (err) {
        console.error("Failed loading header categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!user) {
      setActiveOrdersCount(0);
      return;
    }
    const fetchActiveOrders = async () => {
      try {
        const token = localStorage.getItem("elara_token");
        if (!token) return;
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${baseUrl}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const count = json.data.filter(
            (o: any) => o.status === "Pending" || o.status === "Processing",
          ).length;
          setActiveOrdersCount(count);
        }
      } catch (err) {
        console.error("Failed to fetch active orders count:", err);
      }
    };
    fetchActiveOrders();
    const interval = setInterval(fetchActiveOrders, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Global Search logic
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null,
  );
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Real-time debounced search engine fetch
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults(null);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchLoading(true);
      setShowDropdown(true);
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(
          `${baseUrl}/search?q=${encodeURIComponent(trimmed)}`,
        );
        const json = await res.json();
        if (json.success) {
          setSearchResults(json.data);
        }
      } catch (err) {
        console.error("Live search failure:", err);
      } finally {
        setIsSearchLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-background border-b-1 border-line sticky top-0 z-50 flex flex-col">
      {/* SINGLE NAVIGATION ROW */}
      <motion.div 
        className="mx-auto relative flex h-16 sm:h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* 1. Brand Logo (Pinned Left) */}
        <Link
          href="/"
          className="flex items-center gap-3 shrink-0 relative z-10"
        >
          <span className="relative h-9 w-28 overflow-hidden">
            <Image
              src={settings.logo || "/logo.svg"}
              alt={settings.logoAlt || "Elara"}
              fill
              className="object-contain object-left"
              unoptimized
              sizes="112px"
            />
          </span>
        </Link>

        {/* 2. DEAD ABSOLUTE CENTER: Shop and Large Search Bar ONLY */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center gap-6 z-0">
          {/* Clean Navigation: Just Shop */}
          <nav className="flex items-center shrink-0">
            <Link
              href="/shop"
              className="flex items-center gap-2 text-[15px] font-medium text-foreground hover:text-accent transition-colors whitespace-nowrap"
            >
              <img src="/nav/shop.svg" alt="" className="w-[18px] h-[18px]" />
              Shop
            </Link>
          </nav>

          {/* Static Expanded Search Bar */}
          <div className="w-[360px] relative" ref={searchRef}>
            <form
              onSubmit={handleSearchSubmit}
              className="w-full relative flex items-center"
            >
              <div className="absolute left-4 text-text-soft/60 flex items-center pointer-events-none">
                <FiSearch className="text-[16px]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) setShowDropdown(true);
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, concerns..."
                className="w-full h-[38px] bg-background/50 border border-line hover:border-text-soft/40 focus:border-accent outline-none pl-10 pr-4 text-[13px] text-foreground placeholder-text-soft/50 transition-colors ease-out rounded-full"
              />
            </form>

            {/* DYNAMIC DROPDOWN RESULTS */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-line rounded-lg shadow-2xl z-[100] max-h-[480px] overflow-y-auto divide-y divide-line/50 w-[420px] -ml-[30px] backdrop-blur-xl">
                {isSearchLoading && (
                  <div className="p-6 flex justify-center items-center">
                    <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {!isSearchLoading && searchResults && (
                  <>
                    {/* Products Section */}
                    {searchResults.products.length > 0 ? (
                      <div className="p-3">
                        <h4 className="text-[10px] uppercase tracking-[0.15em] font-bold text-text-soft px-2 mb-2">
                          Products
                        </h4>
                        <div className="space-y-1">
                          {searchResults.products.map((prod) => (
                            <div
                              key={prod.id}
                              className="flex items-center gap-3 p-2.5 hover:bg-surface-strong rounded-md transition-colors group relative"
                            >
                              <Link
                                href={`/shop?search=${encodeURIComponent(prod.sku)}`}
                                onClick={() => setShowDropdown(false)}
                                className="absolute inset-0 z-0"
                              />
                              <div className="w-16 h-16 border border-line rounded-md bg-surface flex-shrink-0 overflow-hidden relative z-10">
                                <img
                                  src={prod.image || "/placeholder.svg"}
                                  className="w-full h-full object-cover"
                                  alt={prod.name}
                                />
                              </div>
                              <div className="flex-1 min-w-0 relative z-10">
                                <p className="text-[14px] font-medium text-foreground leading-tight truncate group-hover:text-accent">
                                  {prod.name}
                                </p>
                                <div className="mt-1 flex items-center flex-wrap gap-2">
                                  {prod.sizes?.[0]?.price && (
                                    <span className="font-bold text-accent text-[15px]">
                                      ৳{prod.sizes[0].price}
                                    </span>
                                  )}
                                  {prod.sizes?.[0]?.oldPrice && (
                                    <span className="text-text-soft/70 text-[12px] line-through font-medium">
                                      ৳{prod.sizes[0].oldPrice}
                                    </span>
                                  )}
                                  {prod.offers?.[0] && (
                                    <span className="px-1.5 py-0.5 bg-accent/10 text-accent font-bold text-[9px] uppercase tracking-wider rounded">
                                      {prod.offers[0].title}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Instant Buy Icon Button */}
                              {prod.sizes?.[0] && !prod.isOutOfStock && (
                                <button
                                  type="button"
                                  title="Add to Cart"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    addToCart(
                                      {
                                        id: prod.id,
                                        sku: prod.sku,
                                        name: prod.name,
                                        image: prod.image,
                                      },
                                      {
                                        name: prod.sizes[0].label || "Standard",
                                        price: prod.sizes[0].price,
                                        oldPrice: prod.sizes[0].oldPrice,
                                      },
                                    );
                                    setShowDropdown(false);
                                  }}
                                  className="relative z-20 h-9 w-9 flex items-center justify-center bg-accent text-white hover:bg-accent-deep shadow-sm rounded-full transition-all duration-200 active:scale-95 shrink-0"
                                >
                                  <FiShoppingBag className="text-[16px]" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* Categories Section */}
                    {searchResults.categories.length > 0 ? (
                      <div className="p-3 bg-surface/30">
                        <h4 className="text-[10px] uppercase tracking-[0.15em] font-bold text-text-soft px-2 mb-2">
                          Categories
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {searchResults.categories.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/shop?category=${cat.id}`}
                              onClick={() => setShowDropdown(false)}
                              className="flex items-center gap-3 p-2.5 hover:bg-white bg-white/60"
                            >
                              <div className="w-12 h-12 bg-white p-1.5 border border-line/50 rounded-md flex-shrink-0 shadow-sm flex items-center justify-center">
                                <img
                                  src={getCategoryIconPath(cat.icon)}
                                  className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                                  alt=""
                                />
                              </div>
                              <span className="text-[14px] font-semibold text-foreground group-hover:text-accent truncate">
                                {cat.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* Brands Section */}
                    {searchResults.brands.length > 0 ? (
                      <div className="p-3">
                        <h4 className="text-[10px] uppercase tracking-[0.15em] font-bold text-text-soft px-2 mb-2">
                          Brands
                        </h4>
                        <div className="flex flex-wrap gap-2 px-2">
                          {searchResults.brands.map((brand) => (
                            <Link
                              key={brand.id}
                              href={`/shop?brand=${brand.id}`}
                              onClick={() => setShowDropdown(false)}
                              className="flex items-center gap-2.5 px-4 py-2 border border-line bg-white shadow-sm rounded-full hover:border-accent hover:shadow-md text-[13px] font-semibold text-foreground transition-all group"
                            >
                              {brand.logo ? (
                                <div className="w-7 h-7 overflow-hidden flex-shrink-0">
                                  <img
                                    src={brand.logo}
                                    alt=""
                                    className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all"
                                  />
                                </div>
                              ) : (
                                <div className="w-7 h-7 bg-surface rounded-full flex items-center justify-center text-[10px] font-bold border border-line">
                                  {brand.name.charAt(0)}
                                </div>
                              )}
                              {brand.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {searchResults.products.length === 0 &&
                      searchResults.categories.length === 0 &&
                      searchResults.brands.length === 0 && (
                        <div className="p-6 text-center text-xs text-text-soft">
                          No matches found for "{searchQuery}".
                        </div>
                      )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 3. Header Utility Icons (Right Aligned) */}
        <div className="flex items-center gap-3 relative z-10">
          {/* Restored Wishlist Shortcut */}
          <Link
            href="/profile/wishlist"
            className="hidden lg:flex h-10 w-10 items-center justify-center rounded-full border border-line bg-background text-text-soft transition-colors hover:border-text-soft hover:text-foreground outline-none cursor-pointer"
            aria-label="Wishlist"
          >
            <FiHeart className="text-[16px]" />
          </Link>

          {/* Shopping Cart */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-line bg-background text-text-soft transition-colors hover:border-text-soft hover:text-foreground outline-none cursor-pointer"
            aria-label="Cart"
          >
            <FiShoppingBag className="text-[15px] sm:text-[16px]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Account Dropdown */}
          <div className="hidden lg:block">
            {user ? (
              <div className="relative group">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2eadf] border border-line text-xs font-bold text-[#5e4b38] uppercase hover:border-text-soft transition-colors outline-none cursor-pointer"
                >
                  {user.name.charAt(0)}
                </button>
                {activeOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white animate-pulse">
                    {activeOrdersCount}
                  </span>
                )}

                <div className="absolute right-0 top-full z-50 mt-2.5 w-44 origin-top-right border border-line bg-surface p-1 shadow-md scale-0 group-hover:scale-100 transition-all duration-150 origin-top divide-y divide-line/40 rounded-md">
                  <div className="space-y-0.5">
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin/products"
                        className="flex items-center gap-2 px-3 py-2.5 text-[10px] uppercase tracking-wider font-semibold text-amber-700 hover:bg-amber-50/30 transition-colors rounded-sm"
                      >
                        <FiSliders className="text-[12px]" />
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      href="/orders"
                      className="flex items-center justify-between px-3 py-2.5 text-[10px] uppercase tracking-wider font-semibold text-text-soft hover:bg-background/20 hover:text-foreground transition-colors rounded-sm"
                    >
                      <span className="flex items-center gap-2">
                        <FiBag className="text-[12px]" />
                        My Orders
                      </span>
                      {activeOrdersCount > 0 && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white">
                          {activeOrdersCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2.5 text-[10px] uppercase tracking-wider font-semibold text-text-soft hover:bg-background/20 hover:text-foreground transition-colors rounded-sm"
                    >
                      <FiUser className="text-[12px]" />
                      My Profile
                    </Link>
                    <Link
                      href="/profile/wishlist"
                      className="flex items-center gap-2 px-3 py-2.5 text-[10px] uppercase tracking-wider font-semibold text-text-soft hover:bg-background/20 hover:text-foreground transition-colors rounded-sm"
                    >
                      <FiHeart className="text-[12px]" />
                      My Wishlist
                    </Link>
                  </div>
                  <div className="pt-0.5">
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[10px] uppercase tracking-wider font-bold text-red-600 hover:bg-red-50/30 transition-colors cursor-pointer outline-none rounded-sm"
                    >
                      <FiLogOut className="text-[12px]" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-background text-text-soft transition-colors hover:border-text-soft hover:text-foreground outline-none cursor-pointer"
                aria-label="Login"
              >
                <FiUser className="text-[16px]" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-text-soft transition-colors hover:text-foreground outline-none cursor-pointer"
            aria-label="Open mobile menu"
          >
            <FiMenu className="text-[18px]" />
          </button>
        </div>
      </motion.div>

      {/* SIDE NAVIGATION DRAWER */}
      <div
        className={`fixed inset-0 z-[100] lg:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 bottom-0 w-[280px] sm:w-[320px] bg-surface border-l border-line shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-4 border-b border-line bg-background/50">
            <span className="font-display font-semibold tracking-tight text-foreground text-lg">
              <img src="/logo.svg" alt="logo" className="w-24 h-24" />
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="h-8 w-8 flex items-center justify-center rounded-full border border-line bg-surface text-text-soft"
            >
              <FiX className="text-[16px]" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto px-6 py-6 space-y-8">
            <div className="relative">
              <form
                onSubmit={(e) => {
                  handleSearchSubmit(e);
                  setIsMobileMenuOpen(false);
                }}
                className="relative"
              >
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-soft text-[14px]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-background border border-line rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder-text-soft/60 outline-none focus:border-accent transition-colors"
                />
              </form>

              {/* Mobile Mobile Results Inline List */}
              {searchQuery.trim().length >= 2 && (
                <div className="mt-2 bg-background border border-line rounded-lg divide-y divide-line/50 overflow-hidden shadow-sm">
                  {isSearchLoading ? (
                    <div className="p-4 flex items-center justify-center gap-2 text-xs text-text-soft">
                      <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      Searching...
                    </div>
                  ) : searchResults ? (
                    <>
                      {searchResults.products.slice(0, 3).map((prod) => (
                        <Link
                          key={prod.id}
                          href={`/shop?search=${encodeURIComponent(prod.sku)}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 p-3 hover:bg-surface-strong transition-colors"
                        >
                          <div className="w-10 h-10 rounded bg-surface border border-line flex-shrink-0">
                            <img
                              src={prod.image || "/placeholder.svg"}
                              className="w-full h-full object-cover rounded"
                              alt=""
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                              {prod.name}
                            </p>
                            {prod.sizes?.[0]?.price && (
                              <p className="text-[10px] font-bold text-accent">
                                ৳{prod.sizes[0].price}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}

                      {(searchResults.categories.length > 0 ||
                        searchResults.brands.length > 0) && (
                        <div className="p-3 bg-surface/30">
                          <p className="text-[10px] tracking-wider text-text-soft mb-2">
                            Brands/Category
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {searchResults.categories.slice(0, 2).map((cat) => (
                              <Link
                                key={cat.id}
                                href={`/shop?category=${cat.id}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="px-2.5 py-1 border border-line bg-white rounded text-[11px] font-medium text-foreground"
                              >
                                {cat.name}
                              </Link>
                            ))}
                            {searchResults.brands.slice(0, 2).map((brand) => (
                              <Link
                                key={brand.id}
                                href={`/shop?brand=${brand.id}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="px-2.5 py-1 border border-line bg-white rounded text-[11px] font-medium text-foreground"
                              >
                                {brand.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {searchResults.products.length === 0 &&
                        searchResults.categories.length === 0 &&
                        searchResults.brands.length === 0 && (
                          <div className="p-4 text-center text-xs text-text-soft">
                            No matches
                          </div>
                        )}

                      <button
                        onClick={handleSearchSubmit}
                        className="w-full py-2.5 text-center text-xs font-bold text-accent bg-accent/5 hover:bg-accent/10 transition-colors border-t border-line"
                      >
                        See all results
                      </button>
                    </>
                  ) : null}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 border-b border-line pb-6">
              <Link
                href="/shop"
                className="text-base font-medium text-foreground hover:text-accent transition-colors flex items-center gap-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <img src="/nav/shop.svg" alt="" className="w-5 h-5" />
                Explore Shop
              </Link>
              <Link
                href="/shop?tag=new"
                className="text-base font-medium text-foreground hover:text-accent transition-colors flex items-center gap-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <img src="/nav/new.svg" alt="" className="w-5 h-5" />
                New Arrivals
              </Link>

              {user && (
                <>
                  <Link
                    href="/orders"
                    className="text-base font-medium text-foreground hover:text-accent transition-colors flex items-center justify-between"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <FiBag className="w-5 h-5 text-text-soft" />
                      My Orders
                    </div>
                    {activeOrdersCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                        {activeOrdersCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/profile"
                    className="text-base font-medium text-foreground hover:text-accent transition-colors flex items-center justify-between"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <FiUser className="w-5 h-5 text-text-soft" />
                      My Profile
                    </div>
                  </Link>
                  <Link
                    href="/profile/wishlist"
                    className="text-base font-medium text-foreground hover:text-accent transition-colors flex items-center justify-between"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <FiHeart className="w-5 h-5 text-text-soft" />
                      My Wishlist
                    </div>
                  </Link>

                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin/products"
                      className="text-base font-medium text-amber-700 hover:text-amber-800 transition-colors flex items-center gap-3"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FiSliders className="w-5 h-5" />
                      Admin Control
                    </Link>
                  )}
                </>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-text-soft">
                Categories
              </h3>
              <div className="grid gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-1.5 rounded-lg border border-line/20 bg-background hover:bg-surface-strong transition-all"
                  >
                    <div className="w-8 h-8 rounded-md bg-surface-strong/50 p-1.5 shrink-0 flex items-center justify-center">
                      <img
                        src={getCategoryIconPath(cat.icon)}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[13px] font-medium text-foreground">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-line bg-background/50">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#f2eadf] border border-line flex items-center justify-center font-bold text-[#5e4b38] uppercase text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {user.name}
                    </span>
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-[11px] text-accent hover:underline"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
                <button onClick={logout} className="text-red-600 p-2">
                  <FiLogOut className="text-[18px]" />
                </button>
              </div>
            ) : (
              <ButtonLink
                variant="outline"
                href="/auth/signin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full !bg-accent !rounded-full h-12 !text-white transition-all"
              >
                My account
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
