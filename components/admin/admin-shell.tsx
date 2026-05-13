"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBarChart2,
  FiGrid,
  FiHome,
  FiSettings,
  FiPackage,
  FiShoppingBag,
  FiPlus,
  FiLogOut,
  FiUser,
  FiMenu,
  FiUsers,
  FiInstagram,
  FiAward,
  FiImage,
  FiChevronDown,
  FiExternalLink,
  FiTag,
  FiMapPin,
} from "react-icons/fi";
import { ButtonLink } from "../ui/button";

const navigationGroups = [
  {
    title: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: FiHome },
      { href: "/admin/orders", label: "Orders", icon: FiShoppingBag },
      { href: "/admin/customers", label: "Customers", icon: FiUsers },
    ],
  },
  {
    title: "Catalog Management",
    items: [
      { href: "/admin/products", label: "Products", icon: FiPackage },
      { href: "/admin/categories", label: "Categories", icon: FiGrid },
      { href: "/admin/brands", label: "Brands", icon: FiAward },
    ],
  },
  {
    title: "Marketing & Assets",
    items: [
      { href: "/admin/offers", label: "Offers & Sales", icon: FiTag },
      { href: "/admin/gallery", label: "Media Gallery", icon: FiImage },
      { href: "/admin/social", label: "Social Media", icon: FiInstagram },
      { href: "/admin/sourcing", label: "Koba Sourcing", icon: FiPlus },
    ],
  },
  {
    title: "Site Engine",
    items: [
      { href: "/admin/site", label: "Settings", icon: FiSettings },
      { href: "/admin/delivery", label: "Delivery Fees", icon: FiMapPin },
    ],
  },
];


export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasUnseenOrders, setHasUnseenOrders] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (loading || !user || user.role !== "ADMIN") return;

    const checkUnseenOrders = async () => {
      try {
        const token = localStorage.getItem("elara_token");
        if (!token) return;
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${baseUrl}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const allOrders = json.data;
          const seenOrdersStr = localStorage.getItem("elara_seen_orders");
          const seenOrderIds: string[] = seenOrdersStr
            ? JSON.parse(seenOrdersStr)
            : [];

          if (pathname === "/admin/orders") {
            const currentIds = allOrders.map((o: any) => o.id);
            localStorage.setItem(
              "elara_seen_orders",
              JSON.stringify(currentIds),
            );
            setHasUnseenOrders(false);
          } else {
            const unseen = allOrders.some(
              (o: any) => !seenOrderIds.includes(o.id),
            );
            setHasUnseenOrders(unseen);
          }
        }
      } catch (err) {
        console.error("Failed to check unseen admin orders:", err);
      }
    };

    checkUnseenOrders();
    const interval = setInterval(checkUnseenOrders, 15000);
    return () => clearInterval(interval);
  }, [pathname, loading, user]);

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.push("/auth/signin");
    }
  }, [loading, user, router]);

  const allNavItems = navigationGroups.flatMap((g) => g.items);

  const activeSection =
    allNavItems
      .filter(
        (item) =>
          pathname === item.href || pathname.startsWith(`${item.href}/`),
      )
      .sort((a, b) => b.href.length - a.href.length)[0]?.label ?? "Dashboard";

  if (loading || !user || user.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        <p className="text-sm text-text-soft">Authenticating session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        {isSidebarOpen ? (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
            className="fixed inset-0 z-40 bg-[#0e0b0a]/40 lg:hidden"
          />
        ) : null}
        <aside
          className={[
            "bg-accent-deep text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:flex-col overflow-y-auto scrollbar-thin",
            "fixed left-0 top-0 z-50 h-full w-[82%] max-w-[280px] transition-transform duration-300 ease-out lg:static lg:translate-x-0",
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0",
          ].join(" ")}
        >
          <div className="px-5 py-5 sm:px-8 lg:px-6 shrink-0">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="block text-sm uppercase tracking-[0.32em] text-white/75">
                Elara Admin
              </span>
            </Link>
          </div>

          <nav className="flex flex-col flex-1 gap-6 px-4 py-4">
            {navigationGroups.map((group) => (
              <div key={group.title} className="space-y-1.5">
                <p className="px-4 text-sm text-white/40">{group.title}</p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active =
                      pathname === item.href ||
                      (item.href !== "/admin" &&
                        pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={[
                          "flex w-full items-center gap-3 border border-transparent px-4 py-2.5 text-sm transition-colors",
                          active
                            ? "bg-white/10 text-white font-medium"
                            : "bg-transparent text-white/70 hover:bg-white/5 hover:text-white",
                        ].join(" ")}
                      >
                        <Icon
                          className={`text-[14px] ${active ? "text-accent" : "text-inherit"}`}
                        />
                        <span className="relative inline-flex items-center gap-1.5">
                          {item.label}
                          {item.label === "Orders" && hasUnseenOrders && (
                            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                          )}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="border-b border-line bg-surface px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="flex h-10 w-10 items-center justify-center border border-line bg-background text-foreground lg:hidden"
                  aria-label="Open sidebar"
                >
                  <FiMenu className="text-[18px]" />
                </button>
                <h1 className="font-display text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-3xl">
                  {activeSection}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
                <ButtonLink href="/admin/orders/new">
                  <FiPlus className="text-[14px]" />
                  Add order
                </ButtonLink>
                <Link
                  href="/admin/products/new"
                  className="inline-flex items-center gap-2 border border-line bg-background px-4 py-3 text-xs uppercase tracking-[0.22em] text-foreground hover:border-accent transition-colors"
                >
                  <FiPlus className="text-[14px]" />
                  Product
                </Link>

                {/* Vertical Divider */}
                <div className="hidden sm:block h-8 w-px bg-line mx-1" />

                {/* User Account Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`flex items-center gap-2.5 border px-3 py-2 text-foreground transition-all ${
                      isUserMenuOpen
                        ? "bg-surface border-accent"
                        : "bg-background border-line hover:border-accent/50"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-accent-deep text-white flex items-center justify-center text-xs font-bold">
                      {user.name?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <span className="hidden md:block text-xs font-medium text-foreground max-w-[100px] truncate">
                      {user.name?.split(" ")[0]}
                    </span>
                    <FiChevronDown
                      className={`text-xs text-text-soft transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 border border-line bg-surface shadow-xl z-[100] overflow-hidden"
                      >
                        <div className="p-4 border-b border-line bg-background/50">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {user.name}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-text-soft mt-0.5">
                            Administrator
                          </p>
                        </div>

                        <div className="p-1.5">
                          <Link
                            href="/shop"
                            target="_blank"
                            className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-background transition-colors group"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <FiExternalLink className="text-text-soft group-hover:text-accent" />
                            <span>View Storefront</span>
                          </Link>

                          <Link
                            href="/admin/site"
                            className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-background transition-colors group"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <FiSettings className="text-text-soft group-hover:text-accent" />
                            <span>Site Settings</span>
                          </Link>
                        </div>

                        <div className="p-1.5 border-t border-line">
                          <button
                            onClick={logout}
                            className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-sm text-red-600 font-medium hover:bg-red-50 transition-colors group"
                          >
                            <FiLogOut className="group-hover:translate-x-0.5 transition-transform" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
