"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { IoStar, IoCartOutline } from "react-icons/io5";
import { useCart } from "@/context/CartContext";
import React from "react";

interface ProductCardProps {
  category: string;
  name: string;
  price: string;
  rating: number;
  code: string;
  image: string;
  images?: string[]; // Optional gallery images
  isBig?: boolean;
  description?: string;
  features?: string[];
  offers?: string[];
}

export default function ProductCard({
  category,
  name,
  price,
  rating,
  code,
  image,
  images = [],
  isBig = false,
  description,
  features = [],
  offers = [],
}: ProductCardProps) {
  const [currentImage, setCurrentImage] = useState(image);
  const { addToCart } = useCart();

  // Sync currentImage when the product image prop changes
  React.useEffect(() => {
    setCurrentImage(image);
  }, [image]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Adding to cart:", name);
    const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ""));

    addToCart(
      {
        id: code,
        sku: code,
        name,
        image,
        category,
      },
      {
        name: "150 ml",
        price: numericPrice,
      }
    );
  };

  return (
    <Link
      href={`/product/${code}`}
      className={`group relative flex ${isBig ? "flex-col md:flex-row" : "flex-col"} h-full bg-white rounded-3xl overflow-hidden border border-black/5 transition-all duration-500 hover:shadow-2xl hover:shadow-black/5`}
    >
      {/* Image Section */}
      <div
        className={`relative ${isBig ? "w-full md:w-1/2 aspect-square md:aspect-auto" : "w-full aspect-square"} overflow-hidden`}
      >
        <Image
          src={currentImage}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest text-[var(--brand-primary)] rounded-full">
            {category}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div
        className={`flex flex-col justify-between p-6 ${isBig ? "w-full md:w-1/2 bg-white" : "w-full"}`}
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--brand-secondary)] opacity-90 font-mono uppercase tracking-tighter">
              SKU: {code}
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 border border-gray-400 rounded-full bg-white/50">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <IoStar
                    key={i}
                    size={12}
                    className={
                      i < Math.floor(rating)
                        ? "text-yellow-500"
                        : "text-gray-200"
                    }
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-[var(--brand-primary)]">
                {rating}
              </span>
            </div>
          </div>

          <h3
            className={`${isBig ? "text-2xl md:text-3xl" : "text-2xl"} font-bold text-[var(--brand-primary)] mb-2`}
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {name}
          </h3>

          {description && (
            <p
              className={`text-sm text-[var(--brand-secondary)] opacity-70 leading-relaxed max-w-sm ${isBig ? "mb-6" : "mb-4 line-clamp-2"}`}
            >
              {description}
            </p>
          )}

          {/* Product Features Pills */}
          {features.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {features.map((feature, idx) => (
                <span
                  key={idx}
                  className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-black/[0.03] text-[var(--brand-primary)] rounded-md border border-black/5"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}

          {isBig && images.length > 0 && (
            <div
              className="flex gap-2 mb-8"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              {Array.from(new Set([image, ...images])).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(img)}
                  className={`relative w-10 h-10 rounded-sm overflow-hidden border-2 transition-all duration-300 ${currentImage === img ? "border-[var(--brand-primary)]" : "border-transparent opacity-50 hover:opacity-100"}`}
                >
                  <Image
                    src={img}
                    alt={`${name} view ${idx + 1}`}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-[var(--brand-secondary)] opacity-40 uppercase tracking-widest font-bold">
              Price
            </span>
            <span className="text-xl font-extrabold text-[var(--brand-primary)]">
              {price}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className="flex items-center gap-2 px-4 py-3 bg-[var(--brand-primary)] text-white rounded-full text-sm font-bold transition-all duration-300 hover:bg-[var(--brand-secondary)] active:scale-95 group/btn z-10 relative"
          >
            <IoCartOutline size={18} className="transition-transform" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
