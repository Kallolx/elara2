"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiShoppingBag,
  FiTruck,
  FiCreditCard,
  FiX,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMapPin,
  FiChevronDown,
  FiLock,
  FiTag,
  FiAlertCircle,
} from "react-icons/fi";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button, ButtonLink } from "@/components/ui/button";

// Address Item interface
type SavedAddress = {
  id: string;
  type: "Home" | "Office" | "Others";
  name: string;
  phone: string;
  street: string;
  division: string;
  city: string;
  area: string;
  isDefault: boolean;
};

export default function CheckoutPage() {
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // ---- Addresses Flow States ----
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // New Address Form States
  const [addrType, setAddrType] = useState<SavedAddress["type"]>("Home");
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrDivision, setAddrDivision] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrArea, setAddrArea] = useState("");
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  // Main Checkout Interaction States
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod"); // 'cod', 'ssl', 'bkash'
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  // Coupon States
  const [couponInput, setCouponInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Final Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // Auto-fill name from auth
  useEffect(() => {
    if (user && addrName === "") {
      setAddrName(user.name || "");
      setAddrPhone(user.phone || "");
    }
  }, [user]);

  // ---- CALCULATIONS ----
  const selectedAddr = useMemo(
    () => savedAddresses.find((a) => a.id === selectedAddressId),
    [savedAddresses, selectedAddressId],
  );

  const totalSavings = useMemo(() => {
    const pN = (v: any) => parseFloat(String(v || "0").replace(/[^0-9.]/g, "")) || 0;
    return cartItems.reduce((acc, item) => {
      const cp = pN(item.size.price);
      const op = pN(item.size.oldPrice);
      const discount = (op > cp) ? (op - cp) * item.quantity : 0;
      return acc + discount;
    }, 0);
  }, [cartItems]);

  const tax = useMemo(() => 0, []);

  const shipping = useMemo(() => {
    if (!selectedAddr) return 0;
    return selectedAddr.division.toLowerCase().includes("dhaka") ? 60 : 120;
  }, [selectedAddr]);

  const finalTotal = useMemo(() => {
    const base = cartSubtotal + shipping + tax - appliedDiscount;
    return base < 0 ? 0 : base;
  }, [cartSubtotal, shipping, tax, appliedDiscount]);

  // ---- HANDLERS ----
  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddr: SavedAddress = {
      id: `addr_${Date.now()}`,
      type: addrType,
      name: addrName,
      phone: addrPhone,
      street: addrStreet,
      division: addrDivision,
      city: addrCity,
      area: addrArea,
      isDefault: addrIsDefault,
    };
    setSavedAddresses((prev) => [...prev, newAddr]);
    setSelectedAddressId(newAddr.id);

    // Clear inputs and close
    setIsAddressModalOpen(false);
    setAddrStreet("");
    setAddrDivision("");
    setAddrCity("");
    setAddrArea("");
  };

  const handleDeleteAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
    if (selectedAddressId === id) setSelectedAddressId(null);
  };

  const applyCoupon = () => {
    if (couponInput.toLowerCase() === "welcome10") {
      setAppliedDiscount(Math.floor(cartSubtotal * 0.1));
      alert("Coupon applied successfully!");
    } else {
      alert("Invalid coupon code.");
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddr) {
      alert("Please select or add a shipping address.");
      return;
    }
    if (!isTermsAccepted) {
      alert("Please accept the terms and conditions.");
      return;
    }
    if (cartItems.length === 0) return;

    setIsSubmitting(true);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("elara_token")
          : null;

      const mappedItems = cartItems.map((item) => ({
        id: item.product.id,
        sku: item.product.sku,
        name: item.product.name,
        size: item.size.name,
        price: item.size.price,
        quantity: item.quantity,
        image: item.product.image,
      }));

      const res = await fetch(`${baseUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          customerName: selectedAddr.name,
          phone: selectedAddr.phone,
          address: `${selectedAddr.street}, ${selectedAddr.area}, ${selectedAddr.city}, ${selectedAddr.division}`,
          city: selectedAddr.city,
          shipping,
          total: finalTotal,
          paymentMethod:
            paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod,
          notes: orderNotes,
          items: mappedItems,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setPlacedOrder(json.data);
        clearCart();
      } else {
        alert(json.message || "Failed to place order.");
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      alert("A network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-x-hidden">
      {/* RESTORE Top Hanging Leaves Background Component requested by User Aesthetics */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none select-none opacity-20 z-0">
        <Image
          src="/bg-2.png"
          alt="Hanging leaves background"
          width={1920}
          height={1080}
          className="w-full h-auto"
          priority
          unoptimized
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <SiteHeader />

        <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-10 sm:px-6 lg:px-8">
          {/* Page Breadcrumb Back */}
          <div className="mb-8 flex items-center relative">
            <Link
              href="/shop"
              className="absolute left-0 inline-flex items-center gap-2 text-sm font-medium text-text-soft hover:text-accent transition-colors"
            >
              <FiArrowLeft className="text-base" />
              Back to Shop
            </Link>
            <div className="w-full flex justify-center">
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Checkout
              </h1>
            </div>
          </div>

          {cartItems.length === 0 && !placedOrder ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-surface border border-line rounded-2xl">
              <FiShoppingBag className="text-5xl text-text-soft/40 mb-5" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Your bag is empty
              </h2>
              <p className="text-text-soft mb-8">
                Looks like you haven't added anything to your bag yet.
              </p>
              <ButtonLink
                href="/shop"
                variant="primary"
                className="px-10 py-3 rounded-full"
              >
                Continue Shopping
              </ButtonLink>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
              {/* Main Form Sections Column */}
              <div className="space-y-8">
                {/* 1 & 2 combined. SHIPPING & PAYMENT BLOCK */}
                <section className="bg-surface border border-line/60 rounded-2xl overflow-hidden">
                  {/* Shipping Component Wrapper */}
                  <div className="p-6 sm:p-8 border-b border-line/60">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                        Shipping Address
                      </h2>
                      <Button
                        onClick={() => setIsAddressModalOpen(true)}
                        className="flex items-center gap-2 "
                      >
                        <FiPlus className="text-base" />
                        Add New Address
                      </Button>
                    </div>

                    {savedAddresses.length === 0 ? (
                      <div className="bg-surface-strong/40 border border-line rounded-xl p-8 flex flex-col items-center text-center">
                        <div className="mb-2 relative w-24 h-24">
                          <img
                            src="/empty-address.png"
                            alt="Map Placeholder"
                            className="w-full h-full object-contain opacity-90"
                          />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-1">
                          No Address Added Yet
                        </h3>
                        <p className="text-sm text-text-soft">
                          Add an address to get your order delivered.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {savedAddresses.map((addr) => {
                          const isSelected = selectedAddressId === addr.id;
                          return (
                            <div
                              key={addr.id}
                              onClick={() => setSelectedAddressId(addr.id)}
                              className={`relative cursor-pointer flex items-start gap-4 p-5 rounded-xl border transition-all duration-200 group ${
                                isSelected
                                  ? "bg-accent/5 border-accent"
                                  : "bg-surface border-line hover:border-text-soft/30"
                              }`}
                            >
                              <div className="mt-1 shrink-0">
                                <div
                                  className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-accent" : "border-line"}`}
                                >
                                  {isSelected && (
                                    <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                                  )}
                                </div>
                              </div>

                              <div className="flex-grow">
                                <h4 className="font-semibold text-foreground text-base leading-tight">
                                  {addr.name}{" "}
                                  <span className="font-normal text-text-soft text-sm">
                                    ({addr.type})
                                  </span>
                                </h4>
                                <p className="mt-1.5 text-sm font-medium text-text-soft">
                                  {addr.phone}
                                </p>
                                <p className="mt-1 text-sm text-text-soft/80 leading-relaxed">
                                  {addr.street}, {addr.area}, {addr.city},{" "}
                                  {addr.division}
                                </p>
                              </div>

                              <div className="flex items-center gap-3 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button className="text-text-soft hover:text-accent p-1.5 transition-colors">
                                  <FiEdit2 className="text-base" />
                                </button>
                                <button
                                  onClick={(e) =>
                                    handleDeleteAddress(addr.id, e)
                                  }
                                  className="text-text-soft hover:text-red-500 p-1.5 transition-colors"
                                >
                                  <FiTrash2 className="text-base" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Payment Component Wrapper */}
                  <div className="p-6 sm:p-8 bg-surface-strong/10">
                    <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-6">
                      Choose Payment
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <label
                        className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          paymentMethod === "cod"
                            ? "border-accent bg-accent/5"
                            : "border-line bg-background hover:bg-surface-strong"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={() => setPaymentMethod("cod")}
                          className="absolute top-4 right-4 accent-accent h-4 w-4"
                        />
                        <FiTruck className="text-3xl text-foreground mb-3" />
                        <span className="font-bold text-sm text-foreground">
                          Cash on Delivery
                        </span>
                      </label>

                      <div className="relative flex flex-col items-center justify-center p-6 rounded-xl border-2 border-line bg-surface-strong opacity-60 select-none cursor-not-allowed">
                        <div className="absolute inset-0 flex items-center justify-center bg-transparent group">
                          <FiLock className="text-text-soft/40 text-xl absolute top-4 right-4" />
                        </div>
                        <div className="h-8 w-20 bg-line rounded-md mb-3 flex items-center justify-center text-[10px] font-black text-text-soft/60 tracking-tight">
                          SSLCommerz
                        </div>
                        <span className="font-bold text-sm text-text-soft">
                          Card / Mobile Banking
                        </span>
                      </div>

                      <div className="relative flex flex-col items-center justify-center p-6 rounded-xl border-2 border-line bg-surface-strong opacity-60 select-none cursor-not-allowed">
                        <FiLock className="text-text-soft/40 text-xl absolute top-4 right-4" />
                        <div className="h-8 w-14 bg-[#E2136E]/10 rounded-md mb-3 flex items-center justify-center font-bold text-[#E2136E]">
                          bKash
                        </div>
                        <span className="font-bold text-sm text-text-soft">
                          Direct Pay
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 3. ADDITIONAL NOTES SECTION */}
                <section className="bg-surface border border-line/60 rounded-2xl p-6 sm:p-8">
                  <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                    Additional Notes (Optional)
                  </h2>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Order instructions, delivery notes, landmark, etc."
                    className="w-full bg-background border border-line rounded-xl px-4 py-4 text-sm text-foreground placeholder-text-soft/60 focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none resize-none h-28 transition-all"
                  />
                </section>
              </div>

              {/* RIGHT SIDEBAR - ORDER SUMMARY */}
              <aside className="space-y-6 lg:sticky lg:top-24 self-start">
                <div className="bg-surface border border-line/60 rounded-2xl p-6 space-y-6">
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Order Summary
                  </h3>

                  {/* Mini Product Previews */}
                  <div className="divide-y divide-line/50 max-h-[220px] overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                    {cartItems.map((item) => (
                      <div
                        key={`${item.product.id}-${item.size.name}`}
                        className="flex gap-4 py-4 first:pt-0"
                      >
                        <div className="h-16 w-16 rounded-lg bg-surface-strong border border-line overflow-hidden shrink-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-grow flex flex-col justify-center min-w-0">
                          <p className="font-bold text-sm text-foreground line-clamp-1">
                            {item.product.name}
                          </p>
                          
                          {/* Enhanced Savings/Qty Block requested by User */}
                          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1 text-xs">
                            <span className="text-text-soft whitespace-nowrap font-medium">
                              {item.quantity} x
                            </span>
                            
                            <span className="text-foreground font-semibold whitespace-nowrap">
                              ৳{(parseFloat(String(item.size.price || "0").replace(/[^0-9.]/g, "")) || 0).toLocaleString()}
                            </span>
                            
                            {(() => {
                              const parseN = (v: any) => parseFloat(String(v || "0").replace(/[^0-9.]/g, "")) || 0;
                              const pPrice = parseN(item.size.price);
                              const oPrice = parseN(item.size.oldPrice);
                              if (oPrice > pPrice) {
                                return (
                                  <>
                                    <span className="text-text-soft/60 line-through whitespace-nowrap decoration-red-400/50">
                                      ৳{oPrice.toLocaleString()}
                                    </span>
                                    <span className="bg-green-500/10 text-green-600 px-1.5 py-1 rounded text-[10px] font-medium leading-none flex items-center">
                                      Saved ৳{Math.round(oPrice - pPrice).toLocaleString()}
                                    </span>
                                  </>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-center shrink-0 pl-2">
                          <span className="font-bold text-sm text-foreground">
                            ৳{((parseFloat(String(item.size.price || "0").replace(/[^0-9.]/g, "")) || 0) * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dynamic Coupon Input */}
                  <div>
                    <div className="flex items-center border border-line rounded-lg bg-background overflow-hidden focus-within:border-accent transition-colors">
                      <div className="pl-3 text-text-soft">
                        <FiTag className="text-sm" />
                      </div>
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Enter Coupon Code"
                        className="flex-grow bg-transparent text-sm py-3 px-3 outline-none placeholder-text-soft/50"
                      />
                      <button
                        onClick={applyCoupon}
                        className="bg-accent hover:opacity-90 text-white text-xs font-bold px-4 ml-2 h-full transition-colors rounded-full py-2 cursor-pointer mr-2"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Invoice Lines */}
                  <div className="space-y-3 pt-2 text-sm font-medium">
                    <div className="flex items-center justify-between text-text-soft">
                      <span>Subtotal</span>
                      <span className="text-foreground">
                        ৳{cartSubtotal.toLocaleString()}.00
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-text-soft">
                      <span>Tax / VAT</span>
                      <span className="text-foreground">৳{tax}.00</span>
                    </div>

                    <div className="flex items-center justify-between text-text-soft">
                      <span>Delivery Fee</span>
                      <span
                        className={
                          shipping > 0
                            ? "text-foreground"
                            : "text-text-soft/60 text-xs italic"
                        }
                      >
                        {shipping > 0 ? `৳${shipping}.00` : "Add Address First"}
                      </span>
                    </div>

                    {appliedDiscount > 0 && (
                      <div className="flex items-center justify-between text-accent font-bold">
                        <span>Coupon Discount</span>
                        <span>-৳{appliedDiscount.toLocaleString()}.00</span>
                      </div>
                    )}

                    {/* TOTAL SAVINGS LIST ITEM */}
                    {totalSavings > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-text-soft">Savings for This Order</span>
                        <span className="font-semibold text-green-500">৳{totalSavings.toLocaleString()}.00</span>
                      </div>
                    )}

                    <div className="pt-4 border-t border-line flex items-center justify-between">
                      <span className="text-lg font-semibold text-foreground/70">
                        Total
                      </span>
                      <span className="text-2xl font-semibold text-foreground">
                        ৳{finalTotal.toLocaleString()}.00
                      </span>
                    </div>
                  </div>

                  {/* TERMS & CONDITIONS CHECKBOX */}
                  <label className="flex items-start gap-2.5 pt-2 cursor-pointer group select-none">
                    <input
                      type="checkbox"
                      checked={isTermsAccepted}
                      onChange={(e) => setIsTermsAccepted(e.target.checked)}
                      className="h-4 w-4 rounded border-line text-accent focus:ring-accent cursor-pointer"
                    />
                    <span className="text-xs leading-relaxed text-text-soft/70 font-medium group-hover:text-foreground transition-colors">
                      I have read and agree to the website's{" "}
                      <Link
                        href="/terms"
                        className="text-foreground underline font-normal"
                      >
                        terms and conditions
                      </Link>
                      .
                    </span>
                  </label>

                  {/* MAIN SUBMIT ACTION */}
                  {!isAuthenticated ? (
                    <ButtonLink
                      href="/auth/signin?redirect=/checkout"
                      className="w-full py-4 font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 bg-accent text-white hover:bg-black shadow-black/5"
                    >
                      <FiLock className="text-base shrink-0" />
                      Login to Complete Order
                    </ButtonLink>
                  ) : (
                    <Button
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting || !selectedAddressId}
                      className={`w-full py-4 font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 ${
                        !selectedAddressId
                          ? "bg-accent/50 text-text-soft cursor-not-allowed"
                          : "bg-accent text-white hover:bg-black shadow-black/5"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        <>Confirm Order</>
                      )}
                    </Button>
                  )}

                  {isAuthenticated && !selectedAddressId && (
                    <p className="text-[11px] text-center text-red-500 font-semibold flex items-center justify-center gap-1 mt-1">
                      <FiAlertCircle /> Please select an address above
                    </p>
                  )}
                </div>
              </aside>
            </div>
          )}
        </main>

        <SiteFooter />
      </div>

      {/* --- ADD ADDRESS MODAL OVERLAY --- */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 py-10 sm:py-0">
            {/* Dynamic Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Container Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl bg-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-line">
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  Delivery Address
                </h2>
                <button
                  onClick={() => setIsAddressModalOpen(false)}
                  className="text-text-soft hover:text-foreground p-2 rounded-full transition-colors hover:bg-surface-strong"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>

              {/* Modal Form Scrollable Body */}
              <form
                onSubmit={handleSaveNewAddress}
                className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
              >
                {/* Type Select (Home, Office, Others) */}
                <div className="flex items-center gap-6 pb-2">
                  {(["Home", "Office", "Others"] as const).map((t) => (
                    <label
                      key={t}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <div className="relative h-5 w-5">
                        <input
                          type="radio"
                          name="addrType"
                          value={t}
                          checked={addrType === t}
                          onChange={() => setAddrType(t)}
                          className="peer sr-only"
                        />
                        <div className="absolute inset-0 rounded-full border-2 border-line transition-colors peer-checked:border-accent" />
                        <div className="absolute inset-0 flex items-center justify-center scale-0 peer-checked:scale-100 transition-transform">
                          <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                        </div>
                      </div>
                      <span className="font-medium text-foreground group-hover:text-accent transition-colors">
                        {t}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Row: Name and Phone */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-text-soft">
                      Name
                    </label>
                    <input
                      required
                      type="text"
                      value={addrName}
                      onChange={(e) => setAddrName(e.target.value)}
                      placeholder="Enter Your Name"
                      className="w-full bg-background border border-line rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-text-soft/40 outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-text-soft">
                      Phone Number
                    </label>
                    <input
                      required
                      type="tel"
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                      placeholder="01780658***"
                      className="w-full bg-background border border-line rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-text-soft/40 outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>

                {/* Address Full Textarea */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-text-soft">
                    Address
                  </label>
                  <input
                    required
                    type="text"
                    value={addrStreet}
                    onChange={(e) => setAddrStreet(e.target.value)}
                    placeholder="Street, house no, block, etc."
                    className="w-full bg-background border border-line rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-text-soft/40 outline-none focus:border-accent transition-colors"
                  />
                </div>

                {/* Grid: State/Division & City */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-text-soft">
                      State/Division
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={addrDivision}
                        onChange={(e) => setAddrDivision(e.target.value)}
                        className="w-full appearance-none bg-background border border-line rounded-lg px-4 py-3 text-sm text-foreground outline-none focus:border-accent cursor-pointer transition-colors"
                      >
                        <option value="" disabled>
                          Select Division
                        </option>
                        <option value="Dhaka">Dhaka</option>
                        <option value="Chittagong">Chittagong</option>
                        <option value="Sylhet">Sylhet</option>
                        <option value="Khulna">Khulna</option>
                        <option value="Rajshahi">Rajshahi</option>
                        <option value="Barishal">Barishal</option>
                        <option value="Rangpur">Rangpur</option>
                        <option value="Mymensingh">Mymensingh</option>
                      </select>
                      <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text-soft pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-text-soft">
                      City
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        className="w-full appearance-none bg-surface-strong/40 border border-line rounded-lg px-4 py-3 text-sm text-foreground outline-none focus:border-accent cursor-pointer transition-colors"
                      >
                        <option value="" disabled>
                          Select city
                        </option>
                        {addrDivision === "Dhaka" ? (
                          <>
                            <option value="Dhaka City">Dhaka City</option>
                            <option value="Gazipur">Gazipur</option>
                            <option value="Narayanganj">Narayanganj</option>
                          </>
                        ) : (
                          <option value="Generic City">
                            Select Division First
                          </option>
                        )}
                      </select>
                      <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text-soft pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Area Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-text-soft">
                    Area
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={addrArea}
                      onChange={(e) => setAddrArea(e.target.value)}
                      className="w-full appearance-none bg-surface-strong/40 border border-line rounded-lg px-4 py-3 text-sm text-foreground outline-none focus:border-accent cursor-pointer transition-colors"
                    >
                      <option value="" disabled>
                        Select area
                      </option>
                      <option value="Mirpur">Mirpur</option>
                      <option value="Uttara">Uttara</option>
                      <option value="Dhanmondi">Dhanmondi</option>
                      <option value="Gulshan">Gulshan</option>
                      <option value="Banani">Banani</option>
                      <option value="Others">Others</option>
                    </select>
                    <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text-soft pointer-events-none" />
                  </div>
                </div>

                {/* Checkbox Default */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={addrIsDefault}
                    onChange={(e) => setAddrIsDefault(e.target.checked)}
                    className="h-5 w-5 rounded border-line text-foreground focus:ring-accent"
                  />
                  <span className="text-sm font-medium text-text-soft">
                    Save as Default Address
                  </span>
                </label>

                {/* Save Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full font-semibold text-lg"
                  >
                    Save the Address
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUCCESS ORDER MODAL (UNCHANGED FUNCTIONAL) */}
      <AnimatePresence>
        {placedOrder && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPlacedOrder(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-[4px] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-surface border border-line shadow-2xl w-full max-w-sm overflow-hidden p-8 rounded-2xl flex flex-col items-center text-center"
            >
              <button
                onClick={() => setPlacedOrder(null)}
                className="absolute top-4 right-4 text-text-soft hover:text-foreground"
              >
                <FiX className="text-lg" />
              </button>
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-5">
                <FiCheckCircle className="text-4xl text-emerald-500" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground leading-tight mb-2">
                Order Successful
              </h3>
              <p className="text-xs text-text-soft mb-6">
                Your order has been received successfully!
              </p>
              <ButtonLink
                href="/"
                variant="primary"
                className="w-full py-3.5 rounded-xl"
                onClick={() => setPlacedOrder(null)}
              >
                Back to Home
              </ButtonLink>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
