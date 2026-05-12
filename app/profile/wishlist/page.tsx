"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiHeart, FiArrowLeft } from "react-icons/fi";
import { LogoLoader } from "@/components/ui/logo-loader";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { ProductCard } from "@/components/landing/product-card";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";

export default function MyWishlistPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (!token && !user) return; // Wait for auth context to load

    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const savedToken = token || localStorage.getItem("elara_token");

        if (!savedToken) {
          router.push("/auth/signin");
          return;
        }

        const res = await fetch(`${baseUrl}/wishlist`, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });
        const data = await res.json();

        if (data.success) {
          setWishlistProducts(data.data);
        } else {
          setErrorText(data.message || "Failed to load wishlist.");
        }
      } catch (err) {
        setErrorText("Could not connect to backend server.");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user, token, router]);

  // Handle optimistic UI removals from wishlist page
  const handleWishlistUpdate = () => {
    // We could re-fetch, but since the global context updates instantly,
    // let's just listen to user.wishlistIds to filter out removed ones dynamically.
    // Better yet, let the AuthContext sync handle it, and we just filter our local state
    // against user.wishlistIds on render.
  };

  if (!user && loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex-grow flex flex-col items-center justify-center space-y-4">
          <LogoLoader size="md" />
          <p className="text-sm text-text-soft uppercase tracking-wider font-semibold">
            Authenticating session...
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Derived state: only show products that are still in the global wishlistIds array
  const activeWishlistProducts = wishlistProducts.filter((p) =>
    user?.wishlistIds?.includes(p.id),
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="flex-grow max-w-7xl w-full mx-auto px-5 py-12 sm:px-8 lg:px-10 space-y-8">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm text-text-soft font-medium flex items-center gap-2 hover:text-foreground transition-colors w-fit"
          >
            <FiArrowLeft />
            Back
          </Link>
          <p className="text-sm font-medium text-accent-deep shrink-0">
            {activeWishlistProducts.length} Saved
          </p>
        </header>

        {errorText && (
          <div className="border border-red-200 bg-red-50/50 px-4 py-3 text-sm text-red-600 rounded-md">
            {errorText}
          </div>
        )}

        {loading ? (
          <div className="py-20 flex justify-center">
            <LogoLoader size="md" />
          </div>
        ) : activeWishlistProducts.length === 0 ? (
          <div className="border border-line bg-surface px-6 py-20 text-center rounded-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-background border border-line mb-4">
              <FiHeart className="text-2xl text-text-soft" />
            </div>
            <h3 className="text-lg font-semibold text-foreground tracking-tight">
              Your wishlist is empty
            </h3>
            <p className="mt-2 text-sm text-text-soft max-w-sm mx-auto">
              You haven't saved any items yet. Start exploring our collection
              and tap the heart icon on products you love.
            </p>
            <ButtonLink href="/shop" variant="primary" className="mt-6">
              Explore Shop
            </ButtonLink>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {activeWishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
