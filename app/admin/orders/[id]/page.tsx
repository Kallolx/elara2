"use client";

import React, { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import { CopyFieldButton } from "@/components/admin/copy-field-button";
import { ButtonLink } from "@/components/ui/button";

interface OrderItem {
  id: string;
  sku?: string;
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

type OrderRoutePageProps = {
  params: Promise<{ id: string }>;
};

export default function AdminOrderDetailsPage({ params }: OrderRoutePageProps) {
  const { id } = use(params) as { id: string };

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
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
          const found = json.data.find((o: Order) => o.id === id);
          if (found) {
            setOrder(found);
          }
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdatingStatus(true);
    setSuccessMsg(null);
    try {
      const token = localStorage.getItem("elara_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${baseUrl}/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setOrder((prev) => prev ? { ...prev, status: newStatus } : null);
        setSuccessMsg(`Order successfully updated to "${newStatus}"!`);
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatus(false);
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent mb-3" />
        <p className="text-xs uppercase tracking-widest font-semibold text-text-soft">Loading order details, please wait...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 border border-line bg-surface">
        <p className="text-xs uppercase tracking-widest font-semibold text-text-soft mb-4">Order not found</p>
        <ButtonLink href="/admin/orders">Back to orders</ButtonLink>
      </div>
    );
  }

  const copyBlock = `${order.customerName}\n${order.phone}\n${order.address}\n${order.city}`;
  const subtotal = order.total - order.shipping;
  const totalItems = Array.isArray(order.items)
    ? order.items.reduce((acc, item) => acc + item.quantity, 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Toast message inside admin details */}
      {successMsg && (
        <div className="fixed top-24 right-5 z-50 flex items-center gap-2.5 border border-emerald-200 bg-emerald-50/90 backdrop-blur-sm px-5 py-3.5 shadow-lg rounded-sm animate-in fade-in slide-in-from-top-4">
          <FiCheck className="text-emerald-600 text-base shrink-0" />
          <p className="text-xs uppercase tracking-wider font-semibold text-emerald-800">{successMsg}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ButtonLink href="/admin/orders" variant="ghost" size="sm">
          <FiArrowLeft className="text-[14px]" />
          Back to orders
        </ButtonLink>
        <span className={`rounded-full border px-4 py-1 text-[11px] uppercase tracking-[0.22em] font-semibold ${getStatusBadgeStyle(order.status)}`}>
          {order.status}
        </span>
      </div>

      {/* Admin Order Confirmation Actions Bar */}
      <article className="border border-line bg-surface p-5 space-y-4">
        <div>
          <h3 className="text-xs uppercase tracking-widest font-semibold text-text-soft">Confirm & Process Order Actions</h3>
          <p className="text-[11px] text-text-soft normal-case mt-1">Change order status to confirm with customer, dispatch delivery, or cancel.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {["Pending", "Processing", "Delivered", "Cancelled"].map((status) => {
            const active = order.status === status;
            return (
              <button
                key={status}
                type="button"
                disabled={updatingStatus || active}
                onClick={() => handleUpdateStatus(status)}
                className={[
                  "px-4 py-2.5 text-xs font-bold uppercase tracking-wider border rounded-sm transition-all cursor-pointer outline-none",
                  active
                    ? "bg-accent border-accent text-white font-bold opacity-100"
                    : "bg-background border-line text-text-soft hover:border-accent/50 hover:text-foreground disabled:opacity-50",
                ].join(" ")}
              >
                {status === "Pending" && "Mark Pending"}
                {status === "Processing" && "Confirm & Process"}
                {status === "Delivered" && "Mark Delivered"}
                {status === "Cancelled" && "Cancel Order"}
              </button>
            );
          })}
        </div>
      </article>

      <header className="grid gap-4 border border-line bg-surface px-5 py-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-text-soft font-semibold">
            Order overview
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            #EL-{order.id.slice(0, 8).toUpperCase()}
          </h2>
        </div>
        <div className="lg:text-right">
          <p className="text-[11px] uppercase tracking-[0.24em] text-text-soft font-semibold">
            Total Price
          </p>
          <p className="mt-1 text-3xl font-bold tracking-[-0.05em] text-accent sm:text-4xl">
            ৳ {order.total.toLocaleString()}
          </p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Customer Information Column */}
        <article className="border border-line bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
            <h3 className="text-base font-semibold tracking-[-0.03em] text-foreground">
              Delivery Information
            </h3>
            <CopyFieldButton value={copyBlock} label="customer details" />
          </div>

          <div className="divide-y divide-line border border-line bg-background">
            {[
              ["Customer Name", order.customerName],
              ["Phone No", order.phone],
              ["Address", order.address],
              ["City/Region", order.city],
              ["Order Placed At", new Date(order.createdAt).toLocaleString()],
            ].map(([label, value]) => (
              <div key={label} className="px-4 py-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[10px] uppercase tracking-[0.24em] text-text-soft font-semibold">
                  {label}
                </p>
                <p className="text-sm font-semibold text-foreground normal-case leading-7">{value}</p>
              </div>
            ))}
          </div>
        </article>

        {/* Invoice Summary Column */}
        <article className="border border-line bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
            <h3 className="text-base font-semibold tracking-[-0.03em] text-foreground">
              Billing & Invoice
            </h3>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-emerald-700 font-bold">
              PAID (COD)
            </span>
          </div>

          <div className="border border-line bg-background">
            {[
              ["Payment Method", order.paymentMethod],
              ["Subtotal", `৳ ${subtotal.toLocaleString()}`],
              ["Delivery Charge", `৳ ${order.shipping.toLocaleString()}`],
              ["Total Invoice", `৳ ${order.total.toLocaleString()}`],
            ].map(([label, value], index) => {
              const isTotal = label === "Total Invoice";

              return (
                <div
                  key={label}
                  className={[
                    "flex items-center justify-between gap-4 px-4 py-4",
                    index !== 3 ? "border-b border-line" : "",
                  ].join(" ")}
                >
                  <span className={isTotal ? "text-sm font-bold text-foreground" : "text-[10px] uppercase tracking-[0.24em] text-text-soft font-semibold"}>
                    {label}
                  </span>
                  <span className={isTotal ? "text-xl font-bold text-accent" : "text-sm font-semibold text-foreground"}>
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        </article>
      </div>

      {/* Items List Table */}
      <article className="border border-line bg-surface p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <h3 className="text-base font-semibold tracking-[-0.03em] text-foreground">
            Purchased Products
          </h3>
          <p className="text-xs text-text-soft uppercase font-bold tracking-wider">{totalItems} items purchased</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line text-[10px] uppercase tracking-[0.26em] text-text-soft font-bold">
              <tr>
                <th className="px-4 py-4 font-normal">Product</th>
                <th className="px-4 py-4 font-normal">Size Variant</th>
                <th className="px-4 py-4 font-normal">Qty</th>
                <th className="px-4 py-4 font-normal text-right">Price</th>
              </tr>
            </thead>
            <tbody className="text-xs uppercase tracking-wider font-semibold">
              {order.items.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className="border-b border-line last:border-b-0 text-text-soft"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 border border-line bg-background shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-foreground normal-case text-sm">
                          {item.name}
                        </p>
                        <p className="mt-1 text-[9px] uppercase tracking-[0.22em] text-text-soft font-bold">
                          {item.sku || `SKU-ITEM-${idx}`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-text-soft text-xs">{item.size}</td>
                  <td className="px-4 py-4 text-foreground text-sm font-bold">{item.quantity}</td>
                  <td className="px-4 py-4 text-accent text-sm font-bold text-right">৳ {item.price.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
