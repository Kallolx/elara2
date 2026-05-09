"use client";

import React, { useEffect, useState } from "react";
import { FiInstagram, FiYoutube, FiPlay } from "react-icons/fi";
import { Button } from "../ui/button";

interface SocialPost {
  id: string;
  type: string;
  mediaUrl: string;
  link?: string;
}

export function SocialMediaSection() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileUrl, setProfileUrl] = useState("https://instagram.com");

  useEffect(() => {
    const loadData = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        
        // Load dynamic posts
        const res = await fetch(`${apiBase}/social`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setPosts(json.data);
        }

        // Load master redirection config
        const settingsRes = await fetch(`${apiBase}/site-settings`);
        const settingsJson = await settingsRes.json();
        if (settingsJson.success && settingsJson.data.socialProfileUrl) {
          setProfileUrl(settingsJson.data.socialProfileUrl);
        }
      } catch (err) {
        console.error("Error syncing social data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Do not render section if we're loading or have no published posts
  if (loading || posts.length === 0) return null;

  return (
    <section className="py-10 text-foreground relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center mb-12 space-y-2">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
            Follow us @Elara
          </h2>
          <p className="text-md text-text-soft max-w-lg mx-auto mt-3 leading-relaxed">
            Join our community on Instagram for daily skincare rituals, behind-the-scenes action, and exclusive offers.
          </p>
        </div>

        {/* Fully Dynamic Visual Grid - Boosted width, ideal for 1:1 Square visuals */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {posts.slice(0, 8).map((post) => (
             <a 
               key={post.id}
               href={profileUrl} // Standard unified social redirection
               target="_blank"
               rel="noreferrer"
               className="group relative aspect-square overflow-hidden rounded-2xl bg-surface-strong border border-line/30 transition-all shadow-sm hover:shadow-md"
             >
               {post.type === "video" ? (
                  <video 
                    src={post.mediaUrl} 
                    className="w-full h-full object-cover transition-transform duration-500"
                    muted
                    loop
                    playsInline
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                  />
               ) : (
                  <img 
                    src={post.mediaUrl} 
                    alt="Social Feed"
                    className="w-full h-full object-cover transition-transform duration-500"
                  />
               )}
               
               {/* Premium Overlays */}
               <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/20 flex items-center justify-center">
                  {post.type === "video" ? (
                    <div className="w-10 h-10 rounded-full bg-white/90 text-accent flex items-center justify-center shadow-lg opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                      <FiPlay className="text-base translate-x-0.5" />
                    </div>
                  ) : (
                    <FiInstagram className="text-2xl text-white opacity-0 transform transition-all duration-300 group-hover:opacity-100" />
                  )}
               </div>
             </a>
          ))}
        </div>

        {/* Bottom Multi-Platform CTA */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <a 
            href={profileUrl} 
            target="_blank" 
            rel="noreferrer"
            className="px-8 h-12 rounded-full bg-accent hover:bg-accent-deep !text-white shadow-lg shadow-accent/20 flex items-center justify-center gap-2 text-sm font-medium tracking-wider transition-all"
          >
            <FiInstagram className="text-lg" />
            Follow on Instagram
          </a>
        </div>

      </div>
    </section>
  );
}
