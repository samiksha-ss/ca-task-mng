"use client";

import { useState } from "react";
import { updateProfileNameAction, updateUserPasswordAction } from "@/lib/actions/settings";
import { User, Shield, Bell, Check, Key, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type SettingsFormProps = {
  profile: {
    id: string;
    full_name: string | null;
    email: string;
    role: string;
    job_title: string | null;
    team_name?: string | null;
    is_active: boolean;
  };
};

export function SettingsForm({ profile }: SettingsFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");

  // Profile forms state
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password forms state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Preference Toggles state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || updatingProfile) return;

    setUpdatingProfile(true);
    setProfileSuccess(false);
    setProfileError(null);

    try {
      const { error } = await updateProfileNameAction(fullName);
      if (error) {
        setProfileError(error);
      } else {
        setProfileSuccess(true);
        router.refresh();
      }
    } catch {
      setProfileError("Failed to update profile name.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    setUpdatingPassword(true);
    setPasswordSuccess(false);
    setPasswordError(null);

    try {
      const { error } = await updateUserPasswordAction(password);
      if (error) {
        setPasswordError(error);
      } else {
        setPasswordSuccess(true);
        setPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordError("Failed to update password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
      {/* Sidebar Navigation Tabs */}
      <aside className="space-y-1">
        <button
          onClick={() => setActiveTab("profile")}
          className={[
            "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left",
            activeTab === "profile"
              ? "bg-accent text-accent-foreground shadow-sm"
              : "hover:bg-muted text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          <User className="h-4 w-4" /> Account Details
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={[
            "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left",
            activeTab === "security"
              ? "bg-accent text-accent-foreground shadow-sm"
              : "hover:bg-muted text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          <Shield className="h-4 w-4" /> Password & Security
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={[
            "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left",
            activeTab === "notifications"
              ? "bg-accent text-accent-foreground shadow-sm"
              : "hover:bg-muted text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          <Bell className="h-4 w-4" /> Preferences
        </button>
      </aside>

      {/* Main Settings Card Content */}
      <div className="rounded-[32px] border border-border bg-card p-6 md:p-8 shadow-sm">
        
        {/* Tab 1: Profile Info */}
        {activeTab === "profile" && (
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Account Details</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Manage your personal workspace identity.</p>
            </div>

            {profileError && (
              <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-500/10 text-red-500 text-xs font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
                <Check className="h-4 w-4 shrink-0" />
                Profile updated successfully.
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-background/50 px-4 text-sm outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                <input
                  disabled
                  type="email"
                  value={profile.email}
                  className="h-11 w-full rounded-2xl border border-border bg-muted/40 px-4 text-sm outline-none text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Role Scope</label>
                <div className="h-11 w-full rounded-2xl border border-border bg-muted/40 px-4 text-sm flex items-center capitalize text-muted-foreground font-semibold">
                  {profile.role}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Job Title</label>
                <div className="h-11 w-full rounded-2xl border border-border bg-muted/40 px-4 text-sm flex items-center text-muted-foreground font-semibold">
                  {profile.job_title || "Not set"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assigned Team</label>
                <div className="h-11 w-full rounded-2xl border border-border bg-muted/40 px-4 text-sm flex items-center text-muted-foreground font-semibold">
                  {profile.team_name || "Unassigned"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Account Status</label>
                <div className="h-11 w-full rounded-2xl border border-border bg-muted/40 px-4 text-sm flex items-center gap-1.5 text-muted-foreground font-semibold">
                  <span className={["h-2 w-2 rounded-full", profile.is_active ? "bg-emerald-500" : "bg-red-500"].join(" ")} />
                  {profile.is_active ? "Active" : "Inactive"}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border/40">
              <button
                type="submit"
                disabled={updatingProfile || fullName.trim() === profile.full_name}
                className="h-11 px-6 rounded-2xl bg-accent text-accent-foreground font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {updatingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Save Profile
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Security */}
        {activeTab === "security" && (
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Password & Security</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Secure your CA workspace access.</p>
            </div>

            {passwordError && (
              <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-500/10 text-red-500 text-xs font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
                <Check className="h-4 w-4 shrink-0" />
                Password updated successfully!
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">New Password</label>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="h-11 w-full rounded-2xl border border-border bg-background/50 px-4 text-sm outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Confirm New Password</label>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-background/50 px-4 text-sm outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border/40">
              <button
                type="submit"
                disabled={updatingPassword || !password}
                className="h-11 px-6 rounded-2xl bg-accent text-accent-foreground font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {updatingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                Change Password
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Preferences */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Workspace Preferences</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Customize your notification feeds and UI toggles.</p>
            </div>

            <div className="divide-y divide-border/40">
              {/* Toggle 1: Email */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold">Email Notifications</h4>
                  <p className="text-xs text-muted-foreground">Receive daily assignment lists and due date alerts via email.</p>
                </div>
                <button
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={[
                    "h-6 w-11 rounded-full p-1 transition-colors relative focus:outline-none cursor-pointer",
                    emailAlerts ? "bg-accent" : "bg-muted",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "block h-4 w-4 rounded-full bg-white transition-all shadow-sm",
                      emailAlerts ? "translate-x-5" : "translate-x-0",
                    ].join(" ")}
                  />
                </button>
              </div>

              {/* Toggle 2: Push */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold">Desktop Push Alerts</h4>
                  <p className="text-xs text-muted-foreground">Get live notifications on task comments and assignments inside your browser.</p>
                </div>
                <button
                  onClick={() => setPushAlerts(!pushAlerts)}
                  className={[
                    "h-6 w-11 rounded-full p-1 transition-colors relative focus:outline-none cursor-pointer",
                    pushAlerts ? "bg-accent" : "bg-muted",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "block h-4 w-4 rounded-full bg-white transition-all shadow-sm",
                      pushAlerts ? "translate-x-5" : "translate-x-0",
                    ].join(" ")}
                  />
                </button>
              </div>

              {/* Toggle 3: Digest */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold">Weekly Performance Digest</h4>
                  <p className="text-xs text-muted-foreground">Get a comprehensive email report of completed tasks and tracked hours.</p>
                </div>
                <button
                  onClick={() => setWeeklyDigest(!weeklyDigest)}
                  className={[
                    "h-6 w-11 rounded-full p-1 transition-colors relative focus:outline-none cursor-pointer",
                    weeklyDigest ? "bg-accent" : "bg-muted",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "block h-4 w-4 rounded-full bg-white transition-all shadow-sm",
                      weeklyDigest ? "translate-x-5" : "translate-x-0",
                    ].join(" ")}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
