"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff, FiLock, FiMail, FiLoader } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

export default function SigninPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        router.push("/admin/products");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-grow flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 border border-line bg-surface p-8 sm:p-10 shadow-sm">
          <div className="text-center">
            <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
              Welcome back.
            </h1>
            <p className="mt-2 text-sm text-text-soft">
              Sign in to manage your Elara skincare workspace.
            </p>
          </div>

          {error && (
            <div className="border border-red-200 bg-red-50/50 px-4 py-3 text-sm text-red-600 rounded-md">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className="block text-xs uppercase tracking-[0.2em] text-text-soft font-semibold">
                  Email Address
                </label>
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-soft">
                    <FiMail />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="block w-full border border-line bg-surface pl-10 pr-3 py-3 text-sm text-foreground placeholder-text-soft/60 outline-none transition-colors focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password-input" className="block text-xs uppercase tracking-[0.2em] text-text-soft font-semibold">
                  Password
                </label>
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-soft">
                    <FiLock />
                  </div>
                  <input
                    id="password-input"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full border border-line bg-surface pl-10 pr-10 py-3 text-sm text-foreground placeholder-text-soft/60 outline-none transition-colors focus:border-accent"
                  />
                  <button
                    id="password-toggle"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-soft hover:text-foreground transition-colors outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff className="text-[16px]" /> : <FiEye className="text-[16px]" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                id="submit-signin"
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center border border-accent bg-accent py-3.5 text-xs uppercase tracking-[0.25em] font-medium text-white hover:bg-accent-deep transition-colors outline-none disabled:opacity-70"
              >
                {loading ? (
                  <FiLoader className="animate-spin text-[16px]" />
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          <div className="text-center text-xs tracking-[0.1em] text-text-soft pt-4 border-t border-line/50">
            <span>Don't have an account? </span>
            <Link href="/auth/signup" className="font-semibold text-accent hover:text-accent-deep transition-colors">
              SIGN UP
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
