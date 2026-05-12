"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { ButtonLink } from "@/components/ui/button";

interface OrderItem {
  id: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  shipping: number;
  total: number;
  status: string;
  paymentMethod: string;
  items: OrderItem[];
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("elara_token");
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${baseUrl}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setOrders(json.data);
        }
      } catch (err) {
        console.error("Failed to load admin orders list:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you certain you want to permanently expunge this order? This cannot be reverted.")) {
      return;
    }

    try {
      const token = localStorage.getItem("elara_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${baseUrl}/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (json.success) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      } else {
        alert(json.message || "Failed to delete order.");
      }
    } catch (err) {
      console.error("Error deleting admin order:", err);
      alert("An error occurred while attempting order deletion.");
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 border-amber-200 text-amber-700";
      case "Processing":
        return "bg-sky-50 border-sky-200 text-sky-700";
      case "Delivered":
        return "bg-emerald-50 border-emerald-200 text-emerald-700";
      default:
        return "bg-stone-50 border-stone-200 text-stone-700";
    }
  };

  return (
    <div className="space-y-6">
      <article className="border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-foreground">
              Manage orders and payments
            </h2>
          </div>
          <ButtonLink href="/admin/orders/new">
            <FiPlus className="text-[14px]" />
            Add order
          </ButtonLink>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent mb-3" />
            <p className="text-xs uppercase tracking-widest font-semibold text-text-soft">Loading orders, please wait...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-xs uppercase tracking-widest font-semibold text-text-soft">No orders placed yet.</p>
          </div>
        ) : (
          <>
            {/* Mobile View Card List */}
            <div className="space-y-3 p-5 md:hidden">
              {orders.map((order) => {
                const totalQty = Array.isArray(order.items)
                  ? order.items.reduce((acc, item) => acc + item.quantity, 0)
                  : 0;

                return (
                  <article
                    key={order.id}
                    className="border border-line bg-background px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-foreground">
                          #EL-{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-text-soft">
                          {order.customerName}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-accent">৳ {order.total.toLocaleString()}</span>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-text-soft">
                      <div className="flex items-center justify-between border-t border-line pt-3">
                        <span>Items Count</span>
                        <span className="text-foreground">{totalQty} items</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-line pt-3">
                        <span>Status</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm border text-[10px] font-bold ${getStatusBadgeStyle(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-line pt-3">
                        <span>Payment</span>
                        <span className="text-foreground">{order.paymentMethod}</span>
                      </div>
                    </div>
                    <div className="mt-4 border-t border-line pt-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-2 border border-line bg-surface px-3 py-2 text-xs uppercase tracking-[0.22em] text-foreground cursor-pointer"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="inline-flex items-center justify-center border border-red-100 bg-red-50/30 text-red-600 hover:bg-red-50 px-3 py-2 text-xs uppercase tracking-[0.22em] transition-colors cursor-pointer"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-line text-[11px] uppercase tracking-[0.26em] text-text-soft">
                  <tr>
                    <th className="px-5 py-4 font-normal">Order ID</th>
                    <th className="px-5 py-4 font-normal">Customer</th>
                    <th className="px-5 py-4 font-normal">Items</th>
                    <th className="px-5 py-4 font-normal">Total</th>
                    <th className="px-5 py-4 font-normal">Status</th>
                    <th className="px-5 py-4 font-normal">Payment</th>
                    <th className="px-5 py-4 font-normal">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs uppercase tracking-wider font-semibold">
                  {orders.map((order) => {
                    const totalQty = Array.isArray(order.items)
                      ? order.items.reduce((acc, item) => acc + item.quantity, 0)
                      : 0;

                    return (
                      <tr
                        key={order.id}
                        className="border-b border-line last:border-b-0"
                      >
                        <td className="px-5 py-4 font-bold text-foreground text-sm">
                          #EL-{order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-5 py-4 text-text-soft normal-case font-normal">{order.customerName}</td>
                        <td className="px-5 py-4 text-text-soft">{totalQty}</td>
                        <td className="px-5 py-4 text-accent font-bold">৳ {order.total.toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm border text-[9px] font-bold ${getStatusBadgeStyle(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-text-soft">{order.paymentMethod}</td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="inline-flex items-center gap-2 border border-line bg-background px-3 py-2 text-xs uppercase tracking-[0.22em] text-foreground cursor-pointer"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="inline-flex items-center justify-center border border-red-100 bg-red-50/30 text-red-600 hover:bg-red-50 px-3 py-2 text-xs transition-colors cursor-pointer"
                              title="Delete Order"
                            >
                              <FiTrash2 className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </article>
    </div>
  );
}
