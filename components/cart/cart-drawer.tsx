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
      {/* Cart Drawer Sliding Panel with Hardware-Accelerated Animation */}
      <div
        className={`absolute top-0 right-0 bottom-0 z-10 flex h-full w-full max-w-md flex-col border-l border-line bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <header className="flex items-center justify-between px-5 py-4 bg-white">
          <div className="flex items-center gap-2">
            <img src="/nav/cart.svg" alt="" className="w-5 h-5 opacity-70" />
            <h2 className="text-lg font-semibold  text-foreground">
              Shopping Bag
            </h2>
            <span className="flex items-center justify-center text-lg font-semibold text-accent">
              ({cartCount})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-text-soft transition-colors hover:text-foreground outline-none cursor-pointer"
            aria-label="Close cart"
          >
            <FiX className="text-sm" />
          </button>
        </header>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-20 px-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background border border-line text-text-soft mb-4">
                <img src="/nav/cart.svg" alt="" className="w-8 h-8 opacity-40" />
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
                className="flex items-stretch border-b border-line last:border-b-0 group bg-white"
              >
                {/* Product Image - Bigger, No Padding, Fills full vertical height of row */}
                <div className="relative w-[120px] sm:w-[140px] shrink-0 bg-surface-strong overflow-hidden">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Product Detail Controls - Balanced Height */}
                <div className="flex-grow flex flex-col justify-center p-4 sm:p-5 space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground max-w-[250px] leading-tight tracking-tight">
                      {item.product.name}
                    </h3>
                  </div>

                  {/* Quantity + Price Row with Box Configuration */}
                  <div className="flex items-center gap-2.5 pt-1">
                    {/* Main Controller Box */}
                    <div className="flex items-center border border-line rounded-md bg-background overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.size.name,
                            item.quantity - 1,
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center bg-white text-text-soft hover:text-foreground border-r border-line transition-colors"
                        aria-label="Decrease"
                      >
                        <FiMinus className="text-xs" />
                      </button>
                      <span className="min-w-[28px] text-center text-xs font-bold text-foreground select-none">
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
                        className="flex h-8 w-8 items-center justify-center bg-white text-text-soft hover:text-foreground border-l border-line transition-colors"
                        aria-label="Increase"
                      >
                        <FiPlus className="text-xs" />
                      </button>
                    </div>

                    {/* Inline Multiplier and Rate */}
                    <span className="text-text-soft text-xs font-medium">
                      x
                    </span>
                    <span className="text-md font-semibold text-foreground tracking-tight">
                      ৳ {item.size.price.toLocaleString()}
                    </span>

                    {/* Far Right Delete Icon */}
                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(item.product.id, item.size.name)
                      }
                      className="group ml-auto flex h-8 w-8 items-center justify-center rounded-full text-text-soft/60 hover:text-red-500 hover:bg-red-50 transition-all"
                      aria-label="Delete item"
                    >
                      <img
                        src="/nav/trash.svg"
                        alt="Delete"
                        className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity"
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer (Subtotals and Checkout Buttons) */}
        {cartItems.length > 0 && (
          <footer className="border-t border-line bg-white px-6 py-6 space-y-5 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between">
              <span className="text-md font-medium text-text-soft/70">
                Subtotal
              </span>
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
