"use client";

import { useEffect, useState, useRef } from "react";
import { FiTrash2, FiUpload, FiImage, FiLoader, FiCopy, FiCheck } from "react-icons/fi";
import { LogoLoader } from "@/components/ui/logo-loader";
import { Button } from "@/components/ui/button";

interface MediaFile {
  filename: string;
  size: number;
  createdAt: string;
  url: string;
  group: string;
  usages: Array<{ type: string; id: string; name: string }>;
}

export default function AdminGalleryPage() {
  const [images, setImages] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [copiedFilename, setCopiedFilename] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("All Assets");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("elara_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/uploads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setImages(json.data);
      } else {
        setError(json.message || "Failed to fetch media library");
      }
    } catch (err) {
      setError("Error connecting to the upload server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const filteredImages = images.filter(img => {
    if (activeTab === "All Assets") return true;
    return img.group === activeTab;
  });

  const tabs = ["All Assets", "Products", "Categories", "Brands", "Unassigned"];

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("images", file));

      const token = localStorage.getItem("elara_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/uploads/multiple`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        fetchImages();
      } else {
        alert(json.message || "Failed to upload images");
      }
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Are you sure you want to permanently delete this file from the server? WARNING: If this image is in use by products or categories, their images will break.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("elara_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/uploads/${filename}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const json = await res.json();
      if (json.success) {
        setImages((prev) => prev.filter((img) => img.filename !== filename));
      } else {
        alert(json.message || "Delete failed");
      }
    } catch (err) {
      alert("Connect error.");
    }
  };

  const copyToClipboard = (url: string, filename: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedFilename(filename);
      setTimeout(() => setCopiedFilename(null), 2000);
    });
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals < 0 ? 0 : decimals)) + ' ' + sizes[i];
  };

  const getTabCount = (tabName: string) => {
    if (tabName === "All Assets") return images.length;
    return images.filter(img => img.group === tabName).length;
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between border-b border-line bg-surface px-5 py-4">
        <div>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-foreground">Media Gallery</h2>
          <p className="text-sm text-text-soft">Analyze usage and organize uploaded assets</p>
        </div>
        <div>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleUpload}
          />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={uploading}
            className="inline-flex items-center gap-2"
          >
            {uploading ? <FiLoader className="animate-spin" /> : <FiUpload />}
            {uploading ? "Uploading..." : "Upload Assets"}
          </Button>
        </div>
      </header>

      {/* Filter Folders / Tabs */}
      <div className="flex border-b border-line bg-surface overflow-x-auto scrollbar-hide px-5 gap-6">
        {tabs.map((tab) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative py-3 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                active ? "text-accent" : "text-text-soft hover:text-foreground"
              }`}
            >
              {tab}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                active ? "bg-accent text-white" : "bg-line text-text-soft"
              }`}>
                {getTabCount(tab)}
              </span>
              {active && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-5 bg-red-50 text-red-600 border border-red-200 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 text-text-soft">
          <LogoLoader size="lg" />
          <p className="mt-4">Mapping assets to relationships...</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 border border-dashed border-line text-center text-text-soft">
          <FiImage size={48} className="mb-4 opacity-30" />
          <h3 className="font-medium text-lg text-foreground">No items in this category</h3>
          <p className="text-sm mt-1">Try exploring "All Assets" or upload something new.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredImages.map((img) => (
            <div key={img.filename} className="group relative flex flex-col border border-line bg-surface transition-shadow hover:shadow-sm overflow-hidden">
              
              {/* Image Preview */}
              <div className="relative aspect-square bg-white border-b border-line flex items-center justify-center overflow-hidden group">
                <img 
                  src={img.url} 
                  alt={img.filename} 
                  loading="lazy"
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" 
                />
                
                {/* Dynamic Label overlay */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider rounded-sm shadow-sm ${
                    img.group === "Unassigned" 
                      ? "bg-gray-100 text-gray-600 border border-gray-200" 
                      : "bg-accent text-white"
                  }`}>
                    {img.group === "Unassigned" ? "Orphaned" : img.group.slice(0, -1)}
                  </span>
                </div>

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 z-20">
                  <button
                    onClick={() => copyToClipboard(img.url, img.filename)}
                    className="bg-white h-9 w-9 rounded-full flex items-center justify-center text-gray-700 hover:text-accent transition-colors"
                    title="Copy Link"
                  >
                    {copiedFilename === img.filename ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
                  </button>
                  <a
                    href={img.url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white h-9 w-9 rounded-full flex items-center justify-center text-gray-700 hover:text-accent transition-colors"
                    title="View Full"
                  >
                    <FiImage />
                  </a>
                  <button
                    onClick={() => handleDelete(img.filename)}
                    className="bg-white h-9 w-9 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              {/* Footer Info */}
              <div className="p-3 space-y-2 bg-background text-left border-t border-line/5 mt-auto">
                <p className="text-[11px] font-mono text-foreground truncate w-full" title={img.filename}>
                  {img.filename}
                </p>

                {/* Relation Mapping List */}
                <div className="min-h-[16px]">
                  {img.usages && img.usages.length > 0 ? (
                    <div className="flex flex-col gap-0.5">
                      {img.usages.slice(0, 2).map((u, i) => (
                        <span key={i} className="text-[9px] text-text-soft truncate flex items-center gap-1" title={`${u.type}: ${u.name}`}>
                          <span className="h-1 w-1 rounded-full bg-accent shrink-0" />
                          Used by {u.type}: <b className="text-foreground font-medium">{u.name}</b>
                        </span>
                      ))}
                      {img.usages.length > 2 && (
                        <span className="text-[8px] text-text-soft">+ {img.usages.length - 2} more places</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[9px] text-amber-600 font-medium italic">Not linked to any item</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[9px] text-text-soft uppercase tracking-wider font-medium border-t border-line/50 pt-1.5 mt-1">
                  <span>{formatBytes(img.size)}</span>
                  <span>{new Date(img.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {copiedFilename === img.filename && (
                <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-foreground text-background px-2.5 py-1 rounded text-[10px] font-medium shadow-xl z-30 whitespace-nowrap">
                  Copied to Clipboard
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
