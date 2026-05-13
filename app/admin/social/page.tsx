"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  FiVideo,
  FiUploadCloud,
  FiTrash2,
  FiLoader,
  FiPlus,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { LogoLoader } from "@/components/ui/logo-loader";
import { Button } from "@/components/ui/button";

interface ProductSize {
  price: number;
  oldPrice?: number;
}

interface Product {
  id: string;
  name: string;
  image?: string;
  sizes: ProductSize[];
}

interface SocialPost {
  id: string;
  type: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  products: Product[];
  order: number;
  createdAt: string;
}

export default function AdminSocialPage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isUploading, setIsUploading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [thumbPreview, setThumbPreview] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState("");

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/social`);
      const json = await res.json();
      if (json.success) setPosts(json.data.filter((p: any) => p.type === "video"));
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    const res = await fetch(`${apiBase}/products?limit=500`);
    const json = await res.json();
    if (json.success) setProducts(json.data);
  };

  useEffect(() => {
    fetchPosts();
    fetchProducts();
  }, []);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedThumbnail(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`${apiBase}/uploads/single`, { method: "POST", body: formData });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVideo) return alert("Please select a video file.");
    if (selectedProductIds.length === 0) return alert("Please link at least one product to this reel.");

    setIsUploading(true);
    try {
      const token = localStorage.getItem("elara_token");

      const videoUrl = await uploadFile(selectedVideo);
      let thumbnailUrl: string | undefined;
      if (selectedThumbnail) {
        thumbnailUrl = await uploadFile(selectedThumbnail);
      }

      const res = await fetch(`${apiBase}/social`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          type: "video", 
          mediaUrl: videoUrl, 
          thumbnailUrl, 
          productIds: selectedProductIds 
        }),
      });

      const json = await res.json();
      if (json.success) {
        // Reset form
        setSelectedVideo(null);
        setSelectedThumbnail(null);
        setVideoPreview("");
        setThumbPreview("");
        setSelectedProductIds([]);
        setProductSearch("");
        if (videoInputRef.current) videoInputRef.current.value = "";
        if (thumbInputRef.current) thumbInputRef.current.value = "";
        fetchPosts();
      } else {
        alert("Failed: " + json.message);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this reel?")) return;
    const token = localStorage.getItem("elara_token");
    const res = await fetch(`${apiBase}/social/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (json.success) setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUnlinkProduct = async (postId: string, productId: string) => {
    if (!confirm("Unlink this product from the reel?")) return;

    try {
      const token = localStorage.getItem("elara_token");
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      const updatedProductIds = post.products
        .map((p) => p.id)
        .filter((id) => id !== productId);

      if (updatedProductIds.length === 0) {
        return alert("A reel must have at least one product. Use delete to remove the whole reel.");
      }

      const res = await fetch(`${apiBase}/social/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productIds: updatedProductIds }),
      });

      const json = await res.json();
      if (json.success) {
        fetchPosts();
      } else {
        alert("Failed to unlink: " + json.message);
      }
    } catch (err) {
      alert("Error unlinking product");
    }
  };

  const handleLinkProduct = async (postId: string, productId: string) => {
    try {
      const token = localStorage.getItem("elara_token");
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      const updatedProductIds = [...post.products.map((p) => p.id), productId];

      const res = await fetch(`${apiBase}/social/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productIds: updatedProductIds }),
      });

      const json = await res.json();
      if (json.success) {
        fetchPosts();
      } else {
        alert("Failed to link: " + json.message);
      }
    } catch (err) {
      alert("Error linking product");
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) && !selectedProductIds.includes(p.id)
  );

  const selectedProducts = products.filter((p) => selectedProductIds.includes(p.id));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-3">
          <FiVideo className="text-accent" /> Reels
        </h1>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-8 items-start">

        {/* Upload Form */}
        <section className="bg-surface border border-line rounded-xl p-6 sticky top-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Video Upload */}
            <div
              onClick={() => videoInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-5 cursor-pointer transition-all ${
                videoPreview ? "border-accent bg-accent/5" : "border-line hover:border-accent/50 hover:bg-surface-strong"
              }`}
            >
              <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
              {videoPreview ? (
                <div className="w-full relative">
                  <video src={videoPreview} className="w-full h-48 object-cover rounded-lg pointer-events-none" />
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded font-bold">CHANGE</div>
                </div>
              ) : (
                <>
                  <FiUploadCloud className="text-2xl text-text-soft mb-1" />
                  <p className="text-sm font-medium text-foreground">Select video</p>
                </>
              )}
            </div>

            {/* Thumbnail Upload */}
            <div
              onClick={() => thumbInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-4 cursor-pointer transition-all ${
                thumbPreview ? "border-olive bg-olive/5" : "border-line hover:border-olive/50 hover:bg-surface-strong"
              }`}
            >
              <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailSelect} />
              {thumbPreview ? (
                <div className="w-full relative">
                  <img src={thumbPreview} alt="Thumbnail" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded font-bold">CHANGE</div>
                </div>
              ) : (
                <>
                  <FiUploadCloud className="text-xl text-text-soft mb-1" />
                  <p className="text-sm text-foreground font-medium">Thumbnail <span className="text-text-soft font-normal">(optional)</span></p>
                </>
              )}
            </div>

            {/* Product Selector */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-text-soft uppercase tracking-wide">Linked Products</label>
              
              {/* Selected Chips */}
              <div className="flex flex-wrap gap-2">
                {selectedProducts.map(p => (
                  <div key={p.id} className="flex items-center gap-2 bg-surface-strong border border-accent/20 px-2 py-1.5 rounded-lg">
                    <div className="w-6 h-6 rounded bg-line/20 overflow-hidden">
                       {p.image && <img src={p.image} className="w-full h-full object-cover" />}
                    </div>
                    <span className="text-xs font-medium text-foreground truncate max-w-[120px]">{p.name}</span>
                    <button 
                      type="button" 
                      onClick={() => setSelectedProductIds(prev => prev.filter(id => id !== p.id))}
                      className="text-text-soft hover:text-red-400"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border border-line rounded-xl overflow-hidden bg-white">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-line">
                  <FiSearch className="text-text-soft shrink-0" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-text-soft"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredProducts.slice(0, 20).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setSelectedProductIds(prev => [...prev, p.id]); setProductSearch(""); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-strong transition-colors text-left border-b border-line/40 last:border-0"
                    >
                      <div className="w-9 h-9 rounded-md overflow-hidden shrink-0 bg-line/20">
                        {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                        {p.sizes[0] && <p className="text-xs text-text-soft">৳{p.sizes[0].price}</p>}
                      </div>
                    </button>
                  ))}
                  {filteredProducts.length === 0 && productSearch && (
                    <p className="text-xs text-text-soft text-center py-6">No products found</p>
                  )}
                  {!productSearch && filteredProducts.length === 0 && selectedProductIds.length === products.length && (
                    <p className="text-xs text-text-soft text-center py-6">All products selected</p>
                  )}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11 flex items-center justify-center gap-2"
              disabled={!selectedVideo || selectedProductIds.length === 0 || isUploading}
            >
              {isUploading ? (
                <><FiLoader className="animate-spin" /> Uploading...</>
              ) : (
                <><FiPlus /> Publish Reel</>
              )}
            </Button>
          </form>
        </section>

        {/* Live Reels List */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground border-b border-line pb-3">
            Published Reels ({posts.length})
          </h3>

          {loading ? (
            <div className="py-20 text-center">
              <LogoLoader size="lg" className="mx-auto mb-4" />
              <p className="text-sm text-text-soft">Loading reels...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-surface border border-line rounded-xl text-center py-20">
              <FiVideo className="text-4xl text-text-soft/30 mx-auto mb-4" />
              <p className="text-foreground font-medium">No reels published yet.</p>
              <p className="text-xs text-text-soft mt-1">Upload a video and link it to products.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {posts.map((post) => (
                <div key={post.id} className="bg-surface border border-line rounded-xl overflow-hidden group flex flex-col">
                  {/* Portrait Video Preview */}
                  <div className="relative w-full aspect-[9/16] bg-black/5">
                    <video
                      src={post.mediaUrl}
                      poster={post.thumbnailUrl}
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                    />
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500/90 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>

                  {/* Linked Products */}
                  <div className="p-3 bg-white flex-grow">
                    <p className="text-[10px] font-bold text-text-soft uppercase mb-2">Linked Products ({post.products.length})</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto hide-scrollbar">
                      {post.products.map(p => (
                        <div key={p.id} className="flex items-center gap-2 border-b border-line/40 pb-2 last:border-0 last:pb-0 group/prod">
                          <div className="w-8 h-8 rounded bg-line/20 overflow-hidden shrink-0">
                            {p.image && <img src={p.image} className="w-full h-full object-cover" />}
                          </div>
                          <p className="text-xs font-medium text-foreground truncate flex-1">{p.name}</p>
                          <button 
                            onClick={() => handleUnlinkProduct(post.id, p.id)}
                            className="text-text-soft hover:text-red-500 opacity-0 group-hover/prod:opacity-100 transition-opacity"
                            title="Unlink Product"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Product Inline */}
                    <div className="mt-3 pt-2 border-t border-line/30">
                      <div className="relative group/add">
                        <button className="flex items-center gap-1 text-[10px] font-bold text-accent hover:text-accent/80 transition-colors uppercase tracking-wider">
                          <FiPlus size={10} /> Link Product
                        </button>
                        <div className="absolute left-0 bottom-full mb-2 w-64 bg-white border border-line rounded-xl shadow-2xl z-50 p-3 opacity-0 invisible group-hover/add:opacity-100 group-hover/add:visible focus-within:opacity-100 focus-within:visible transition-all">
                          <p className="text-[10px] font-bold text-text-soft uppercase mb-2">Search to link</p>
                          <div className="relative mb-2">
                            <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-text-soft text-[10px]" />
                            <input 
                              type="text" 
                              placeholder="Type product name..." 
                              className="w-full text-xs pl-6 pr-2 py-1.5 border border-line rounded bg-surface outline-none focus:ring-1 focus:ring-accent"
                              onChange={(e) => setProductSearch(e.target.value)}
                            />
                          </div>
                          <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                            {products
                              .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) && !post.products.some(pp => pp.id === p.id))
                              .slice(0, 10)
                              .map(p => (
                                <button
                                  key={p.id}
                                  onClick={() => { handleLinkProduct(post.id, p.id); setProductSearch(""); }}
                                  className="w-full text-left p-1.5 hover:bg-accent/5 hover:text-accent text-[11px] font-medium rounded transition-colors border border-transparent hover:border-accent/20"
                                >
                                  {p.name}
                                </button>
                              ))
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
