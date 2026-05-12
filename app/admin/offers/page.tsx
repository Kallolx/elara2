"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiPlus, FiTag, FiClock, FiTrash2, FiEdit2 } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { ButtonLink } from "@/components/ui/button";

export default function AdminOffersPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const token = localStorage.getItem("elara_token");
      if (!token) return;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${baseUrl}/offers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (Array.isArray(json)) {
        setOffers(json);
      }
    } catch (err) {
      console.error("Failed to fetch offers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    try {
      const token = localStorage.getItem("elara_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      await fetch(`${baseUrl}/offers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOffers();
    } catch (err) {
      console.error("Failed to delete offer", err);
    }
  };

  if (loading) {
    return <div className="p-8 text-text-soft">Loading offers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Offers & Flash Sales</h2>
          <p className="text-sm text-text-soft">Manage product discounts, coupons, and flash sales</p>
        </div>
        <ButtonLink
          href="/admin/offers/new"
          variant="primary"
        >
          <FiPlus /> Create Offer
        </ButtonLink>
      </div>

      <div className="rounded-lg border border-line bg-surface overflow-hidden">
        {offers.length === 0 ? (
          <div className="p-12 text-center text-text-soft">
            <FiTag className="mx-auto mb-3 text-3xl opacity-50" />
            <p>No offers created yet.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-background">
              <tr>
                <th className="px-4 py-3 font-medium text-text-soft">Title</th>
                <th className="px-4 py-3 font-medium text-text-soft">Type</th>
                <th className="px-4 py-3 font-medium text-text-soft">Discount</th>
                <th className="px-4 py-3 font-medium text-text-soft">Status</th>
                <th className="px-4 py-3 font-medium text-text-soft text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer.id} className="border-b border-line/50 hover:bg-background/50">
                  <td className="px-4 py-4">
                    <div className="font-medium text-foreground">{offer.title}</div>
                    {offer.code && (
                      <div className="text-xs text-text-soft mt-0.5">Code: <span className="font-mono bg-background px-1 border border-line rounded">{offer.code}</span></div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      {offer.isFlashSale && <span className="text-[10px] uppercase bg-accent/10 text-accent px-2 py-0.5 rounded font-bold">Flash Sale</span>}
                      {offer.code ? (
                        <span className="text-[10px] uppercase bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold border border-blue-100">Coupon</span>
                      ) : (
                        <span className="text-[10px] uppercase bg-surface-strong text-text-soft px-2 py-0.5 rounded font-bold border border-line">Discount</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium">
                    {offer.discountValue}{offer.discountType === "PERCENTAGE" ? "%" : " ৳"} OFF
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${offer.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {offer.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/offers/${offer.id}`} className="text-text-soft hover:text-foreground">
                        <FiEdit2 />
                      </Link>
                      <button onClick={() => handleDelete(offer.id)} className="text-text-soft hover:text-red-500">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
