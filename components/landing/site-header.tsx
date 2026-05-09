"use client";

import { useState, useEffect } from "react";
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
} from "react-icons/fi";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getCategoryIconPath } from "@/components/admin/categories-data";

interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export function SiteHeader() {
  const { settings } = useStore();
  const { user, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
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

  // Search expanding states
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="border-b border-line bg-surface sticky top-0 z-50">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3">
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

        {/* Navigation Links */}
        <nav className="hidden items-center gap-7 text-[15px] font-medium text-foreground/80 lg:flex">
          <Link
            href="/shop"
            className="flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <img
              src="/nav/shop.svg"
              alt=""
              className="w-[18px] h-[18px] opacity-80 group-hover:opacity-100"
            />
            Shop
          </Link>

          {/* Dynamic Category Hover Dropdown */}
          <div className="relative group h-full flex items-center py-4 cursor-pointer -mr-2">
            <div className="flex items-center gap-2 hover:text-foreground transition-colors">
              <img
                src="/nav/category.svg"
                alt=""
                className="w-[18px] h-[18px] opacity-80"
              />
              Categories
              <FiChevronDown className="text-[13px] transition-transform duration-300 group-hover:rotate-180" />
            </div>

            {/* Populated Dense Grid Container */}
            <div className="absolute top-[90%] left-1/2 -translate-x-1/2 mt-1 w-[420px] bg-surface border border-line p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top shadow-lg z-50 grid grid-cols-2 gap-1 rounded-lg">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.id}`}
                    className="group/cat flex items-center gap-3 p-2 hover:bg-background border border-transparent rounded-md hover:border-line/30 transition-all duration-200"
                  >
                    {/* Expanded Image with zero inner padding for maximum fill */}
                    <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-surface-strong/60 border border-line/20 rounded-md overflow-hidden p-0 transition-all duration-300 group-hover/cat:bg-accent/5">
                      <img
                        src={getCategoryIconPath(cat.icon)}
                        alt=""
                        className="w-full h-full object-contain p-1 transition-transform duration-300 group-hover/cat:scale-110"
                      />
                    </div>
                    <div className="flex flex-col overflow-hidden min-w-0 gap-0.5">
                      <span className="text-[15px] font-medium text-foreground leading-tight group-hover/cat:text-accent transition-colors truncate">
                        {cat.name}
                      </span>
                      <span className="text-[11px] font-normal text-text-soft leading-tight truncate">
                        {cat.description || "Curated items"}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <span className="col-span-2 text-center py-3 text-[9px] text-text-soft tracking-wider">
                  Loading...
                </span>
              )}
            </div>
          </div>

          <Link
            href="/shop"
            className="flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <img
              src="/nav/new.svg"
              alt=""
              className="w-[18px] h-[18px] opacity-80"
            />
            New Arrivals
          </Link>
          <Link
            href="/shop"
            className="flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <img
              src="/nav/best.svg"
              alt=""
              className="w-[18px] h-[18px] opacity-80"
            />
            Best Sellers
          </Link>
        </nav>

        {/* Header Icons & Session Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Expandable Search Input - DESKTOP ONLY */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden lg:flex items-center"
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className={[
                    "bg-background/50 border border-line outline-none text-xs transition-all duration-300 ease-in-out placeholder-text-soft/60 rounded-full",
                    isSearchExpanded
                      ? "w-40 sm:w-48 px-4 py-2 opacity-100"
                      : "w-0 px-0 py-0 opacity-0 border-none pointer-events-none",
                  ].join(" ")}
                />

                {isSearchExpanded ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchExpanded(false);
                      setSearchQuery("");
                    }}
                    className="absolute right-3.5 text-text-soft hover:text-foreground outline-none transition-colors"
                  >
                    <FiX className="text-[14px]" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSearchExpanded(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-background text-text-soft transition-colors hover:border-text-soft hover:text-foreground outline-none cursor-pointer"
                    aria-label="Search"
                  >
                    <FiSearch className="text-[16px]" />
                  </button>
                )}
              </div>
            </form>

            {/* Shopping Cart (Visible Always) */}
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

            {/* Auth Session Dropdown - DESKTOP ONLY */}
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

                  {/* Dropdown Menu on hover */}
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

            {/* MOBILE MENU TOGGLE HAMBURGER (Mobile only) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex lg:hidden h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-text-soft transition-colors hover:text-foreground outline-none cursor-pointer"
              aria-label="Open mobile menu"
            >
              <FiMenu className="text-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {/* SLIDE-OUT MOBILE NAVIGATION DRAWER */}
      <div
        className={`fixed inset-0 z-[100] lg:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {/* Dark Overlay Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Drawer Panel */}
        <div
          className={`absolute top-0 right-0 bottom-0 w-[280px] sm:w-[320px] bg-surface border-l border-line shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-line bg-background/50">
            <span className="font-display font-semibold tracking-tight text-foreground text-lg">
              Menu
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="h-8 w-8 flex items-center justify-center rounded-full border border-line bg-surface text-text-soft"
            >
              <FiX className="text-[16px]" />
            </button>
          </div>

          {/* Panel Scrollable Content */}
          <div className="flex-grow overflow-y-auto px-6 py-6 space-y-8">
            {/* Mobile Search */}
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

            {/* Direct Link Hierarchy */}
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
            </div>

            {/* Mobile Categories Cluster */}
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
                    className="flex items-center gap-3 p-2 rounded-lg border border-line/30 bg-background hover:bg-surface-strong transition-all"
                  >
                    <div className="w-10 h-10 rounded-md bg-surface-strong/50 p-1.5 shrink-0 flex items-center justify-center">
                      <img
                        src={getCategoryIconPath(cat.icon)}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Panel Footer sticky actions (Auth) */}
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
              <Link
                href="/auth/signin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 bg-foreground text-background py-3 px-4 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-accent transition-all"
              >
                <FiUser className="text-[16px]" /> Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
