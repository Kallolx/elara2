"use client";

import React, { useEffect, useState } from "react";
import { FiMapPin, FiSearch, FiCheck, FiX, FiEdit2, FiNavigation, FiPlus, FiTrash2, FiDownloadCloud } from "react-icons/fi";

import { LogoLoader } from "@/components/ui/logo-loader";
import { motion, AnimatePresence } from "framer-motion";

interface DeliveryZone {
  id: string;
  district: string;
  subAreas: string[];
  charge: number;
  updatedAt: string;
}

export default function DeliveryManagementPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // District Actions Loading State
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  // Add District Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDistrictName, setNewDistrictName] = useState("");
  const [newDistrictCharge, setNewDistrictCharge] = useState("");

  // Inline Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCharge, setEditCharge] = useState<string>("");
  const [savingId, setSavingId] = useState<string | null>(null);

  // View/Edit Subareas Modal State
  const [activeModalZone, setActiveModalZone] = useState<DeliveryZone | null>(null);
  const [newSubAreaInput, setNewSubAreaInput] = useState("");

  // Seeding States
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedFromStaticJson = async () => {
    if (!confirm("🚨 DATABASE INJECTION: Are you sure you want to auto-populate Postgres with the harvested 65-district delivery locations dataset? This is intended for fresh VPS deployments.")) {
      return;
    }

    try {
      setIsSeeding(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("elara_token") : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/delivery-zones/seed-from-json`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      alert(json.message);
      if (json.success) {
        fetchZones();
      }
    } catch (err) {
      alert("Error launching data ingestion sequence.");
    } finally {
      setIsSeeding(false);
    }
  };


  const fetchZones = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/delivery-zones`);
      const json = await res.json();
      if (json.success) {
        setZones(json.data);
      } else {
        setError(json.message || "Failed to query delivery zones.");
      }
    } catch (err) {
      setError("Failed to establish communication with API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  // ➕ Core CRUD: Create New District
  const handleCreateDistrict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDistrictName.trim()) return;

    try {
      setIsActionInProgress(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("elara_token") : null;
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/delivery-zones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          district: newDistrictName,
          charge: parseFloat(newDistrictCharge) || 0
        }),
      });

      const json = await res.json();
      if (json.success) {
        setZones((prev) => [...prev, json.data].sort((a, b) => a.district.localeCompare(b.district)));
        setIsAddModalOpen(false);
        setNewDistrictName("");
        setNewDistrictCharge("");
      } else {
        alert(json.message || "Create failure.");
      }
    } catch (err) {
      alert("A network fault occurred during transmission.");
    } finally {
      setIsActionInProgress(false);
    }
  };

  // 🗑️ Core CRUD: Delete District Entirely
  const handleDeleteDistrict = async (id: string, name: string) => {
    if (!confirm(`Danger Zone: Are you absolutely sure you want to permanently delete the location '${name}' and all associated sub-areas?`)) {
      return;
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("elara_token") : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/delivery-zones/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const json = await res.json();
      if (json.success) {
        setZones((prev) => prev.filter((z) => z.id !== id));
      } else {
        alert(json.message || "Wipe failure.");
      }
    } catch (err) {
      alert("System communication failure.");
    }
  };

  // ✏️ Sub-CRUD: Modify Delivery Charge (Inline)
  const startEditing = (zone: DeliveryZone) => {
    setEditingId(zone.id);
    setEditCharge(zone.charge.toString());
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditCharge("");
  };

  const handleSaveCharge = async (id: string) => {
    const numericVal = parseFloat(editCharge);
    if (isNaN(numericVal)) {
      alert("Please provide a valid delivery cost.");
      return;
    }

    try {
      setSavingId(id);
      const token = typeof window !== "undefined" ? localStorage.getItem("elara_token") : null;
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/delivery-zones/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ charge: numericVal }),
      });

      const json = await res.json();
      if (json.success) {
        setZones((prev) =>
          prev.map((z) => (z.id === id ? { ...z, charge: json.data.charge } : z))
        );
        setEditingId(null);
      } else {
        alert(json.message || "Unable to modify rate.");
      }
    } catch (err) {
      alert("A network fault occurred during reconciliation.");
    } finally {
      setSavingId(null);
    }
  };

  // 🗺️ Area-CRUD: Add SubArea
  const handleAddSubArea = async () => {
    if (!activeModalZone || !newSubAreaInput.trim()) return;
    
    const normalized = newSubAreaInput.trim();
    if (activeModalZone.subAreas.includes(normalized)) {
      alert("This sub-area already exists.");
      return;
    }

    const updatedList = [...activeModalZone.subAreas, normalized];

    try {
      setIsActionInProgress(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("elara_token") : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/delivery-zones/${activeModalZone.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ subAreas: updatedList }),
      });

      const json = await res.json();
      if (json.success) {
        setZones((prev) => prev.map((z) => (z.id === activeModalZone.id ? json.data : z)));
        setActiveModalZone(json.data);
        setNewSubAreaInput("");
      }
    } catch (err) {
      alert("Addition failure.");
    } finally {
      setIsActionInProgress(false);
    }
  };

  // 🗺️ Area-CRUD: Delete SubArea
  const handleDeleteSubArea = async (areaName: string) => {
    if (!activeModalZone) return;

    const updatedList = activeModalZone.subAreas.filter((a) => a !== areaName);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("elara_token") : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/delivery-zones/${activeModalZone.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ subAreas: updatedList }),
      });

      const json = await res.json();
      if (json.success) {
        setZones((prev) => prev.map((z) => (z.id === activeModalZone.id ? json.data : z)));
        setActiveModalZone(json.data);
      }
    } catch (err) {
      alert("Deletion failure.");
    }
  };

  const filteredZones = zones.filter((z) =>
    z.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      <header className="border border-line bg-surface p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Delivery Fees
          </h1>
          <p className="mt-1 text-xs text-text-soft">
            Configure shipping matrix dynamically across {zones.length} active physical distribution hubs.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative max-w-xs w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-soft text-sm" />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-line rounded-md py-2 pl-9 pr-4 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 placeholder:text-text-soft/50 transition-all"
            />
          </div>
          <button
            onClick={handleSeedFromStaticJson}
            disabled={isSeeding}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-line hover:bg-surface-strong text-text-soft text-xs font-semibold rounded-sm transition-all disabled:opacity-50"
            title="Load Static District Dataset"
          >
            {isSeeding ? (
              <div className="h-3.5 w-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <FiDownloadCloud />
            )}
            Import Dataset
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:opacity-90 text-white text-xs font-semibold rounded-sm shadow-sm transition-all"
          >
            <FiPlus />
            Add Location
          </button>
        </div>
      </header>


      {loading ? (
        <div className="border border-line bg-surface p-24 flex flex-col items-center justify-center space-y-4">
          <LogoLoader size="md" />
          <p className="text-xs text-text-soft tracking-wide">Retrieving geography manifest...</p>
        </div>
      ) : error ? (
        <div className="border border-line bg-surface p-12 text-center space-y-3">
          <p className="text-sm text-red-500 font-medium">{error}</p>
          <button
            onClick={fetchZones}
            className="px-4 py-1.5 border border-line text-xs text-foreground hover:bg-surface-strong bg-background transition-all"
          >
            Re-Initialize Connection
          </button>
        </div>
      ) : zones.length === 0 ? (
        <div className="border-2 border-dashed border-line bg-surface p-16 flex flex-col items-center justify-center text-center space-y-6 rounded-lg shadow-inner animate-fade-in">
          <div className="h-16 w-16 rounded-full bg-accent/5 text-accent flex items-center justify-center text-2xl shadow-sm">
            <FiDownloadCloud />
          </div>
          <div className="max-w-md space-y-1.5">
            <h3 className="text-base font-semibold text-foreground tracking-tight">
              Database Ledger Empty
            </h3>
            <p className="text-xs text-text-soft leading-relaxed">
              No physical geographic districts detected in your PostgreSQL registry. Trigger automatic deployment synchronization to populate the harvested 65-district matrix from local code storage instantly.
            </p>
          </div>
          <button
            onClick={handleSeedFromStaticJson}
            disabled={isSeeding}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-2.5 bg-accent hover:opacity-95 text-white text-xs font-bold rounded-sm shadow transition-all disabled:opacity-50"
          >
            {isSeeding ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FiDownloadCloud className="scale-110" />
            )}
            <span>Run Automated Ingestion (Seed DB)</span>
          </button>
        </div>
      ) : (

        <article className="border border-line bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="border-b border-line bg-background/50 text-[11px] text-text-soft uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-normal">District Location</th>
                  <th className="px-6 py-4 font-normal">Coverage Areas</th>
                  <th className="px-6 py-4 font-normal">Charge Rate</th>
                  <th className="px-6 py-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredZones.map((zone) => {
                  const isEditing = editingId === zone.id;
                  const isSaving = savingId === zone.id;

                  return (
                    <tr key={zone.id} className="hover:bg-background/40 group transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        <div className="flex items-center gap-2.5">
                          <FiMapPin className="text-text-soft text-xs shrink-0 opacity-70 group-hover:text-accent transition-colors" />
                          <span>{zone.district}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-text-soft">
                        <button 
                          onClick={() => setActiveModalZone(zone)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-strong border border-line rounded font-medium text-foreground/80 cursor-pointer hover:border-accent hover:bg-accent/5 hover:text-accent transition-all"
                        >
                          <FiNavigation className="scale-75 opacity-60 shrink-0" />
                          <span>{zone.subAreas.length} sub-areas</span>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="flex items-center border border-accent bg-background rounded overflow-hidden max-w-[110px] transition-all">
                            <span className="pl-2 text-xs text-text-soft">৳</span>
                            <input
                              type="text"
                              value={editCharge}
                              onChange={(e) => setEditCharge(e.target.value)}
                              className="w-full px-1.5 py-1 text-sm text-foreground bg-transparent outline-none font-semibold"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveCharge(zone.id);
                                if (e.key === "Escape") cancelEditing();
                              }}
                            />
                          </div>
                        ) : (
                          <span className="text-sm font-semibold text-foreground">
                            ৳{zone.charge.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2.5">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveCharge(zone.id)}
                                disabled={isSaving}
                                className="p-1.5 rounded border border-accent bg-accent/5 text-accent hover:bg-accent hover:text-white transition-colors"
                                title="Save"
                              >
                                {isSaving ? (
                                  <div className="h-3.5 w-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <FiCheck className="text-xs" />
                                )}
                              </button>
                              <button
                                onClick={cancelEditing}
                                disabled={isSaving}
                                className="p-1.5 rounded border border-line text-text-soft hover:bg-red-50 hover:text-red-500 transition-colors"
                                title="Cancel"
                              >
                                <FiX className="text-xs" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditing(zone)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-line bg-background text-xs text-text-soft hover:border-accent hover:text-accent transition-all"
                              >
                                <FiEdit2 className="scale-90" />
                                Edit Price
                              </button>
                              <button
                                onClick={() => handleDeleteDistrict(zone.id, zone.district)}
                                className="p-1.5 rounded border border-line bg-background text-text-soft hover:border-red-500 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                title="Delete Location"
                              >
                                <FiTrash2 className="scale-90" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredZones.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-xs text-text-soft">
                      No geographic zones match "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      )}

      {/* 🌌 Floating Modal A: Sub-areas Dynamic Manager */}
      <AnimatePresence>
        {activeModalZone && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isActionInProgress) setActiveModalZone(null); }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              className="relative w-full max-w-2xl bg-surface border border-line rounded shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-background/50">
                <div className="flex items-center gap-2.5">
                  <FiMapPin className="text-accent shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground leading-tight">
                      {activeModalZone.district} Sub-Areas
                    </h3>
                    <p className="text-[11px] text-text-soft mt-0.5">
                      Manage individual postal delivery sectors ({activeModalZone.subAreas.length} items)
                    </p>
                  </div>
                </div>
                <button
                  disabled={isActionInProgress}
                  onClick={() => setActiveModalZone(null)}
                  className="p-1.5 text-text-soft hover:bg-surface-strong rounded transition-colors disabled:opacity-50"
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              {/* Sticky SubArea Inline Creator */}
              <div className="px-6 py-3.5 border-b border-line bg-surface-strong/30 flex items-center gap-3">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    disabled={isActionInProgress}
                    value={newSubAreaInput}
                    onChange={(e) => setNewSubAreaInput(e.target.value)}
                    placeholder="Enter physical area name (e.g. Uttara Sector 4)..."
                    className="w-full bg-background border border-line rounded-sm px-3 py-2 text-xs text-foreground placeholder:text-text-soft/40 outline-none focus:border-accent transition-all"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddSubArea();
                    }}
                  />
                </div>
                <button
                  onClick={handleAddSubArea}
                  disabled={!newSubAreaInput.trim() || isActionInProgress}
                  className="px-4 py-2 bg-accent text-white text-xs font-bold rounded-sm flex items-center gap-1.5 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <FiPlus />
                  Add Area
                </button>
              </div>
              
              {/* Main Content: Dynamic Scrollable SubAreas List */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-surface">
                {activeModalZone.subAreas.length === 0 ? (
                  <div className="text-center py-12 text-xs text-text-soft italic">
                    No sub-areas logged for this district yet. Use the creator above to populate.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {[...activeModalZone.subAreas]
                      .sort((a, b) => a.localeCompare(b))
                      .map((area) => (
                        <div 
                          key={area} 
                          className="group/item relative px-3 py-2 border border-line/60 bg-background text-xs font-medium text-foreground/90 rounded-sm flex items-center justify-between gap-2 hover:border-accent/40 transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div className="h-1 w-1 bg-accent/60 rounded-full shrink-0" />
                            <span className="truncate" title={area}>{area}</span>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteSubArea(area)}
                            className="opacity-0 group-hover/item:opacity-100 text-text-soft hover:text-red-500 p-1 transition-all duration-150 shrink-0"
                            title={`Delete ${area}`}
                          >
                            <FiX className="text-[12px]" />
                          </button>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-line bg-background/30 flex justify-end">
                <button
                  disabled={isActionInProgress}
                  onClick={() => setActiveModalZone(null)}
                  className="px-4 py-2 bg-background border border-line text-xs font-medium text-foreground hover:bg-surface-strong transition-all rounded-sm"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🌌 Floating Modal B: Create New District Module */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isActionInProgress) setIsAddModalOpen(false); }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              className="relative w-full max-w-md bg-surface border border-line rounded shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleCreateDistrict}>
                <div className="px-6 py-4 border-b border-line bg-background/50 flex justify-between items-center">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <FiPlus className="text-accent" />
                    <span>Add District Location</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="text-text-soft hover:bg-surface-strong p-1 rounded transition-colors"
                  >
                    <FiX />
                  </button>
                </div>

                <div className="p-6 space-y-4 bg-surface">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-text-soft">
                      District Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sylhet, Khulna City"
                      value={newDistrictName}
                      onChange={(e) => setNewDistrictName(e.target.value)}
                      className="w-full bg-background border border-line rounded-sm px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent transition-colors placeholder:text-text-soft/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-text-soft">
                      Base Delivery Cost (৳)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="e.g. 120"
                      value={newDistrictCharge}
                      onChange={(e) => setNewDistrictCharge(e.target.value)}
                      className="w-full bg-background border border-line rounded-sm px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent transition-colors placeholder:text-text-soft/30"
                    />
                  </div>
                </div>

                <div className="px-6 py-4 bg-background/30 border-t border-line flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={isActionInProgress}
                    className="px-4 py-2 border border-line text-xs text-foreground bg-background hover:bg-surface-strong transition-all rounded-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isActionInProgress || !newDistrictName}
                    className="px-4 py-2 bg-accent text-white text-xs font-bold hover:opacity-90 transition-all rounded-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {isActionInProgress ? (
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Create Zone"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
