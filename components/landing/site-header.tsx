"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiSearch, FiShoppingBag, FiUser, FiSliders, FiShoppingBag as FiBag, FiLogOut, FiX } from "react-icons/fi";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";

export function SiteHeader() {
  const { settings } = useStore();
  const { user, logout } = useAuth();
  const router = useRouter();

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
          {settings.logo ? (
            <span className="relative h-9 w-28 overflow-hidden">
              <Image
                src={settings.logo}
                alt={settings.logoAlt}
                fill
                className="object-contain object-left"
                unoptimized
                sizes="112px"
              />
            </span>
          ) : (
            <span className="leading-tight">
              <span className="block text-xl font-semibold tracking-[0.1em] font-display text-foreground">ELARA</span>
            </span>
          )}
        </Link>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-8 text-xs uppercase tracking-[0.28em] text-text-soft lg:flex">
          <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <a href="#categories" className="hover:text-foreground transition-colors">Categories</a>
          <a href="#offer" className="hover:text-foreground transition-colors">Offer</a>
          <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
        </nav>

        {/* Header Icons & Session Controls (Symmetrical Rounded Layout) */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            
            {/* Expandable Search Input (Rounded Spheroid Button) */}
            <form onSubmit={handleSearchSubmit} className="flex items-center">
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
                      : "w-0 px-0 py-0 opacity-0 border-none pointer-events-none"
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

            {/* Shopping Cart (Rounded Spheroid Button) */}
            <Link
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-background text-text-soft transition-colors hover:border-text-soft hover:text-foreground outline-none cursor-pointer"
              aria-label="Cart"
            >
              <FiShoppingBag className="text-[16px]" />
            </Link>

            {/* Auth Session / Dropdown Controller (Rounded Spheroid Button) */}
            {user ? (
              <div className="relative group">
                <button 
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2eadf] border border-line text-xs font-bold text-[#5e4b38] uppercase hover:border-text-soft transition-colors outline-none cursor-pointer"
                >
                  {user.name.charAt(0)}
                </button>
                
                {/* Dropdown Menu on hover */}
                <div className="absolute right-0 top-full z-50 mt-2.5 w-44 origin-top-right border border-line bg-surface p-1 shadow-md scale-0 group-hover:scale-100 transition-all duration-150 origin-top divide-y divide-line/40">
                  <div className="space-y-0.5">
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin/products"
                        className="flex items-center gap-2 px-3 py-2.5 text-[10px] uppercase tracking-wider font-semibold text-amber-700 hover:bg-amber-50/30 transition-colors"
                      >
                        <FiSliders className="text-[12px]" />
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      href="/orders"
                      className="flex items-center gap-2 px-3 py-2.5 text-[10px] uppercase tracking-wider font-semibold text-text-soft hover:bg-background/20 hover:text-foreground transition-colors"
                    >
                      <FiBag className="text-[12px]" />
                      My Orders
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2.5 text-[10px] uppercase tracking-wider font-semibold text-text-soft hover:bg-background/20 hover:text-foreground transition-colors"
                    >
                      <FiUser className="text-[12px]" />
                      My Profile
                    </Link>
                  </div>
                  <div className="pt-0.5">
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[10px] uppercase tracking-wider font-bold text-red-600 hover:bg-red-50/30 transition-colors cursor-pointer outline-none"
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
        </div>
      </div>
    </header>
  );
}
