import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { ProductDetailsPage } from "@/components/products/product-details-page";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

async function fetchProduct(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${baseUrl}/products/${slug}`, {
      cache: "no-store",
    });
    const json = await res.json();
    if (json.success) {
      return json.data;
    }
  } catch (err) {
    console.error("Failed to fetch product from database:", err);
  }
  return null;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) {
    return {
      title: "Product not found | Elara",
    };
  }

  return {
    title: `${product.name} | Elara`,
    description: product.shortDescription || "",
  };
}

export default async function ProductRoutePage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen text-foreground">
      <SiteHeader />
      <main id="top">
        <ProductDetailsPage product={product} />
      </main>
      <SiteFooter />
    </div>
  );
}