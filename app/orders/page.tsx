"use client";

import { useState, useEffect } from "react";
import {
  FiShoppingBag,
  FiCheck,
  FiStar,
  FiMessageSquare,
  FiRefreshCw,
  FiDownload,
} from "react-icons/fi";
import Link from "next/link";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { useCart } from "@/context/CartContext";
import { CgClose } from "react-icons/cg";
import { IoReload } from "react-icons/io5";
import { BsEye } from "react-icons/bs";

interface OrderItem {
  id: string;
  name: string;
  code: string;
  price: string;
  qty: number;
  image: string;
}

interface Order {
  id: string;
  customerName?: string;
  phone?: string;
  address?: string;
  city?: string;
  date: string;
  total: string;
  status: string;
  paymentMethod: string;
  trackingHub: string;
  items: OrderItem[];
}

const mockOrders: Order[] = [
  {
    id: "#EL-9824",
    date: "May 3, 2026",
    total: "৳ 2,170",
    status: "Delivered",
    paymentMethod: "Cash on Delivery",
    trackingHub: "Dispatched from central Dhaka skincare hub",
    items: [
      {
        id: "1",
        name: "Barrier Glow Serum",
        code: "SK-GLOW-04",
        price: "৳ 1,450",
        qty: 1,
        image:
          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=120",
      },
      {
        id: "2",
        name: "Sun Veil SPF Mini",
        code: "SK-VEIL-01",
        price: "৳ 720",
        qty: 1,
        image:
          "https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&q=80&w=120",
      },
    ],
  },
  {
    id: "#EL-9512",
    date: "April 18, 2026",
    total: "৳ 1,360",
    status: "Delivered",
    paymentMethod: "Bkash Payment",
    trackingHub: "Fulfillment completed and handed over to courier",
    items: [
      {
        id: "3",
        name: "Calming Rose Mist",
        code: "SK-MIST-09",
        price: "৳ 680",
        qty: 2,
        image:
          "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=120",
      },
    ],
  },
];

export default function MyOrdersPage() {
  const { addToCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Review modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const token = localStorage.getItem("elara_token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${baseUrl}/orders/my-orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const formatted: Order[] = json.data.map((order: any) => ({
            id: `#EL-${order.id.slice(0, 8).toUpperCase()}`,
            customerName: order.customerName,
            phone: order.phone,
            address: order.address,
            city: order.city,
            date: new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            total: `৳ ${order.total.toLocaleString()}`,
            status: order.status,
            paymentMethod: order.paymentMethod,
            trackingHub:
              order.status === "Pending"
                ? "Order received and pending verification"
                : "Dispatched from central Dhaka skincare hub",
            items: order.items.map((item: any, idx: number) => ({
              id: item.id || String(idx),
              name: item.name,
              code: item.sku || `SK-ITEM-${idx}`,
              price: `৳ ${item.price.toLocaleString()}`,
              qty: item.quantity,
              image: item.image,
            })),
          }));
          setOrders(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch my orders:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyOrders();
  }, []);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addToCart(
        {
          id: item.id,
          name: item.name,
          image: item.image,
        },
        {
          name: item.code,
          price: parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0,
        },
        item.qty,
      );
    });
    triggerToast(`Successfully added items back into your skincare bag!`);
  };

  const handleDownloadInvoice = (order: Order) => {
    const invoiceContent = `
========================================
             ELARA SKINCARE             
          OFFICIAL TAX INVOICE          
========================================
Invoice No:   ${order.id}
Order Date:   ${order.date}
Payment Mode: ${order.paymentMethod}
Status:       ${order.status}
Fulfillment:  ${order.trackingHub}
----------------------------------------
ITEMS PURCHASED:
${order.items.map((item) => `- ${item.name} (${item.code})\n  Qty: ${item.qty} | Price: ${item.price}`).join("\n\n")}
----------------------------------------
TOTAL PAID:   ${order.total}
========================================
     Thank you for shopping with Elara! 
        Be confident in your skin.      
========================================
    `;

    const blob = new Blob([invoiceContent.trim()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice-${order.id.replace("#", "")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast(`Downloaded Tax Invoice for order ${order.id} successfully!`);
  };

  const handleOpenReview = (itemName: string) => {
    setSelectedItemName(itemName);
    setRating(5);
    setReviewText("");
    setShowReviewModal(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);

    setTimeout(() => {
      setSubmittingReview(false);
      setShowReviewModal(false);
      triggerToast(
        `Thank you! Your 5-star review for "${selectedItemName}" has been submitted successfully.`,
      );
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-5 z-50 flex items-center gap-2.5 border border-emerald-200 bg-emerald-50/90 backdrop-blur-sm px-5 py-3.5 shadow-lg animate-in slide-in-from-top-4 duration-300 rounded-sm">
          <FiCheck className="text-emerald-600 text-base shrink-0" />
          <p className="text-xs uppercase tracking-wider font-semibold text-emerald-800">
            {toastMessage}
          </p>
        </div>
      )}

      <main className="flex-grow max-w-6xl w-full mx-auto px-5 py-12 sm:px-8 lg:px-10 space-y-4">
        <header className="pb-4">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            My Orders
          </h1>
        </header>

        {/* Clean, Minimalist E-Commerce Data Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-line bg-surface shadow-sm">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent mb-3" />
            <p className="text-xs uppercase tracking-widest font-semibold text-text-soft">
              Loading orders, please wait...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-line bg-surface shadow-sm">
            <FiShoppingBag className="text-4xl text-text-soft mb-3" />
            <p className="text-xs uppercase tracking-widest font-semibold text-text-soft mb-1">
              No orders found
            </p>
            <p className="text-[11px] text-text-soft max-w-xs normal-case mb-6">
              You haven't placed any orders yet. Put products in your bag to get
              started!
            </p>
            <Link
              href="/"
              className="border border-accent bg-accent text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 hover:bg-accent-deep transition-colors cursor-pointer rounded-sm"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mobile Cards List - Visible only on small screens */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="border border-line bg-surface p-4 shadow-sm flex flex-col gap-3 cursor-pointer active:scale-[0.99] transition-transform"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-center border-b border-line/40 pb-2">
                    <div className="space-y-0.5">
                      <p className="text-[13px] font-bold text-foreground">
                        {order.id}
                      </p>
                      <p className="text-[10px] text-text-soft uppercase tracking-wider font-semibold">
                        {order.date}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-wider">
                      {order.status}
                    </span>
                  </div>

                  {/* Card Body - Items */}
                  <div className="space-y-3 py-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-9 w-9 object-cover border border-line bg-[#f2eadf] shrink-0 rounded-sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-[11px] font-bold text-foreground truncate normal-case"
                            title={item.name}
                          >
                            {item.name}
                          </p>
                          <p className="text-[10px] text-text-soft font-semibold uppercase tracking-wider">
                            Qty {item.qty} • {item.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer - Total & Actions */}
                  <div className="flex justify-between items-center border-t border-line/40 pt-2.5 mt-1">
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-text-soft uppercase tracking-widest font-bold">
                        Total Paid
                      </p>
                      <p className="text-sm font-bold text-accent">
                        {order.total}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadInvoice(order);
                        }}
                        className="inline-flex items-center gap-1 border border-line bg-background hover:bg-background/80 hover:text-foreground px-2 py-1 text-[9px] tracking-widest font-black text-text-soft uppercase rounded-sm"
                      >
                        Invoice
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReorder(order);
                        }}
                        className="inline-flex items-center gap-1 border border-line bg-background hover:bg-background/80 hover:text-foreground px-2 py-1 text-[9px] tracking-widest font-black text-text-soft uppercase rounded-sm"
                      >
                        Reorder
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table - Hidden on small screens */}
            <div className="hidden md:block border border-line bg-surface overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse text-xs uppercase tracking-wider font-semibold">
                <thead>
                  <tr className="border-b border-line bg-background/25 text-[10px] text-text-soft tracking-[0.18em]">
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Fulfillment</th>
                    <th className="px-6 py-4">Items Summary</th>
                    <th className="px-6 py-4 text-center">Invoices</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/40 text-text-soft">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-background/10 transition-colors cursor-pointer"
                    >
                      {/* Order ID */}
                      <td className="px-6 py-4 font-bold text-foreground text-[13px] whitespace-nowrap">
                        {order.id}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.date}
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4 font-bold text-accent text-[13px] whitespace-nowrap">
                        {order.total}
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-bold">
                          {order.status}
                        </span>
                      </td>

                      {/* Products Column */}
                      <td className="px-6 py-4 normal-case font-normal">
                        <div className="flex flex-col gap-2.5 max-w-xs">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-7 w-7 object-cover border border-line bg-[#f2eadf] shrink-0"
                              />
                              <div className="max-w-[180px] truncate">
                                <span
                                  className="text-foreground text-[11px] font-bold block truncate"
                                  title={item.name}
                                >
                                  {item.name.length > 25
                                    ? item.name.slice(0, 25) + "..."
                                    : item.name}
                                </span>
                                <span className="text-[10px] text-text-soft uppercase tracking-wider block font-semibold truncate">
                                  {item.code} • Qty {item.qty}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Download Invoice Column */}
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadInvoice(order);
                          }}
                          className="inline-flex items-center gap-1.5 border border-line bg-background hover:bg-background/80 hover:text-foreground px-3 py-1.5 text-[9px] tracking-widest font-bold text-text-soft transition-colors cursor-pointer outline-none rounded-sm"
                        >
                          <FiDownload className="text-[11px]" />
                          Invoice
                        </button>
                      </td>

                      {/* Reorder / Review inline Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReorder(order);
                            }}
                            className="text-[10px] font-bold text-text-soft hover:text-foreground tracking-widest transition-colors cursor-pointer outline-none uppercase"
                          >
                            Reorder
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenReview(order.items[0].name);
                            }}
                            className="text-[12px] font-bold text-accent hover:text-accent-deep tracking-widest transition-colors cursor-pointer outline-none uppercase"
                          >
                            <BsEye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />

      {/* Write Product Review Modal Overlay */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <form
            onSubmit={handleSubmitReview}
            className="w-full max-w-md border border-line bg-surface p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200"
          >
            <div>
              <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                Write Product Review
              </h3>
              <p className="mt-1 text-xs text-text-soft uppercase tracking-wider">
                Sharing feedback for: {selectedItemName}
              </p>
            </div>

            {/* Star Rating Select */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-[0.2em] text-text-soft font-semibold">
                Star Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 outline-none transition-colors cursor-pointer"
                  >
                    <FiStar
                      className={[
                        "text-xl",
                        star <= rating
                          ? "text-amber-500 fill-amber-500"
                          : "text-stone-300",
                      ].join(" ")}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Text */}
            <div className="space-y-2">
              <label
                htmlFor="review-feedback"
                className="block text-xs uppercase tracking-[0.2em] text-text-soft font-semibold"
              >
                Your Feedback
              </label>
              <textarea
                id="review-feedback"
                required
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="How did this product make your skin feel? Write your thoughts here..."
                className="block w-full border border-line bg-surface px-3 py-2 text-sm text-foreground placeholder-text-soft/60 outline-none transition-colors focus:border-accent resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
              <button
                type="button"
                disabled={submittingReview}
                onClick={() => setShowReviewModal(false)}
                className="border border-line bg-background px-4 py-2 text-xs uppercase tracking-wider font-semibold text-foreground hover:bg-background/80 transition-colors cursor-pointer outline-none disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="border border-accent bg-accent px-5 py-2 text-xs uppercase tracking-wider font-bold text-white hover:bg-accent-deep transition-colors cursor-pointer outline-none flex items-center gap-1.5 disabled:opacity-50"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Selected Order Detail Centered Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm overflow-y-auto">
          {/* Backdrop Closer */}
          <div
            className="absolute inset-0"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="relative z-10 w-full max-w-2xl border border-line bg-surface p-4 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-text-soft font-bold">
                  Purchase Details
                </p>
                <h3 className="text-xl font-bold text-foreground">
                  {selectedOrder.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="flex h-8 w-8 items-center justify-center border border-line bg-background text-text-soft hover:text-foreground transition-colors cursor-pointer rounded-sm outline-none"
              >
                <CgClose />
              </button>
            </div>

            {/* Stepper Status Progress Bar (Primary to White Gradient) */}
            <div className="mb-2">
              <OrderStatusTracker status={selectedOrder.status} />
            </div>

            {/* Scrollable Modal Content Grid */}
            <div className="grid gap-6 md:grid-cols-2 max-h-[75vh] sm:max-h-[70vh] overflow-y-auto pr-1">
              {/* Delivery Details */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-wider font-bold text-foreground">
                  Delivery Address
                </h4>
                <div className="border border-line bg-background p-5 text-[13px] text-text-soft font-medium leading-relaxed rounded-sm h-full flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <p className="text-foreground font-extrabold text-base tracking-tight mb-2">
                      {selectedOrder.customerName || "Valued Customer"}
                    </p>
                    <div className="space-y-2 border-t border-line/40 pt-3">
                      <p>
                        <strong className="text-foreground font-semibold">
                          Phone:
                        </strong>{" "}
                        <span className="text-foreground/80">
                          {selectedOrder.phone || "-"}
                        </span>
                      </p>
                      <p>
                        <strong className="text-foreground font-semibold">
                          Address:
                        </strong>{" "}
                        <span className="text-foreground/80">
                          {selectedOrder.address || "-"},{" "}
                          {selectedOrder.city || ""}
                        </span>
                      </p>
                      <p>
                        <strong className="text-foreground font-semibold">
                          Status:
                        </strong>{" "}
                        <span className="text-accent font-bold">
                          {selectedOrder.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-line/40 pt-3">
                    <p className="text-[11px] text-text-soft uppercase tracking-wider font-bold">
                      Date Placed:{" "}
                      <span className="text-foreground/80 normal-case font-medium">
                        {selectedOrder.date}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Combined Order Items & Billing Summary */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-wider font-bold text-foreground">
                  Order Items & Billing
                </h4>
                <div className="border border-line bg-background rounded-sm h-full flex flex-col justify-between overflow-hidden">
                  {/* Items List */}
                  <div className="divide-y divide-line">
                    {selectedOrder.items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="flex items-center gap-4 p-4"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 object-cover border border-line bg-[#f2eadf] shrink-0 rounded-sm shadow-sm"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <span
                            className="text-foreground text-[13px] font-bold block leading-snug normal-case"
                            title={item.name}
                          >
                            {item.name}
                          </span>
                          <div className="flex items-center gap-2 text-[11px] text-text-soft font-semibold uppercase tracking-wider">
                            <span>Qty {item.qty}</span>
                            <span className="h-1 w-1 bg-line rounded-full" />
                            <span className="text-accent font-bold normal-case text-xs">
                              {item.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Payment Method & Total Invoice Summary */}
                  <div className="border-t border-line bg-surface p-4 space-y-2.5 text-[10px] tracking-wider text-text-soft uppercase font-bold">
                    <div className="flex justify-between items-center">
                      <span>Payment Mode</span>
                      <span className="text-foreground font-bold">
                        {selectedOrder.paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-line/40 pt-2.5">
                      <span className="text-foreground font-bold">
                        Total Paid
                      </span>
                      <span className="text-accent text-base font-extrabold normal-case">
                        {selectedOrder.total}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Closer */}
            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-3 text-xs uppercase font-bold tracking-widest border border-line bg-background hover:bg-background/80 text-text-soft hover:text-foreground transition-colors cursor-pointer rounded-sm outline-none"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDownloadInvoice(selectedOrder);
                }}
                className="flex-1 py-3 text-xs uppercase font-bold tracking-widest border border-accent bg-accent text-white hover:bg-accent-deep transition-colors cursor-pointer rounded-sm outline-none"
              >
                Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// OrderStatusTracker component with smooth primary-to-white gradient progress line
function OrderStatusTracker({ status }: { status: string }) {
  const steps = ["Pending", "Processing", "Delivered"];
  const isCancelled = status === "Cancelled";
  const currentStep = isCancelled ? -1 : steps.indexOf(status);

  return (
    <div className="w-full py-6">
      {isCancelled ? (
        <div className="flex items-center gap-3 border border-red-200 bg-red-50 px-4 py-3 rounded-sm">
          <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-wider text-red-800">
            This order has been Cancelled.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-[16px] left-[16px] right-[24px] h-1 bg-line rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-white transition-all duration-500 ease-out"
              style={{
                width: `${currentStep === 0 ? "0%" : currentStep === 1 ? "50%" : "100%"}`,
              }}
            />
          </div>

          {/* Stepper Nodes */}
          <div className="relative flex justify-between">
            {steps.map((step, idx) => {
              const active = idx <= currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={[
                      "z-10 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300",
                      active
                        ? "border-accent bg-accent text-white shadow-md scale-105"
                        : "border-line bg-surface text-text-soft",
                    ].join(" ")}
                  >
                    {idx < currentStep ? (
                      <FiCheck className="text-sm font-bold" />
                    ) : (
                      <span className="text-[11px] font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <span
                    className={[
                      "mt-2 text-[8px] sm:text-[10px] uppercase tracking-[0.08em] sm:tracking-[0.16em] font-semibold",
                      isCurrent
                        ? "text-accent font-bold"
                        : active
                          ? "text-foreground font-bold"
                          : "text-text-soft",
                    ].join(" ")}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
