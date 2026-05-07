"use client";

import { useEffect, useState } from "react";
import { FiUser, FiShield, FiUsers, FiMessageSquare, FiSliders, FiAlertCircle, FiLoader } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

interface UserActivity {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string | null;
  lastIp: string | null;
  createdAt: string;
  reviewsCount: number;
  reviews: any[];
}

export default function AdminCustomersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for row click detail modal & role confirmation modal
  const [selectedUser, setSelectedUser] = useState<UserActivity | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [targetUser, setTargetUser] = useState<UserActivity | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const savedToken = token || localStorage.getItem("elara_token");
      
      const res = await fetch(`${baseUrl}/users`, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });
      const data = await res.json();
      
      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.message || "Failed to load users list.");
      }
    } catch (err) {
      setError("Could not connect to database server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleRowClick = (user: UserActivity) => {
    setSelectedUser(user);
  };

  const handleOpenConfirmation = (user: UserActivity, currentRole: string) => {
    const roleToSet = currentRole === "ADMIN" ? "USER" : "ADMIN";
    setTargetUser(user);
    setNewRole(roleToSet);
    setShowConfirmModal(true);
  };

  const handleConfirmRoleChange = async () => {
    if (!targetUser) return;
    setActionLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const savedToken = token || localStorage.getItem("elara_token");

      const res = await fetch(`${baseUrl}/users/${targetUser.id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${savedToken}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();

      if (data.success) {
        // Refresh users list and close modals
        await fetchUsers();
        setShowConfirmModal(false);
        setTargetUser(null);
        setSelectedUser(null); // Close details modal if open
      } else {
        alert(data.message || "Failed to update role.");
      }
    } catch (err) {
      alert("Error occurred while contacting server.");
    } finally {
      setActionLoading(false);
    }
  };

  const resolveLocation = (ip: string | null) => {
    if (!ip) return "Never";
    if (ip === "127.0.0.1" || ip === "localhost") return "Dhaka, BD (Local)";
    return "Dhaka, BD";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse border border-line bg-surface p-5 h-24" />
          ))}
        </div>
        <div className="animate-pulse border border-line bg-surface p-10 h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-200 bg-red-50/50 p-6 text-center text-red-600">
        <FiAlertCircle className="mx-auto text-3xl mb-2" />
        <p className="font-semibold">{error}</p>
        <button onClick={fetchUsers} className="mt-4 border border-red-200 px-4 py-2 text-xs uppercase tracking-wider bg-white">
          Retry
        </button>
      </div>
    );
  }

  const adminsCount = users.filter((u) => u.role === "ADMIN").length;
  const customersCount = users.filter((u) => u.role === "USER").length;

  return (
    <div className="space-y-6">
      {/* Dynamic Stats Cards matched with main dashboard style */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <article className="border border-line bg-surface px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-text-soft">Total Users</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground">{users.length}</p>
              <p className="mt-2 text-sm text-text-soft">Registered workspace users</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center border border-line bg-background text-accent-deep">
              <FiUsers className="text-[18px]" />
            </span>
          </div>
        </article>

        <article className="border border-line bg-surface px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-text-soft">Administrators</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground">{adminsCount}</p>
              <p className="mt-2 text-sm text-text-soft">Full permission managers</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center border border-line bg-background text-accent-deep">
              <FiShield className="text-[18px]" />
            </span>
          </div>
        </article>

        <article className="border border-line bg-surface px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-text-soft">Customers</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground">{customersCount}</p>
              <p className="mt-2 text-sm text-text-soft">Standard customer accounts</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center border border-line bg-background text-accent-deep">
              <FiUser className="text-[18px]" />
            </span>
          </div>
        </article>
      </section>

      {/* Simplified, Single-Row Customers Table */}
      <section className="border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-text-soft">Directory</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-foreground">Registered users</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line text-[11px] uppercase tracking-[0.26em] text-text-soft">
              <tr>
                <th className="px-5 py-4 font-normal">Customer</th>
                <th className="px-5 py-4 font-normal">Email</th>
                <th className="px-5 py-4 font-normal">Role</th>
                <th className="px-5 py-4 font-normal">IP Address</th>
                <th className="px-5 py-4 font-normal">Reviews</th>
                <th className="px-5 py-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => handleRowClick(user)}
                  className="border-b border-line last:border-b-0 hover:bg-background/20 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-4 font-medium text-foreground">{user.name}</td>
                  <td className="px-5 py-4 text-text-soft">{user.email}</td>
                  <td className="px-5 py-4">
                    <span
                      className={[
                        "inline-block px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border rounded-sm",
                        user.role === "ADMIN"
                          ? "bg-amber-50 border-amber-200 text-amber-700"
                          : "bg-stone-50 border-stone-200 text-stone-600",
                      ].join(" ")}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-text-soft">{user.lastIp || "None"}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-xs text-text-soft">
                      <FiMessageSquare className="text-[12px] text-accent" />
                      {user.reviewsCount}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleOpenConfirmation(user, user.role)}
                      className={[
                        "border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors outline-none cursor-pointer",
                        user.role === "ADMIN"
                          ? "border-red-200 bg-red-50/20 text-red-700 hover:bg-red-50"
                          : "border-accent bg-accent/5 text-accent hover:bg-accent hover:text-white",
                      ].join(" ")}
                    >
                      {user.role === "ADMIN" ? "Demote" : "Promote"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Customer Profile Activity Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="w-full max-w-lg border border-line bg-surface p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div>
                <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
                  User Activity Details
                </h3>
                <p className="mt-1 text-xs text-text-soft uppercase tracking-wider">
                  Full Account Profile
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-text-soft hover:text-foreground text-xs uppercase tracking-widest font-semibold transition-colors outline-none"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="border border-line bg-background p-3 rounded-sm">
                <p className="text-[10px] uppercase tracking-wider text-text-soft font-semibold">Full Name</p>
                <p className="mt-1 font-semibold text-foreground">{selectedUser.name}</p>
              </div>
              <div className="border border-line bg-background p-3 rounded-sm">
                <p className="text-[10px] uppercase tracking-wider text-text-soft font-semibold">Email Address</p>
                <p className="mt-1 font-semibold text-foreground break-all">{selectedUser.email}</p>
              </div>
              <div className="border border-line bg-background p-3 rounded-sm">
                <p className="text-[10px] uppercase tracking-wider text-text-soft font-semibold">IP Address</p>
                <p className="mt-1 font-semibold text-foreground">{selectedUser.lastIp || "None"}</p>
              </div>
              <div className="border border-line bg-background p-3 rounded-sm">
                <p className="text-[10px] uppercase tracking-wider text-text-soft font-semibold">Geo IP Location</p>
                <p className="mt-1 font-semibold text-foreground">{resolveLocation(selectedUser.lastIp)}</p>
              </div>
              <div className="border border-line bg-background p-3 rounded-sm">
                <p className="text-[10px] uppercase tracking-wider text-text-soft font-semibold">Joined Date</p>
                <p className="mt-1 font-semibold text-foreground">
                  {new Date(selectedUser.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="border border-line bg-background p-3 rounded-sm">
                <p className="text-[10px] uppercase tracking-wider text-text-soft font-semibold">Last Login</p>
                <p className="mt-1 font-semibold text-foreground">
                  {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }) : "Never"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-[0.2em] text-text-soft font-semibold">
                Written Reviews ({selectedUser.reviewsCount})
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-2.5 pr-1 divide-y divide-line">
                {selectedUser.reviews && selectedUser.reviews.length > 0 ? (
                  selectedUser.reviews.map((review: any) => (
                    <div key={review.id} className="pt-2.5 first:pt-0">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">★ {review.rating}</span>
                        <span className="text-text-soft">{new Date(review.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>
                      <p className="mt-1 text-xs text-text-soft italic bg-background p-2 border border-line/50 rounded-sm">
                        "{review.text}"
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-text-soft italic">No reviews written yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal Overlay */}
      {showConfirmModal && targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="w-full max-w-md border border-line bg-surface p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f2eadf] border border-line text-accent">
                <FiAlertCircle className="text-xl" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                  Reconfirm Status Transition
                </h3>
                <p className="mt-2 text-sm text-text-soft">
                  Are you absolutely sure you want to change <strong className="text-foreground">{targetUser.name}</strong>'s access role from <strong className="text-foreground">{targetUser.role}</strong> to <strong className="text-accent">{newRole}</strong>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => {
                  setShowConfirmModal(false);
                  setTargetUser(null);
                }}
                className="border border-line bg-background px-4 py-2 text-xs uppercase tracking-wider font-semibold text-foreground hover:bg-background/80 transition-colors cursor-pointer outline-none disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmRoleChange}
                className="border border-accent bg-accent px-5 py-2 text-xs uppercase tracking-wider font-bold text-white hover:bg-accent-deep transition-colors cursor-pointer outline-none flex items-center gap-1.5 disabled:opacity-50"
              >
                {actionLoading ? (
                  <FiLoader className="animate-spin text-sm" />
                ) : (
                  "Confirm Change"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
