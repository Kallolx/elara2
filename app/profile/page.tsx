"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiUser, FiMail, FiCalendar, FiShield, FiAlertTriangle, FiPhone, FiMapPin, FiLock, FiCheck } from "react-icons/fi";
import { LogoLoader } from "@/components/ui/logo-loader";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { useAuth } from "@/context/AuthContext";

export default function MyProfilePage() {
  const { user, token, logout, updateUserSession } = useAuth();
  const router = useRouter();

  // Shipping details states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  // Standalone Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Status notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Deletion states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
    }
  }, [user]);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaveLoading(true);
    setErrorText(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const savedToken = token || localStorage.getItem("elara_token");

      const res = await fetch(`${baseUrl}/users/${user.id}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${savedToken}`,
        },
        body: JSON.stringify({ name, phone, address }),
      });
      const data = await res.json();

      if (data.success) {
        updateUserSession(data.data);
        triggerToast("Successfully updated your shipping address details!");
      } else {
        setErrorText(data.message || "Failed to update profile details.");
      }
    } catch (err) {
      setErrorText("Could not connect to database server.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword !== confirmPassword) {
      setErrorText("Confirm password does not match new password.");
      return;
    }

    setPasswordLoading(true);
    setErrorText(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const savedToken = token || localStorage.getItem("elara_token");

      const res = await fetch(`${baseUrl}/users/${user.id}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${savedToken}`,
        },
        body: JSON.stringify({ currentPassword, password: newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        triggerToast("Successfully reset your account security password!");
      } else {
        setErrorText(data.message || "Failed to reset password.");
      }
    } catch (err) {
      setErrorText("Could not establish connection with backend database.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleteLoading(true);
    setErrorText(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const savedToken = token || localStorage.getItem("elara_token");

      const res = await fetch(`${baseUrl}/users/${user.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });
      const data = await res.json();

      if (data.success) {
        logout();
        router.push("/");
      } else {
        setErrorText(data.message || "Failed to delete account.");
      }
    } catch (err) {
      setErrorText("Could not establish connection with database server.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex-grow flex flex-col items-center justify-center space-y-4">
          <LogoLoader size="md" />
          <p className="text-sm text-text-soft uppercase tracking-wider font-semibold">Loading profile...</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-5 z-50 flex items-center gap-2.5 border border-emerald-200 bg-emerald-50/90 backdrop-blur-sm px-5 py-3.5 shadow-lg animate-in slide-in-from-top-4 duration-300 rounded-sm">
          <FiCheck className="text-emerald-600 text-base shrink-0" />
          <p className="text-xs uppercase tracking-wider font-semibold text-emerald-800">{toastMessage}</p>
        </div>
      )}

      <main className="flex-grow max-w-4xl w-full mx-auto px-5 py-12 sm:px-8 lg:px-10 space-y-8">
        <header className="border-b border-line pb-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-text-soft font-semibold flex items-center gap-2">
            <FiUser />
            Customer Account
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            My Profile
          </h1>
          <p className="mt-1.5 text-xs text-text-soft">
            Manage your personal profile records, delivery settings, and account security.
          </p>
        </header>

        {errorText && (
          <div className="border border-red-200 bg-red-50/50 px-4 py-3 text-sm text-red-600 rounded-md">
            {errorText}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          
          {/* Card 1: General Delivery Settings */}
          <form onSubmit={handleUpdateProfile} className="border border-line bg-surface p-6 sm:p-8 space-y-5 shadow-sm">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground tracking-tight">Delivery Details</h2>
              <p className="text-[11px] uppercase tracking-wider text-text-soft mt-0.5">Manage Name and Shipping Address</p>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="delivery-name" className="text-[10px] uppercase tracking-wider text-text-soft font-bold flex items-center gap-1.5">
                  <FiUser className="text-[12px]" />
                  Full Name
                </label>
                <input
                  id="delivery-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="block w-full border border-line bg-surface px-4 py-3 text-xs text-foreground placeholder-text-soft/60 outline-none transition-colors focus:border-accent"
                />
              </div>

              {/* Locked Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-text-soft font-bold flex items-center gap-1.5">
                  <FiMail className="text-[12px]" />
                  Email Address (Locked)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="block w-full border border-line bg-background/40 px-4 py-3 text-xs text-text-soft outline-none opacity-80 cursor-not-allowed"
                  />
                  <FiLock className="absolute right-4 top-3.5 text-text-soft text-xs" />
                </div>
              </div>

              {/* Contact Phone */}
              <div className="space-y-1.5">
                <label htmlFor="delivery-phone" className="text-[10px] uppercase tracking-wider text-text-soft font-bold flex items-center gap-1.5">
                  <FiPhone className="text-[12px]" />
                  Contact Phone
                </label>
                <input
                  id="delivery-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1712-345678"
                  className="block w-full border border-line bg-surface px-4 py-3 text-xs text-foreground placeholder-text-soft/60 outline-none transition-colors focus:border-accent"
                />
              </div>

              {/* Delivery Address */}
              <div className="space-y-1.5">
                <label htmlFor="delivery-address" className="text-[10px] uppercase tracking-wider text-text-soft font-bold flex items-center gap-1.5">
                  <FiMapPin className="text-[12px]" />
                  Shipping Address
                </label>
                <textarea
                  id="delivery-address"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House 24, Road 5, Dhanmondi, Dhaka"
                  className="block w-full border border-line bg-surface px-4 py-3 text-xs text-foreground placeholder-text-soft/60 outline-none transition-colors focus:border-accent resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saveLoading}
              className="w-full border border-accent bg-accent px-5 py-3 text-[10px] uppercase tracking-widest font-bold text-white hover:bg-accent-deep transition-colors cursor-pointer outline-none flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {saveLoading ? "Saving..." : "Save Delivery Details"}
            </button>
          </form>

          {/* Card 2: Standalone Password Reset Card */}
          <form onSubmit={handleResetPassword} className="border border-line bg-surface p-6 sm:p-8 space-y-5 shadow-sm flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground tracking-tight">Security Credentials</h2>
                <p className="text-[11px] uppercase tracking-wider text-text-soft mt-0.5">Reset Account Password Parameters</p>
              </div>

              <div className="space-y-4">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <label htmlFor="reset-current" className="text-[10px] uppercase tracking-wider text-text-soft font-bold flex items-center gap-1.5">
                    <FiLock className="text-[12px] text-accent" />
                    Current Password
                  </label>
                  <input
                    id="reset-current"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="block w-full border border-line bg-surface px-4 py-3 text-xs text-foreground placeholder-text-soft/60 outline-none transition-colors focus:border-accent"
                  />
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label htmlFor="reset-new" className="text-[10px] uppercase tracking-wider text-text-soft font-bold flex items-center gap-1.5">
                    <FiLock className="text-[12px]" />
                    New Password
                  </label>
                  <input
                    id="reset-new"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new secure password"
                    className="block w-full border border-line bg-surface px-4 py-3 text-xs text-foreground placeholder-text-soft/60 outline-none transition-colors focus:border-accent"
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label htmlFor="reset-confirm" className="text-[10px] uppercase tracking-wider text-text-soft font-bold flex items-center gap-1.5">
                    <FiLock className="text-[12px]" />
                    Confirm Password
                  </label>
                  <input
                    id="reset-confirm"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new secure password"
                    className="block w-full border border-line bg-surface px-4 py-3 text-xs text-foreground placeholder-text-soft/60 outline-none transition-colors focus:border-accent"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full border border-line bg-background hover:bg-background/80 hover:text-foreground px-5 py-3 text-[10px] uppercase tracking-widest font-bold text-text-soft transition-colors cursor-pointer outline-none flex items-center justify-center gap-1.5 disabled:opacity-50 mt-5"
            >
              {passwordLoading ? "Resetting..." : "Update Security Password"}
            </button>
          </form>

        </div>

        {/* Danger Zone Account Deletion Panel */}
        <section className="border border-red-100 bg-red-50/10 p-6 sm:p-8 space-y-4">
          <div>
            <h3 className="text-xs uppercase tracking-wider font-bold text-red-600 flex items-center gap-1.5">
              <FiAlertTriangle />
              Danger Zone Account Purge
            </h3>
            <p className="mt-1 text-xs text-text-soft">
              Permanently delete your skincare customer profile and lose all past order and feedback session records. This cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 border border-red-200 bg-red-50/20 hover:bg-red-50 px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-red-700 transition-colors cursor-pointer outline-none"
          >
            Delete Account
          </button>
        </section>
      </main>

      <SiteFooter />

      {/* Account Deletion Confirmation Modal Overlay */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="w-full max-w-md border border-line bg-surface p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 border border-red-200 text-red-600">
                <FiAlertTriangle className="text-xl" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                  Confirm Account Deletion
                </h3>
                <p className="mt-2 text-sm text-text-soft leading-relaxed">
                  Are you absolutely sure you want to permanently delete your account? All of your orders, reviews, and dashboard sessions will be lost forever.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setShowDeleteModal(false)}
                className="border border-line bg-background px-4 py-2 text-xs uppercase tracking-wider font-semibold text-foreground hover:bg-background/80 transition-colors cursor-pointer outline-none disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteAccount}
                className="border border-red-600 bg-red-600 px-5 py-2 text-xs uppercase tracking-wider font-bold text-white hover:bg-red-700 transition-colors cursor-pointer outline-none flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
