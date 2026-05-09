"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiShoppingBag,
  FiTruck,
  FiCreditCard,
} from "react-icons/fi";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { useCart } from "@/context/CartContext";
import { Button, ButtonLink } from "@/components/ui/button";

export default function CheckoutPage() {
  const { cartItems, cartSubtotal, clearCart } = useCart();

  // Form Fields State
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Inside Dhaka");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");

  // Form Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // Dynamic Shipping calculation
  const shipping = useMemo(() => {
    return city === "Inside Dhaka" ? 120 : 150;
  }, [city]);

  const total = useMemo(() => {
    return cartSubtotal + shipping;
  }, [cartSubtotal, shipping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsSubmitting(true);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("elara_token");

      // Prepare order item snapshot array
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
          customerName,
          phone,
          address,
          city,
          shipping,
          total,
          paymentMethod,
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
      console.error("Checkout order placement failed:", err);
      alert("A network error occurred while placing your order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order was successfully placed, render a premium receipt page
  if (placedOrder) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex-grow max-w-2xl w-full mx-auto px-5 py-20 flex flex-col items-center justify-center text-center space-y-6">
          <FiCheckCircle className="text-6xl text-emerald-500 animate-bounce" />
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
              Thank you! Your order is placed.
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] text-accent font-bold">
              Order Reference ID: {placedOrder.id}
            </p>
            <p className="text-xs text-text-soft normal-case max-w-md mx-auto">
              We have received your order successfully. Our fulfillment team is
              preparing your package. You will receive a phone call shortly to
              confirm delivery!
            </p>
          </div>

          <div className="border border-line bg-surface p-5 w-full text-left space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground border-b border-line pb-2">
              Delivery Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-text-soft">
                  Recipient Name
                </span>
                <span className="font-semibold text-foreground">
                  {placedOrder.customerName}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-text-soft">
                  Phone Number
                </span>
                <span className="font-semibold text-foreground">
                  {placedOrder.phone}
                </span>
              </div>
              <div className="col-span-2">
                <span className="block text-[10px] uppercase tracking-wider text-text-soft">
                  Delivery Address
                </span>
                <span className="font-semibold text-foreground">
                  {placedOrder.address}, {placedOrder.city}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-text-soft">
                  Payment Method
                </span>
                <span className="font-semibold text-foreground">
                  {placedOrder.paymentMethod}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-text-soft">
                  Total Paid Amount
                </span>
                <span className="font-bold text-accent text-sm">
                  ৳ {placedOrder.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-4">
            <ButtonLink href="/orders" variant="primary">
              View Order History
            </ButtonLink>
            <ButtonLink href="/" variant="outline">
              Continue Shopping
            </ButtonLink>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-x-hidden">
      {/* Top Hanging Leaves Background */}
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

        <main className="flex-grow max-w-6xl w-full mx-auto px-5 py-12 sm:px-8 lg:px-10">
          <header className="mb-10 relative flex items-center justify-center min-h-[40px]">
            <Link
              href="/"
              className="absolute left-0 text-[11px] uppercase tracking-widest font-bold text-text-soft hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <FiArrowLeft className="text-[12px]" />
              Back to products
            </Link>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl text-center">
              Checkout
            </h1>
          </header>

          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-surface border border-line/50 rounded-2xl">
              <FiShoppingBag className="text-4xl text-text-soft mb-4 opacity-50" />
              <p className="text-sm text-text-soft mb-6">
                Your shopping bag is empty.
              </p>
              <ButtonLink href="/" variant="primary" className="px-8">
                Explore Products
              </ButtonLink>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              {/* Delivery Information Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <section className="bg-surface border border-line/50 rounded-2xl p-7 space-y-6">
                  <h3 className="text-sm font-semibold text-foreground">
                    Delivery Details
                  </h3>

                  <label className="block text-sm">
                    <span className="mb-2 block text-[10px] uppercase tracking-wider text-text-soft font-bold">
                      Recipient Full Name
                    </span>
                    <input
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Tasnim Rahman"
                      className="w-full border border-line bg-background rounded-lg px-4 py-3.5 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="mb-2 block text-[10px] uppercase tracking-wider text-text-soft font-bold">
                      Contact Phone Number
                    </span>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full border border-line bg-background rounded-lg px-4 py-3.5 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="mb-2 block text-[10px] uppercase tracking-wider text-text-soft font-bold">
                      Full Delivery Address
                    </span>
                    <textarea
                      required
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House, Road, Sector, Area"
                      className="w-full border border-line bg-background rounded-lg px-4 py-3.5 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none transition-all"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="mb-2 block text-[10px] uppercase tracking-wider text-text-soft font-bold">
                      Delivery Region / Zone
                    </span>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full border border-line bg-background rounded-lg px-4 py-3.5 text-sm text-foreground outline-none focus:border-accent cursor-pointer transition-all"
                    >
                      <option value="Inside Dhaka">
                        Inside Dhaka (৳ 120 Delivery Charge)
                      </option>
                      <option value="Outside Dhaka">
                        Outside Dhaka (৳ 150 Delivery Charge)
                      </option>
                    </select>
                  </label>
                </section>

                {/* Payment details */}
                <section className="bg-surface border border-line/50 rounded-2xl p-7 space-y-6">
                  <h3 className="text-sm font-semibold text-foreground">
                    Payment Method
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label
                      className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-all ${
                        paymentMethod === "Cash on Delivery"
                          ? "border-accent bg-accent/5 text-foreground"
                          : "border-line bg-background hover:bg-surface-strong"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value="Cash on Delivery"
                        checked={paymentMethod === "Cash on Delivery"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="accent-accent cursor-pointer"
                      />
                      <div>
                        <span className="text-sm font-medium block">
                          Cash on Delivery
                        </span>
                      </div>
                    </label>
                  </div>
                </section>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl shadow-md"
                >
                  {isSubmitting ? "Placing Order..." : "Confirm Order"}
                </Button>
              </form>

              {/* Cart Preview Invoice Summary column */}
              <aside className="bg-surface border border-line/50 rounded-2xl p-6 h-fit space-y-6">
                <h3 className="text-md font-semibold text-foreground">
                  Order Summary
                </h3>

                <div className="divide-y divide-line/40 max-h-[280px] overflow-y-auto">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.product.id}-${item.size.name}`}
                      className="flex gap-3 py-3"
                    >
                      <div className="h-14 w-14 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="truncate flex-grow flex flex-col justify-center">
                        <span className="text-sm font-medium text-foreground block truncate">
                          {item.product.name}
                        </span>
                        <span className="text-sm text-text-soft block mt-0.5">
                          {item.size.name} • Qty {item.quantity}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-foreground shrink-0">
                        ৳ {(item.size.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-line pt-4 space-y-2 text-xs font-semibold text-text-soft">
                  <div className="flex items-center justify-between">
                    <span>Cart Subtotal</span>
                    <span className="text-foreground">
                      ৳ {cartSubtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FiTruck /> Delivery Charge
                    </span>
                    <span className="text-foreground">৳ {shipping}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-line pt-5">
                    <span className="text-sm font-semibold text-foreground">
                      Total
                    </span>
                    <span className="text-accent text-xl font-bold tracking-tight">
                      ৳ {total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
