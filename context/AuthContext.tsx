"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  wishlistIds?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (name: string, email: string, password: string, role?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUserSession: (userData: User) => void;
  toggleWishlist: (productId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Restore session on mount
    const savedToken = localStorage.getItem("elara_token");
    const savedUser = localStorage.getItem("elara_user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        const { token: userToken, user: userData } = data.data;
        setToken(userToken);
        setUser(userData);
        localStorage.setItem("elara_token", userToken);
        localStorage.setItem("elara_user", JSON.stringify(userData));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || "Login failed" };
    } catch (err) {
      console.error("Login request failed:", err);
      return { success: false, message: "Server connection failed" };
    }
  };

  const signup = async (name: string, email: string, password: string, role = "USER") => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${baseUrl}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();

      if (data.success) {
        const { token: userToken, user: userData } = data.data;
        setToken(userToken);
        setUser(userData);
        localStorage.setItem("elara_token", userToken);
        localStorage.setItem("elara_user", JSON.stringify(userData));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || "Signup failed" };
    } catch (err) {
      console.error("Signup request failed:", err);
      return { success: false, message: "Server connection failed" };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("elara_token");
    localStorage.removeItem("elara_user");
    router.push("/auth/signin");
  };

  const updateUserSession = (userData: User) => {
    setUser(userData);
    localStorage.setItem("elara_user", JSON.stringify(userData));
  };

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    if (!token || !user) return false;
    
    // Optimistic UI Update
    const isCurrentlyWishlisted = user.wishlistIds?.includes(productId) || false;
    const newWishlistIds = isCurrentlyWishlisted
      ? (user.wishlistIds || []).filter(id => id !== productId)
      : [...(user.wishlistIds || []), productId];

    const tempUser = { ...user, wishlistIds: newWishlistIds };
    setUser(tempUser); // Fast update

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${baseUrl}/wishlist/toggle`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ productId }),
      });
      
      const data = await res.json();
      if (data.success && data.data.wishlistIds) {
        // Confirm server truth
        const confirmedUser = { ...user, wishlistIds: data.data.wishlistIds };
        setUser(confirmedUser);
        localStorage.setItem("elara_user", JSON.stringify(confirmedUser));
        return true;
      }
      
      // Revert if failed logically
      setUser(user);
      return false;
    } catch (error) {
      console.error("Failed to toggle wishlist", error);
      // Revert on network error
      setUser(user);
      return false;
    }
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        signup,
        logout,
        updateUserSession,
        toggleWishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
