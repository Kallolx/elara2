"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  FiInstagram, 
  FiUploadCloud, 
  FiTrash2, 
  FiLink, 
  FiLoader, 
  FiImage, 
  FiVideo, 
  FiPlus 
} from "react-icons/fi";
import { Button } from "@/components/ui/button";

interface SocialPost {
  id: string;
  type: string;
  mediaUrl: string;
  link?: string;
  order: number;
  createdAt: string;
}

export default function AdminSocialPage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [masterUrl, setMasterUrl] = useState("https://instagram.com");
  const [isSavingUrl, setIsSavingUrl] = useState(false);
  
  // Create form states
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [postLink, setPostLink] = useState(""); // Keep but we no longer strictly REQUIRE it for grid, though you can store it
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchGlobalConfig = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/site-settings`);
      const json = await res.json();
      if (json.success && json.data.socialProfileUrl) {
        setMasterUrl(json.data.socialProfileUrl);
      }
    } catch (err) {}
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/social`);
      const json = await res.json();
      if (json.success) {
        setPosts(json.data);
      }
    } catch (error) {
      console.error("Failed fetching social posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchGlobalConfig();
  }, []);

  const handleSaveMasterUrl = async () => {
    setIsSavingUrl(true);
    try {
      const token = localStorage.getItem("elara_token");
      const currentSettingsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/site-settings`);
      const currentJson = await currentSettingsRes.json();
      
      const payload = {
        ...currentJson.data,
        socialProfileUrl: masterUrl
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/site-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if ((await res.json()).success) {
        alert("Global Social Redirect URL updated successfully!");
      }
    } catch (err) {
      alert("Failed to update global URL");
    } finally {
      setIsSavingUrl(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please select a file first.");
    
    setIsUploading(true);
    try {
      const token = localStorage.getItem("elara_token");
      
      // 1. Upload File
      const formData = new FormData();
      formData.append("image", selectedFile); // matches backend field name
      
      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/uploads/single`, {
        method: "POST",
        body: formData
      });
      const uploadJson = await uploadRes.json();
      
      if (!uploadJson.success) throw new Error(uploadJson.message);
      
      const fileUrl = uploadJson.data.url;
      const mimeType = uploadJson.data.mimeType || "";
      const isVideo = mimeType.includes("video") || selectedFile.type.includes("video");

      // 2. Create Social Post Entry
      const createRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/social`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: isVideo ? "video" : "image",
          mediaUrl: fileUrl,
          link: postLink
        })
      });
      
      const createJson = await createRes.json();
      if (createJson.success) {
        alert("Social media post successfully created!");
        // Reset states
        setSelectedFile(null);
        setPreviewUrl("");
        setPostLink("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchPosts(); // Refresh list
      } else {
        alert("Failed to create db entry: " + createJson.message);
      }
    } catch (err: any) {
      alert("Upload Error: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this post from landing grid?")) return;
    try {
      const token = localStorage.getItem("elara_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/social/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setPosts(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      alert("Error deleting post.");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-3">
            <FiInstagram className="text-accent" /> Social Media Matrix
          </h1>
          <p className="text-sm text-text-soft mt-1">
            Manage real-time visual grids for your Elara landing community loop.
          </p>
        </div>
      </header>

      {/* Global Config Control Strip */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-accent shadow-sm">
            <FiLink className="text-lg" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Master Redirect Link</h3>
            <p className="text-xs text-text-soft mt-0.5">All landing grid items will mathematically resolve to this specific endpoint.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input 
            type="url"
            placeholder="https://instagram.com/..."
            value={masterUrl}
            onChange={(e) => setMasterUrl(e.target.value)}
            className="px-3 py-2 border border-line rounded bg-white text-sm text-foreground focus:ring-2 focus:ring-accent/50 outline-none min-w-[250px] w-full md:w-auto"
          />
          <Button 
            onClick={handleSaveMasterUrl}
            disabled={isSavingUrl}
            className="h-9 px-5 rounded-md text-xs"
            variant="primary"
          >
            {isSavingUrl ? <FiLoader className="animate-spin" /> : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-8 items-start">
        
        {/* Creation Console */}
        <section className="bg-surface border border-line p-6 sticky top-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-5 border-b border-line pb-3">
            Create New Post
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Upload Input Region */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-6 cursor-pointer transition-all ${
                previewUrl ? "border-accent bg-accent/5" : "border-line hover:border-accent/50 hover:bg-surface-strong"
              }`}
            >
              <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*"
                onChange={handleFileSelect}
              />
              
              {previewUrl ? (
                <div className="w-full relative">
                  {selectedFile?.type.includes("video") ? (
                     <video src={previewUrl} className="w-full h-40 object-cover rounded-lg pointer-events-none" />
                  ) : (
                    <img src={previewUrl} className="w-full h-40 object-cover rounded-lg" alt="Preview" />
                  )}
                  <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-foreground shadow">
                    CHANGE
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-surface-strong flex items-center justify-center mb-3">
                    <FiUploadCloud className="text-xl text-text-soft" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Select Media Asset</p>
                  <p className="text-xs text-text-soft mt-1">Drag images or mp4 video files.</p>
                </>
              )}
            </div>

            {/* Handlers removed because individual links are no longer leveraged */}
            <Button 
              type="submit"
              variant="primary"
              className="w-full h-11 flex items-center justify-center gap-2"
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <FiLoader className="animate-spin" />
                  Uploading Pipeline...
                </>
              ) : (
                <>
                  <FiPlus />
                  Publish to Grid
                </>
              )}
            </Button>
          </form>
        </section>

        {/* Live Display Grid overview */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground border-b border-line pb-3">
            Live Landing Matrix ({posts.length})
          </h3>

          {loading ? (
            <div className="py-20 text-center">
              <FiLoader className="animate-spin text-3xl text-accent mx-auto mb-4" />
              <p className="text-sm text-text-soft">Hydrating your visual matrix...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-surface border border-line text-center py-20">
              <FiImage className="text-4xl text-text-soft/30 mx-auto mb-4" />
              <p className="text-foreground font-medium">No social posts established yet.</p>
              <p className="text-xs text-text-soft mt-1">Upload media on the left to populate your grid.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {posts.map((post) => (
                <div key={post.id} className="group relative bg-surface border border-line aspect-square overflow-hidden">
                  
                  {/* Media Preview */}
                  {post.type === "video" ? (
                    <div className="w-full h-full relative">
                       <video src={post.mediaUrl} className="w-full h-full object-cover" />
                       <div className="absolute top-2 left-2 bg-black/50 text-white p-1.5 rounded-full">
                         <FiVideo className="text-xs" />
                       </div>
                    </div>
                  ) : (
                    <img 
                      src={post.mediaUrl} 
                      alt="Uploaded asset"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform transform translate-y-2 group-hover:translate-y-0"
                      title="Delete Post"
                    >
                      <FiTrash2 />
                    </button>
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
