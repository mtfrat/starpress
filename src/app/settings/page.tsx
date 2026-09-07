"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";

type PlanTier = "free" | "pro";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  plan_tier: PlanTier;
  stripe_customer_id: string | null;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, email, full_name, plan_tier, stripe_customer_id")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data as UserProfile);
        setName(data.full_name || "");
      }
      setLoading(false);
    };

    fetchProfile();
  }, [router, supabase]);

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);

    await supabase
      .from("profiles")
      .update({ full_name: name })
      .eq("id", profile.id);

    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch {
      setDeleting(false);
    }
  };

  const handleManageBilling = async () => {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9f8f6]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6] text-[#171417] antialiased">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#f0e9e1] bg-[#f9f8f6]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 sm:px-6 h-16">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-[#0c1754]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0c1754] text-white font-bold text-sm shadow-sm">
              ★
            </span>
            <span>Star<span className="text-[#2545ff]">Press</span></span>
          </Link>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <h1 className="font-editorial text-3xl font-normal text-[#0c1754] mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Profile Section */}
          <section className="rounded-2xl border border-[#f0e9e1] bg-white p-6 shadow-xs">
            <h2 className="text-sm font-bold text-[#0c1754] mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#969696]">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#f0e9e1] bg-[#f9f8f6] px-4 text-xs text-[#171417] focus:border-[#2545ff] focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#969696]">
                  Email
                </label>
                <input
                  type="email"
                  value={profile?.email || ""}
                  readOnly
                  className="w-full h-11 rounded-xl border border-[#f0e9e1] bg-[#f9f8f6] px-4 text-xs text-[#969696] cursor-not-allowed"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="h-11 rounded-full bg-[#2545ff] px-6 text-xs font-semibold text-white hover:bg-[#1a38e8] disabled:opacity-50 transition cursor-pointer"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </section>

          {/* Password Section */}
          <section className="rounded-2xl border border-[#f0e9e1] bg-white p-6 shadow-xs">
            <h2 className="text-sm font-bold text-[#0c1754] mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#969696]">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full h-11 rounded-xl border border-[#f0e9e1] bg-[#f9f8f6] px-4 text-xs text-[#171417] focus:border-[#2545ff] focus:bg-white focus:outline-none"
                  placeholder="Min 6 characters"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#969696]">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full h-11 rounded-xl border border-[#f0e9e1] bg-[#f9f8f6] px-4 text-xs text-[#171417] focus:border-[#2545ff] focus:bg-white focus:outline-none"
                  placeholder="Confirm new password"
                />
              </div>
              {passwordError && (
                <p className="text-xs text-rose-600 font-medium">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-xs text-emerald-600 font-medium">Password updated successfully.</p>
              )}
              <button
                type="submit"
                className="h-11 rounded-full bg-[#2545ff] px-6 text-xs font-semibold text-white hover:bg-[#1a38e8] transition cursor-pointer"
              >
                Update Password
              </button>
            </form>
          </section>

          {/* Billing Section */}
          <section className="rounded-2xl border border-[#f0e9e1] bg-white p-6 shadow-xs">
            <h2 className="text-sm font-bold text-[#0c1754] mb-4">Billing</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#171417]">Current Plan</p>
                  <p className="text-xs text-[#969696] mt-0.5">
                    {profile?.plan_tier === "pro" ? "Pro — $19/month" : "Free"}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  profile?.plan_tier === "pro"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-slate-100 text-slate-600"
                }`}>
                  {profile?.plan_tier || "free"}
                </span>
              </div>
              {profile?.plan_tier === "pro" && (
                <button
                  onClick={handleManageBilling}
                  className="h-11 rounded-full border border-[#f0e9e1] px-6 text-xs font-semibold text-[#0c1754] hover:bg-[#f9f8f6] transition cursor-pointer"
                >
                  Manage Billing (Stripe Portal)
                </button>
              )}
              {profile?.plan_tier !== "pro" && (
                <Link
                  href="/pricing"
                  className="inline-flex h-11 items-center rounded-full bg-[#2545ff] px-6 text-xs font-semibold text-white hover:bg-[#1a38e8] transition"
                >
                  Upgrade to Pro
                </Link>
              )}
            </div>
          </section>

          {/* Danger Zone */}
          <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-xs">
            <h2 className="text-sm font-bold text-red-600 mb-4">Danger Zone</h2>
            <p className="text-xs text-[#969696] mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="h-11 rounded-full border border-red-300 px-6 text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              Delete Account
            </button>
          </section>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Account</h3>
                <p className="text-xs text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="mb-6 text-sm text-slate-600">
              Are you sure you want to delete your account? All your data, locations, and widgets will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 h-11 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
