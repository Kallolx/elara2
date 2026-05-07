"use client";

import { useState } from "react";
import { FiShoppingBag, FiCheck, FiStar, FiMessageSquare, FiRefreshCw, FiDownload } from "react-icons/fi";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

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
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=120",
      },
      {
        id: "2",
        name: "Sun Veil SPF Mini",
        code: "SK-VEIL-01",
        price: "৳ 720",
        qty: 1,
        image: "https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&q=80&w=120",
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
        image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=120",
      },
    ],
  },
];

export default function MyOrdersPage() {
  const [orders] = useState<Order[]>(mockOrders);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Review modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleReorder = (order: Order) => {
    const itemNames = order.items.map((i) => i.name).join(" and ");
    triggerToast(`Successfully added ${itemNames} back into your skincare bag!`);
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
${order.items.map(item => `- ${item.name} (${item.code})\n  Qty: ${item.qty} | Price: ${item.price}`).join("\n\n")}
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
      triggerToast(`Thank you! Your 5-star review for "${selectedItemName}" has been submitted successfully.`);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-5 z-50 flex items-center gap-2.5 border border-emerald-200 bg-emerald-50/90 backdrop-blur-sm px-5 py-3.5 shadow-lg animate-in slide-in-from-top-4 duration-300 rounded-sm">
          <FiCheck className="text-emerald-600 text-base shrink-0" />
          <p className="text-xs uppercase tracking-wider font-semibold text-emerald-800">{toastMessage}</p>
        </div>
      )}

      <main className="flex-grow max-w-6xl w-full mx-auto px-5 py-12 sm:px-8 lg:px-10 space-y-8">
        <header className="border-b border-line pb-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-text-soft font-semibold flex items-center gap-2">
            <FiShoppingBag />
            Customer Account
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            My Orders
          </h1>
          <p className="mt-1.5 text-xs text-text-soft">
            Review your purchase history and instantly download system tax invoices.
          </p>
        </header>

        {/* Clean, Minimalist E-Commerce Data Table */}
        <div className="border border-line bg-surface overflow-x-auto shadow-sm">
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
                <tr key={order.id} className="hover:bg-background/10 transition-colors">
                  {/* Order ID */}
                  <td className="px-6 py-4 font-bold text-foreground text-[13px]">{order.id}</td>
                  
                  {/* Date */}
                  <td className="px-6 py-4">{order.date}</td>
                  
                  {/* Total */}
                  <td className="px-6 py-4 font-bold text-accent text-[13px]">{order.total}</td>
                  
                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-bold">
                      {order.status}
                    </span>
                  </td>

                  {/* Products Column */}
                  <td className="px-6 py-4 normal-case font-normal">
                    <div className="flex flex-col gap-2.5 max-w-xs">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-7 w-7 object-cover border border-line bg-[#f2eadf] shrink-0"
                          />
                          <div className="truncate">
                            <span className="text-foreground text-[11px] font-bold block">{item.name}</span>
                            <span className="text-[10px] text-text-soft uppercase tracking-wider block font-semibold">{item.code} • Qty {item.qty}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Download Invoice Column */}
                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(order)}
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
                        onClick={() => handleReorder(order)}
                        className="text-[10px] font-bold text-text-soft hover:text-foreground tracking-widest transition-colors cursor-pointer outline-none uppercase"
                      >
                        Reorder
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenReview(order.items[0].name)}
                        className="text-[10px] font-bold text-accent hover:text-accent-deep tracking-widest transition-colors cursor-pointer outline-none uppercase"
                      >
                        Review
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <SiteFooter />

      {/* Write Product Review Modal Overlay */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <form onSubmit={handleSubmitReview} className="w-full max-w-md border border-line bg-surface p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
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
                        star <= rating ? "text-amber-500 fill-amber-500" : "text-stone-300"
                      ].join(" ")}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Text */}
            <div className="space-y-2">
              <label htmlFor="review-feedback" className="block text-xs uppercase tracking-[0.2em] text-text-soft font-semibold">
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
    </div>
  );
}
