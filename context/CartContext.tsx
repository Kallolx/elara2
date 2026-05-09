"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  product: {
    id: string;
    sku: string;
    name: string;
    image: string;
  };
  size: {
    name: string;
    price: number;
  };
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  addToCart: (product: any, size: { name: string; price: number }, quantity?: number) => void;
  removeFromCart: (productId: string, sizeName: string) => void;
  updateQuantity: (productId: string, sizeName: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount (SSR safe)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("elara-cart");
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage:", e);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("elara-cart", JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart to localStorage:", e);
    }
  }, [cartItems, isInitialized]);

  const addToCart = (product: any, size: { name: string; price: number }, quantity = 1) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.size.name === size.name,
      );

      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }

      const newItem: CartItem = {
        product: {
          id: product.id,
          sku: product.sku || "",
          name: product.name,
          image: product.image || "/products/cleanser.png",
        },
        size: {
          name: size.name,
          price: size.price,
        },
        quantity,
      };

      return [newItem, ...prev];
    });

    // Auto open cart drawer for premium responsive feedback
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, sizeName: string) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.size.name === sizeName)),
    );
  };

  const updateQuantity = (productId: string, sizeName: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, sizeName);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.size.name === sizeName
          ? { ...item, quantity }
          : item,
      ),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.size.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
