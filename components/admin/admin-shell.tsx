"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
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
} from "react-icons/fi";
import { ButtonLink } from "../ui/button";

const navigationItems = [
  { href: "/admin", label: "Home", icon: FiHome },
  { href: "/admin/sourcing", label: "Koba Sourcing", icon: FiPlus },
  { href: "/admin/orders", label: "Orders", icon: FiShoppingBag },
  { href: "/admin/categories", label: "Categories", icon: FiGrid },
  { href: "/admin/products", label: "Products", icon: FiPackage },
  { href: "/admin/customers", label: "Customers", icon: FiUsers },
  { href: "/admin/social", label: "Social Media", icon: FiInstagram },
  { href: "/admin/site", label: "Site", icon: FiSettings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasUnseenOrders, setHasUnseenOrders] = useState(false);

  useEffect(() => {
    if (loading || !user || user.role !== "ADMIN") return;

    const checkUnseenOrders = async () => {
      try {
        const token = localStorage.getItem("elara_token");
        if (!token) return;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${baseUrl}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const allOrders = json.data;
          const seenOrdersStr = localStorage.getItem("elara_seen_orders");
          const seenOrderIds: string[] = seenOrdersStr ? JSON.parse(seenOrdersStr) : [];

          // If current pathname is on the admin orders page, mark all as seen
          if (pathname === "/admin/orders") {
            const currentIds = allOrders.map((o: any) => o.id);
            localStorage.setItem("elara_seen_orders", JSON.stringify(currentIds));
            setHasUnseenOrders(false);
          } else {
            // Check if there are any orders not present in the seen list
            const unseen = allOrders.some((o: any) => !seenOrderIds.includes(o.id));
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

  const activeSection =
    navigationItems
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
            "bg-accent-deep text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:flex-col",
            "fixed left-0 top-0 z-50 h-full w-[82%] max-w-[280px] transition-transform duration-300 ease-out lg:static lg:translate-x-0",
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0",
          ].join(" ")}
        >
          <div className="px-5 py-5 sm:px-8 lg:px-6">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center border border-white/15 bg-white/10 text-sm font-semibold tracking-[0.24em] text-white">
                E
              </span>
              <span>
                <span className="block text-sm uppercase tracking-[0.32em] text-white/75">
                  Elara Admin
                </span>
              </span>
            </Link>
          </div>

          <nav className="grid grid-cols-1 gap-2 px-4 py-4 sm:grid-cols-2 lg:flex lg:flex-1 lg:flex-col lg:px-4 lg:py-5">
            {navigationItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "inline-flex w-full items-center gap-3 border border-transparent px-4 py-3 text-xs uppercase tracking-[0.24em] transition-colors lg:justify-start",
                    active
                      ? "bg-white/10 text-white"
                      : "bg-transparent text-white/85 hover:bg-white/5 hover:text-white",
                  ].join(" ")}
                >
                  <Icon className="text-[15px]" />
                  <span className="relative inline-flex items-center gap-1.5">
                    {item.label}
                    {item.label === "Orders" && hasUnseenOrders && (
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden px-6 py-5 lg:block">
            <div className="grid gap-2 text-sm">
              <Link
                href="/shop"
                className="border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors hover:border-white/30 hover:bg-white/10"
              >
                Open shop
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
                <FiUser className="text-[14px]" />
                {user.name}
              </div>
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-2 border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white transition-colors hover:border-white/30 hover:bg-white/10 cursor-pointer"
              >
                <FiLogOut className="text-[14px]" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <header className="border-b border-line bg-surface px-5 py-4 sm:px-8 lg:px-10">
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
                  className="inline-flex items-center gap-2 border border-line bg-background px-4 py-3 text-xs uppercase tracking-[0.22em] text-foreground"
                >
                  <FiPlus className="text-[14px]" />
                  Add Product
                </Link>
              </div>
            </div>
          </header>

          <main className="px-5 py-6 sm:px-8 lg:px-10 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
