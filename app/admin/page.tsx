"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiArrowRight, FiClock, FiPackage, FiShoppingBag, FiTag, FiTrendingUp, FiUsers, FiRefreshCw } from "react-icons/fi";
import { LogoLoader } from "@/components/ui/logo-loader";

interface StatItem {
  label: string;
  value: string;
  note: string;
  type: string;
}

interface RecentOrder {
  id: string;
  dbId: string;
  name: string;
  item: string;
  amount: string;
  status: string;
  date: string;
}

const getIconForStat = (type: string) => {
  switch (type) {
    case "revenue": return FiTrendingUp;
    case "orders": return FiShoppingBag;
    case "products": return FiPackage;
    case "customers": return FiUsers;
    default: return FiTag;
  }
};

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<StatItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("elara_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      
      const res = await fetch(`${baseUrl}/stats/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const json = await res.json();
      if (json.success) {
        setOverview(json.data.overview);
        setRecentOrders(json.data.recentOrders);
      } else {
        setError(json.message || "Failed to sync dashboard");
      }
    } catch (err) {
      setError("Could not communicate with backend servers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-text-soft">
        <LogoLoader size="lg" />
        <p className="mt-4 text-sm">Aggregating core system intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <button onClick={fetchDashboard} className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-foreground font-bold border border-line bg-white px-4 py-2">
          <FiRefreshCw /> Retry Sync
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistical Insights Grid */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {overview.map((stat) => {
          const Icon = getIconForStat(stat.type);

          return (
            <article key={stat.label} className="border border-line bg-surface px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-text-soft">{stat.label}</p>
                  <p className="mt-2.5 text-3xl font-semibold tracking-[-0.04em] text-foreground">{stat.value}</p>
                  <p className="mt-1.5 text-xs text-text-soft font-medium">{stat.note}</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center border border-line bg-background text-accent-deep shadow-sm">
                  <Icon className="text-[16px]" />
                </span>
              </div>
            </article>
          );
        })}
      </section>

      {/* Recent Activity Table */}
      <section className="border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 bg-background/30">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-text-soft">Orders</p>
            <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-foreground">Recent Stream</h2>
          </div>
          <Link href="/admin/orders" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-accent hover:text-accent-deep transition-colors">
            Master View
            <FiArrowRight className="text-[14px]" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-text-soft italic text-sm border-b border-line border-dashed">
            No incoming orders found in current system queue.
          </div>
        ) : (
          <>
            {/* Mobile Cards Layout */}
            <div className="space-y-3 p-5 md:hidden">
              {recentOrders.map((order) => (
                <article key={order.dbId} className="border border-line bg-background px-4 py-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-foreground">{order.id}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.22em] font-semibold text-text-soft">{order.name}</p>
                    </div>
                    <span className="text-sm font-bold text-foreground">{order.amount}</span>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-text-soft">
                    <div className="flex items-center justify-between border-t border-line pt-3">
                      <span className="text-xs">Primary Line</span>
                      <span className="text-foreground font-medium">{order.item}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-line pt-2.5">
                      <span className="text-xs">State</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded ${
                        order.status === "Cancelled" ? "text-red-600 bg-red-50 border-red-100" :
                        order.status === "Delivered" ? "text-green-700 bg-green-50 border-green-100" :
                        "text-accent bg-accent/5 border-accent/10"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Desktop Grid Layout */}
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-line text-[10px] font-bold uppercase tracking-[0.26em] text-text-soft bg-background/20">
                  <tr>
                    <th className="px-6 py-3.5">Tracking</th>
                    <th className="px-6 py-3.5">Customer Name</th>
                    <th className="px-6 py-3.5">Contents</th>
                    <th className="px-6 py-3.5">Flow</th>
                    <th className="px-6 py-3.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/50">
                  {recentOrders.map((order) => (
                    <tr key={order.dbId} className="hover:bg-background/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground text-xs">{order.id}</td>
                      <td className="px-6 py-4 text-text-soft font-medium">{order.name}</td>
                      <td className="px-6 py-4 text-text-soft text-xs max-w-[200px] truncate" title={order.item}>
                        {order.item}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest border rounded-full ${
                          order.status === "Cancelled" ? "text-red-600 bg-red-50 border-red-100" :
                          order.status === "Delivered" ? "text-green-700 bg-green-50 border-green-100" :
                          "text-accent bg-accent/5 border-accent/10"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-foreground">{order.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}