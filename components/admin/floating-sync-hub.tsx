"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { 
  FiZap, 
  FiRefreshCw, 
  FiX, 
  FiAlertCircle, 
  FiPackage
} from "react-icons/fi";

interface SyncMatch {
  id: string;
  name: string;
  sku: string;
  method: string;
  outOfStock: boolean;
  wasUpdated: boolean;
  categoryName: string;
  brandName: string;
  image: string | null;
}

interface SyncResult {
  totalScanned: number;
  updatedCount: number;
  totalMatches: number;
  matches: SyncMatch[];
}

export function FloatingSyncHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState("idle");
  const [progressMsg, setProgressMsg] = useState("System standing by");
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [triggerPending, setTriggerPending] = useState(false);
  const pollTimer = useRef<NodeJS.Timeout | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"; 

  const checkCurrentStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/sourcing/sync-status`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("elara_token")}`,
        }
      });
      const data = await res.json();
      
      if (data.success) {
        setIsRunning(data.isRunning);
        setStatus(data.status);
        setProgressMsg(data.progressMsg);
        setError(data.error);
        if (data.result) {
          setResult(data.result);
        }
      }
    } catch (err) {
      console.error("Telemetry polling failure:", err);
    }
  };

  useEffect(() => {
    checkCurrentStatus();

    if (isRunning) {
      pollTimer.current = setInterval(checkCurrentStatus, 2500);
    } else {
      pollTimer.current = setInterval(checkCurrentStatus, 30000);
    }

    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [isRunning]);

  const triggerSync = async () => {
    if (isRunning || triggerPending) return;
    
    setTriggerPending(true);
    setError(null);
    setProgressMsg("Launching cloud thread...");
    
    try {
      const res = await fetch(`${API_URL}/sourcing/auto-sync`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("elara_token")}`
        }
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Sync trigger denied.");
      }
      
      setIsRunning(true);
      setStatus("initializing");
      setTimeout(checkCurrentStatus, 500);
    } catch (err: any) {
      setError(err.message);
      setIsRunning(false);
    } finally {
      setTriggerPending(false);
    }
  };

  const changedCount = result?.updatedCount || 0;

  const sortedMatches = result?.matches ? [...result.matches].sort((a, b) => {
    if (a.wasUpdated && !b.wasUpdated) return -1;
    if (!a.wasUpdated && b.wasUpdated) return 1;
    return a.name.localeCompare(b.name);
  }) : [];

  return (
    <div className="fixed bottom-6 right-6 z-[999] font-sans text-foreground text-[13px]">
      {isOpen && (
        <div 
          className="fixed inset-0 z-[-1] bg-foreground/5 backdrop-blur-[1px]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 1. READABLE LIST CONSOLE */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[480px] bg-surface border border-line shadow-xl rounded-none flex flex-col overflow-hidden select-none animate-in fade-in slide-in-from-bottom-2 duration-150">
          
          {/* Larger, Legible Header */}
          <div className="bg-[#0F172A] px-5 py-3 text-surface flex-shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FiZap className={`text-base ${isRunning ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="text-[13px] font-medium text-white/95">
                Stock Engine Telemetry
              </span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1.5"
            >
              <FiX className="text-base" />
            </button>
          </div>

          {/* Status and Action Bar */}
          <div className="px-5 py-2.5 bg-surface-strong border-b border-line flex items-center justify-between text-[11px] text-text-soft">
            <div className="flex items-center gap-2.5">
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-amber-500 animate-pulse' : 'bg-olive'}`} />
              <span className="truncate max-w-[280px] font-medium">{progressMsg}</span>
            </div>
            <button
              onClick={triggerSync}
              disabled={isRunning || triggerPending}
              className={`text-[11px] font-semibold flex items-center gap-1 cursor-pointer hover:underline border-b border-dotted border-text-soft/30 ${
                isRunning ? "text-amber-600" : "text-accent"
              }`}
            >
              {isRunning ? (
                <>
                  <FiRefreshCw className="animate-spin" />
                  Syncing
                </>
              ) : (
                <>
                  <FiRefreshCw />
                  Run Sync
                </>
              )}
            </button>
          </div>

          {/* Readable Stat Strip */}
          {result && (
            <div className="flex bg-surface border-b border-line text-[11px] text-text-soft px-5 py-2 gap-6">
              <div>
                Scanned: <span className="text-foreground font-semibold">{result.totalScanned}</span>
              </div>
              <div className="w-px h-3.5 bg-line/40 self-center" />
              <div>
                Matches: <span className="text-foreground font-semibold">{result.totalMatches}</span>
              </div>
              <div className="w-px h-3.5 bg-line/40 self-center" />
              <div className="text-olive font-medium">
                Updated: <span className="font-bold">+{result.updatedCount}</span>
              </div>
            </div>
          )}

          {/* Rich-Data Scan Feed */}
          <div className="overflow-y-auto max-h-[360px] custom-scrollbar bg-surface">
            {error && (
              <div className="p-4 bg-red-50 text-red-700 text-[11px] border-b border-red-100 flex items-center gap-2.5">
                <FiAlertCircle className="shrink-0 text-base" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {(!result || sortedMatches.length === 0) && !error && (
              <div className="py-14 text-center text-[11px] text-text-soft/60 font-medium">
                No diagnostics captured yet.
              </div>
            )}

            {sortedMatches.length > 0 && (
              <div className="divide-y divide-line/20">
                {sortedMatches.map((match, idx) => (
                  <div 
                    key={idx} 
                    className={`px-5 flex items-center justify-between gap-4 hover:bg-surface-strong transition-colors ${
                      match.wasUpdated ? "bg-olive/5 py-3" : "py-2.5"
                    }`}
                  >
                    {/* Left Stack: Conditionally Render Large Image for Updates + Title/Meta */}
                    <div className="min-w-0 flex-1 flex items-center gap-3">
                      
                      {/* Show Larger Image Exclusively on Updated Items */}
                      {match.wasUpdated && (
                        <div className="shrink-0">
                          {match.image ? (
                            <img 
                              src={match.image} 
                              className="w-12 h-12 border border-line bg-white object-cover shrink-0 rounded-none" 
                              alt="" 
                            />
                          ) : (
                            <div className="w-12 h-12 border border-line bg-white flex items-center justify-center shrink-0 rounded-none text-text-soft/40">
                              <FiPackage className="text-lg" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Text Block */}
                      <div className="min-w-0 flex-1 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          {match.wasUpdated && (
                            <span className="shrink-0 w-2 h-2 bg-olive rounded-full animate-pulse" title="Stock updated" />
                          )}
                          <span className="text-[13px] font-semibold text-foreground truncate leading-tight" title={match.name}>
                            {match.name}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-[11px] text-text-soft/70 overflow-hidden">
                          <span className="font-mono opacity-80 tracking-tight shrink-0 bg-surface-strong px-1.5 py-0.5 border border-line/20">{match.sku}</span>
                          <span>•</span>
                          <span className="truncate">{match.brandName}</span>
                          <span>•</span>
                          <span className="truncate">{match.categoryName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status / Action Block */}
                    <div className="flex items-center gap-4 shrink-0 text-right">
                      <span className={`text-[11px] font-bold ${
                        match.outOfStock ? "text-red-600" : "text-olive/85"
                      }`}>
                        {match.outOfStock ? "Out" : "In"}
                      </span>
                      
                      {/* Conditional Edit: Restricted strictly to modified rows */}
                      {match.wasUpdated ? (
                        <Link 
                          href={`/admin/products/${match.id}/edit`}
                          onClick={() => setIsOpen(false)}
                          className="text-[11px] font-semibold text-accent hover:text-accent-deep border-b border-dotted border-accent/45 transition-all px-1 py-0.5"
                        >
                          Edit
                        </Link>
                      ) : (
                        <span className="w-[26px]" /> // Clean horizontal constraint buffer
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Readable Footer */}
          <div className="px-5 py-2.5 bg-surface-strong border-t border-line text-center text-[10px] text-text-soft/50 font-medium">
            Elara Control Terminal v2.3
          </div>
        </div>
      )}

      {/* 2. FIXED MINI CIRCLE */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-12 h-12 rounded-full flex items-center justify-center text-surface border shadow-md transition-all duration-200 transform active:scale-95 cursor-pointer ${
          isOpen 
            ? "bg-[#0F172A] border-[#1E293B] text-white" 
            : "bg-accent border-accent-deep text-white"
        }`}
      >
        {isRunning && !isOpen && (
          <span className="absolute inset-0 h-full w-full rounded-full bg-accent opacity-40 animate-ping pointer-events-none"></span>
        )}

        {isOpen ? (
          <FiX className="text-base" />
        ) : isRunning ? (
          <FiRefreshCw className="text-base animate-spin" />
        ) : (
          <FiZap className="text-base" />
        )}

        {!isOpen && changedCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-600 border-2 border-surface text-white font-semibold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow leading-none z-10">
            {changedCount}
          </div>
        )}
      </button>
    </div>
  );
}
