"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  FiX,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiShoppingBag,
  FiArrowRight,
} from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { Button, ButtonLink } from "@/components/ui/button";

export function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    cartCount,
  } = useCart();

  // Prevent background scrolling when cart drawer is active
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  return (
    <div
      className={`fixed inset-0 z-[100] transition-all duration-300 ease-in-out ${
        isCartOpen
          ? "opacity-100 visible"
          : "opacity-0 invisible pointer-events-none"
      }`}
    >
      {/* Dynamic Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Drawer Sliding Panel with Hardware-Accelerated Animation */}
      <div
        className={`absolute top-0 right-0 bottom-0 z-10 flex h-full w-full max-w-md flex-col border-l border-line bg-surface shadow-2xl transition-transform duration-300 ease-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <FiShoppingBag className="text-text-soft text-base" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
              Shopping Bag
            </h2>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">
              {cartCount}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-background text-text-soft transition-colors hover:text-foreground outline-none cursor-pointer"
            aria-label="Close cart"
          >
            <FiX className="text-sm" />
          </button>
        </header>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto px-6">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background border border-line text-text-soft mb-4">
                <FiShoppingBag className="text-2xl" />
              </div>
              <p className="text-xs uppercase tracking-widest font-semibold text-text-soft mb-1">
                Your bag is empty
              </p>
              <p className="text-xs text-text-soft max-w-[220px] mb-6 normal-case leading-relaxed">
                Explore our curated skincare collection to find products perfect
                for your routine.
              </p>
              <Button
                type="button"
                variant="primary"
                onClick={() => setIsCartOpen(false)}
                className="px-8"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={`${item.product.id}-${item.size.name}`}
                className="flex gap-4 py-5 border-b border-line last:border-0"
              >
                {/* Product Image Thumbnail - Clean, Borderless Rounded */}
                <div className="relative h-[90px] w-[90px] shrink-0 bg-surface-strong rounded-xl overflow-hidden transition-transform group-hover:scale-105">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-full w-full object-contain"
                  />
                </div>

                {/* Product Detail Controls */}
                <div className="flex-grow flex flex-col justify-between">
                  <div className="space-y-0.5 pr-6 relative">
                    <h3 className="text-[14px] font-semibold text-foreground truncate max-w-[200px] tracking-tight">
                      {item.product.name}
                    </h3>
                    <p className="text-[11px] tracking-wide text-text-soft">
                      {item.size.name}
                    </p>
                    <span className="text-[13px] font-bold text-accent block mt-1.5">
                      ৳ {item.size.price.toLocaleString()}
                    </span>

                    {/* Delete Item Button */}
                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(item.product.id, item.size.name)
                      }
                      className="absolute top-0 right-0 text-text-soft hover:text-red-500 transition-colors p-1 cursor-pointer outline-none"
                      aria-label="Remove item"
                    >
                      <FiTrash2 className="text-xs" />
                    </button>
                  </div>

                  {/* Quantity Controller Buttons */}
                  <div className="flex items-center justify-between mt-auto pt-3">
                    <div className="flex items-center bg-surface-strong rounded-full px-1 py-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.size.name,
                            item.quantity - 1,
                          )
                        }
                        className="flex h-6 w-6 items-center justify-center text-text-soft hover:text-foreground hover:bg-background rounded-full transition-all cursor-pointer outline-none"
                        aria-label="Decrease quantity"
                      >
                        <FiMinus className="text-[10px]" />
                      </button>
                      <span className="w-6 text-center text-xs font-medium text-foreground select-none">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.size.name,
                            item.quantity + 1,
                          )
                        }
                        className="flex h-6 w-6 items-center justify-center text-text-soft hover:text-foreground hover:bg-background rounded-full transition-all cursor-pointer outline-none"
                        aria-label="Increase quantity"
                      >
                        <FiPlus className="text-[10px]" />
                      </button>
                    </div>

                    {/* Total Item Price */}
                    <span className="text-[13px] font-semibold text-foreground/90 tracking-tight">
                      ৳ {(item.size.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer (Subtotals and Checkout Buttons) */}
        {cartItems.length > 0 && (
          <footer className="border-t border-line bg-surface px-6 py-6 space-y-5 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between">
              <span className="text-md font-semibold text-foreground">Subtotal</span>
              <span className="text-foreground text-lg font-bold tracking-tight">
                ৳ {cartSubtotal.toLocaleString()}
              </span>
            </div>
            <div className="grid gap-3 pt-1">
              <ButtonLink
                href="/checkout"
                variant="primary"
                onClick={() => setIsCartOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5"
              >
                Proceed to Checkout
                <FiArrowRight className="text-[15px] transition-transform group-hover:translate-x-1" />
              </ButtonLink>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
