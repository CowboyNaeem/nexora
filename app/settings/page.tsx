"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role?: string | null;
  status?: string | null;
  createdAt?: string | null;
};

type ProfileResponse = {
  success: boolean;
  user?: User;
  message?: string;
};

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [logoutError, setLogoutError] = useState("");

  const [notifications, setNotifications] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        setLoading(true);
        setProfileError("");

        const response = await fetch("/api/auth/profile", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data: ProfileResponse = await response.json();

        if (!response.ok || !data.success || !data.user) {
          throw new Error(
            data.message || "Unable to load account information.",
          );
        }

        if (!mounted) return;

        setUser(data.user);
        setName(data.user.name || "");
        setPhone(data.user.phone || "");
      } catch (error) {
        console.error("Settings profile loading error:", error);

        if (mounted) {
          setProfileError(
            error instanceof Error
              ? error.message
              : "Unable to load account information.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    if (typeof window !== "undefined") {
      setNotifications(
        localStorage.getItem("nexora_notifications") !== "false",
      );

      setMarketing(
        localStorage.getItem("nexora_marketing") === "true",
      );

      setCompactMode(
        localStorage.getItem("nexora_compact") === "true",
      );
    }

    return () => {
      mounted = false;
    };
  }, []);

  const isAdmin = user?.role === "ADMIN";

  const accountInitial = useMemo(() => {
    return user?.name?.trim()?.charAt(0)?.toUpperCase() || "N";
  }, [user]);

  const formattedRole = useMemo(() => {
    if (!user?.role) return "Customer";

    return user.role
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }, [user]);

  async function handleProfileSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setProfileMessage("");
    setProfileError("");

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setProfileError("Please enter your name.");
      return;
    }

    if (trimmedName.length < 2) {
      setProfileError("Your name must contain at least 2 characters.");
      return;
    }

    setSavingProfile(true);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          phone: trimmedPhone,
        }),
      });

      const data: ProfileResponse = await response.json();

      if (!response.ok || !data.success || !data.user) {
        throw new Error(
          data.message || "Unable to update your profile.",
        );
      }

      setUser(data.user);
      setName(data.user.name || "");
      setPhone(data.user.phone || "");

      setProfileMessage(
        "Your profile has been updated successfully.",
      );
    } catch (error) {
      console.error("Profile update error:", error);

      setProfileError(
        error instanceof Error
          ? error.message
          : "Unable to update your profile.",
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }

    if (!newPassword) {
      setPasswordError("Please enter your new password.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters.",
      );
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError(
        "Your new password must be different from your current password.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to change your password.",
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordMessage(
        "Your password has been changed successfully.",
      );
    } catch (error) {
      console.error("Password change error:", error);

      setPasswordError(
        error instanceof Error
          ? error.message
          : "Unable to change your password.",
      );
    } finally {
      setChangingPassword(false);
    }
  }

  function toggleNotifications() {
    const next = !notifications;

    setNotifications(next);
    localStorage.setItem(
      "nexora_notifications",
      String(next),
    );
  }

  function toggleMarketing() {
    const next = !marketing;

    setMarketing(next);
    localStorage.setItem(
      "nexora_marketing",
      String(next),
    );
  }

  function toggleCompactMode() {
    const next = !compactMode;

    setCompactMode(next);
    localStorage.setItem(
      "nexora_compact",
      String(next),
    );
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to log out.",
        );
      }

      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);

      setLogoutError(
        error instanceof Error
          ? error.message
          : "Unable to log out.",
      );

      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070709] px-5 py-10 text-white sm:px-8">
        <div className="mx-auto max-w-[980px] animate-pulse">
          <div className="h-9 w-36 rounded-xl bg-white/10" />

          <div className="mt-14">
            <div className="h-3 w-28 rounded bg-white/10" />
            <div className="mt-4 h-12 w-64 rounded-xl bg-white/10" />
            <div className="mt-4 h-4 w-96 max-w-full rounded bg-white/10" />
          </div>

          <div className="mt-10 h-72 rounded-3xl bg-white/[0.035]" />

          <div className="mt-6 h-56 rounded-3xl bg-white/[0.035]" />

          <div className="mt-6 h-80 rounded-3xl bg-white/[0.035]" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070709] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-180px] top-[8%] h-[430px] w-[430px] rounded-full bg-violet-600/[0.08] blur-[120px]" />

        <div className="absolute right-[-180px] top-[38%] h-[430px] w-[430px] rounded-full bg-indigo-600/[0.07] blur-[120px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.08),transparent_38%)]" />

        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:60px_60px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#070709]/90 backdrop-blur-2xl">
        <div className="mx-auto flex min-h-[72px] max-w-[980px] items-center justify-between px-5 sm:px-8 lg:px-0">
          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-black shadow-lg shadow-violet-500/20 transition group-hover:scale-105">
              N
            </span>

            <span className="text-[15px] font-bold tracking-[0.24em]">
              NEXORA
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-2.5 text-xs font-medium text-violet-200 transition hover:border-violet-400/30 hover:bg-violet-500/15 sm:inline-flex"
              >
                Admin Panel
              </Link>
            )}

            <Link
              href="/account"
              className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-2.5 text-xs text-white/45 transition hover:border-white/[0.13] hover:bg-white/[0.04] hover:text-white"
            >
              ← My account
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[980px] px-5 py-12 sm:px-8 lg:px-0 lg:py-16">
        {/* Page heading */}
        <section>
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-violet-400">
                {isAdmin ? "ADMINISTRATION" : "ACCOUNT SETTINGS"}
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                {isAdmin ? "Admin Settings" : "Settings"}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/35">
                {isAdmin
                  ? "Manage your administrator profile, security and marketplace controls."
                  : "Manage your profile, security and Nexora shopping preferences from one place."}
              </p>
            </div>

            {user && (
              <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-bold">
                  {accountInitial}
                </div>

                <div>
                  <p className="max-w-[150px] truncate text-xs font-semibold text-white/80">
                    {user.name}
                  </p>

                  <p className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-white/25">
                    {formattedRole}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Account overview */}
        <section className="mt-10 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.018] shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex min-w-0 items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-2xl font-bold shadow-xl shadow-violet-600/15">
                {accountInitial}
              </div>

              <div className="min-w-0">
                <p className="truncate text-xl font-semibold tracking-tight">
                  {user?.name || "Nexora User"}
                </p>

                <p className="mt-1 break-all text-sm text-white/35">
                  {user?.email}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-violet-300">
                    {formattedRole}
                  </span>

                  {user?.status && (
                    <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-emerald-300">
                      {user.status}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(124,58,237,0.18)] transition hover:bg-violet-500"
              >
                Open Admin Panel →
              </Link>
            )}
          </div>

          <div className="grid border-t border-white/[0.06] sm:grid-cols-3">
            <InfoCell
              label="Account type"
              value={formattedRole}
            />

            <InfoCell
              label="Email"
              value={user?.email || "—"}
              border
            />

            <InfoCell
              label="Phone"
              value={user?.phone || "Not added"}
            />
          </div>
        </section>

        {/* Profile */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.018]">
          <SectionHeader
            eyebrow="PROFILE"
            title="Personal information"
            description="Update the information associated with your Nexora account."
          />

          <form
            onSubmit={handleProfileSubmit}
            className="space-y-6 px-6 py-7 sm:px-7"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="account-name"
                  className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30"
                >
                  Full name
                </label>

                <input
                  id="account-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Your name"
                  autoComplete="name"
                  className="mt-2 w-full rounded-xl border border-white/[0.09] bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-violet-400/40 focus:bg-black/40"
                />
              </div>

              <div>
                <label
                  htmlFor="account-phone"
                  className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30"
                >
                  Phone number
                </label>

                <input
                  id="account-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="01XXXXXXXXX"
                  autoComplete="tel"
                  className="mt-2 w-full rounded-xl border border-white/[0.09] bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-violet-400/40 focus:bg-black/40"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="account-email"
                className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30"
              >
                Email address
              </label>

              <input
                id="account-email"
                type="email"
                value={user?.email || ""}
                disabled
                className="mt-2 w-full cursor-not-allowed rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white/35 outline-none"
              />

              <p className="mt-2 text-[10px] text-white/20">
                Your email address cannot be changed here.
              </p>
            </div>

            {profileError && (
              <MessageBox
                type="error"
                message={profileError}
              />
            )}

            {profileMessage && (
              <MessageBox
                type="success"
                message={profileMessage}
              />
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-xl bg-violet-600 px-6 py-3 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(124,58,237,0.18)] transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingProfile ? (
                  <span className="flex items-center gap-2">
                    <Spinner />
                    Saving...
                  </span>
                ) : (
                  "Save changes"
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Notifications */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.018]">
          <SectionHeader
            eyebrow="NOTIFICATIONS"
            title="Communication preferences"
            description="Control which types of updates you want to receive."
          />

          <div>
            <SettingRow
              title="Order notifications"
              description="Keep important updates about your orders enabled."
              enabled={notifications}
              onToggle={toggleNotifications}
            />

            <SettingRow
              title="Product updates"
              description="Receive information about new products, offers and marketplace updates."
              enabled={marketing}
              onToggle={toggleMarketing}
            />
          </div>
        </section>

        {/* Experience */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.018]">
          <SectionHeader
            eyebrow="EXPERIENCE"
            title="Shopping experience"
            description="Customize how Nexora behaves on this device."
          />

          <div>
            <SettingRow
              title="Compact layout"
              description="Use a more compact presentation across supported storefront sections."
              enabled={compactMode}
              onToggle={toggleCompactMode}
            />

            <div className="flex items-center justify-between gap-5 border-t border-white/[0.06] px-6 py-5 sm:px-7">
              <div>
                <p className="text-sm font-medium">
                  Theme
                </p>

                <p className="mt-1 text-xs text-white/30">
                  Nexora currently uses the dark interface.
                </p>
              </div>

              <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-[9px] font-medium text-violet-300">
                DARK
              </span>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.018]">
          <SectionHeader
            eyebrow="SECURITY"
            title="Change password"
            description="Use your current password to set a new password."
          />

          <form
            onSubmit={handlePasswordSubmit}
            className="space-y-6 px-6 py-7 sm:px-7"
          >
            <PasswordField
              id="current-password"
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Enter current password"
              autoComplete="current-password"
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <PasswordField
                id="new-password"
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />

              <PasswordField
                id="confirm-password"
                label="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Repeat new password"
                autoComplete="new-password"
              />
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] px-4 py-3">
              <p className="text-[10px] leading-5 text-white/25">
                For security, your password is never displayed or
                stored in plain text. Use a strong password that you
                do not reuse elsewhere.
              </p>
            </div>

            {passwordError && (
              <MessageBox
                type="error"
                message={passwordError}
              />
            )}

            {passwordMessage && (
              <MessageBox
                type="success"
                message={passwordMessage}
              />
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={changingPassword}
                className="rounded-xl border border-violet-400/20 bg-violet-500/10 px-6 py-3 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {changingPassword ? (
                  <span className="flex items-center gap-2">
                    <Spinner />
                    Updating...
                  </span>
                ) : (
                  "Change password"
                )}
              </button>
            </div>
          </form>
        </section>

        {/* =====================================================
            ROLE-AWARE QUICK ACCESS
        ===================================================== */}

        <section className="mt-6 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.018]">
          <SectionHeader
            eyebrow={isAdmin ? "ADMINISTRATION" : "QUICK ACCESS"}
            title={
              isAdmin
                ? "Admin quick access"
                : "Account shortcuts"
            }
            description={
              isAdmin
                ? "Jump directly to the areas you manage most often."
                : "Quick access to the areas you use most."
            }
          />

          {isAdmin ? (
            <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
              <NavigationCard
                href="/admin"
                title="Dashboard"
                description="View your marketplace overview."
                icon="⌂"
                accent
              />

              <NavigationCard
                href="/admin/orders"
                title="Orders"
                description="Manage customer orders and fulfillment."
                icon="▤"
                accent
              />

              <NavigationCard
                href="/admin/products"
                title="Products"
                description="Manage your product catalog."
                icon="◈"
                accent
              />

              <NavigationCard
                href="/admin/categories"
                title="Categories"
                description="Organize and manage product categories."
                icon="◫"
                accent
              />

              <NavigationCard
                href="/admin/users"
                title="Users"
                description="Manage customer and platform users."
                icon="◎"
                accent
              />

              <NavigationCard
                href="/account"
                title="My account"
                description="View your personal account information."
                icon="○"
              />
            </div>
          ) : (
            <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
              <NavigationCard
                href="/account"
                title="My account"
                description="View your profile and account overview."
                icon="◎"
              />

              <NavigationCard
                href="/orders"
                title="My orders"
                description="View and track your purchases."
                icon="▤"
              />

              <NavigationCard
                href="/wishlist"
                title="Wishlist"
                description="View your saved products."
                icon="♡"
              />

              <NavigationCard
                href="/cart"
                title="Shopping cart"
                description="Review products in your cart."
                icon="□"
              />

              <NavigationCard
                href="/"
                title="Continue shopping"
                description="Return to the Nexora storefront."
                icon="→"
              />
            </div>
          )}
        </section>

        {/* Admin storefront access */}
        {isAdmin && (
          <section className="mt-6 overflow-hidden rounded-3xl border border-violet-400/[0.12] bg-violet-500/[0.025]">
            <div className="flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                  STOREFRONT
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  Shop as a customer
                </h2>

                <p className="mt-1 max-w-xl text-xs leading-5 text-white/30">
                  The administrator account can still use the Nexora
                  storefront for testing and customer-experience review.
                </p>
              </div>

              <Link
                href="/"
                className="inline-flex shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 px-5 py-3 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/20"
              >
                Open storefront →
              </Link>
            </div>
          </section>
        )}

        {/* Logout */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-red-400/[0.12] bg-red-400/[0.025]">
          <div className="flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-red-300/70">
                SESSION
              </p>

              <h2 className="mt-1 text-lg font-semibold">
                Sign out of Nexora
              </h2>

              <p className="mt-1 text-xs leading-5 text-white/30">
                Sign out from this account on this device.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-red-400/20 bg-red-400/[0.06] px-5 py-3 text-xs font-semibold text-red-300 transition hover:bg-red-400/[0.10] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Signing out...
                </span>
              ) : (
                "Sign out"
              )}
            </button>
          </div>

          {logoutError && (
            <div className="border-t border-red-400/[0.10] px-6 py-4 sm:px-7">
              <p className="text-xs text-red-300">
                {logoutError}
              </p>
            </div>
          )}
        </section>

        <footer className="mt-14 border-t border-white/[0.06] pt-7 text-[10px] text-white/20">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>NEXORA · {isAdmin ? "Admin Settings" : "Account Settings"}</span>

            <span>
              {isAdmin
                ? "Administrator account"
                : "Customer account"}
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}

/* ============================================================
   SECTION HEADER
============================================================ */

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-white/[0.06] px-6 py-5 sm:px-7">
      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-400">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-lg font-semibold">
        {title}
      </h2>

      <p className="mt-1 text-xs leading-5 text-white/30">
        {description}
      </p>
    </div>
  );
}

/* ============================================================
   INFO CELL
============================================================ */

function InfoCell({
  label,
  value,
  border = false,
}: {
  label: string;
  value: string;
  border?: boolean;
}) {
  return (
    <div
      className={`px-6 py-5 ${
        border
          ? "border-b border-white/[0.06] sm:border-b-0 sm:border-r"
          : ""
      }`}
    >
      <p className="text-[9px] uppercase tracking-[0.18em] text-white/25">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-medium text-white/70">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   MESSAGE BOX
============================================================ */

function MessageBox({
  type,
  message,
}: {
  type: "error" | "success";
  message: string;
}) {
  if (type === "error") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3">
        <span className="mt-0.5 text-xs text-red-300">
          !
        </span>

        <p className="text-xs leading-5 text-red-300">
          {message}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-3">
      <span className="mt-0.5 text-xs text-emerald-300">
        ✓
      </span>

      <p className="text-xs leading-5 text-emerald-300">
        {message}
      </p>
    </div>
  );
}

/* ============================================================
   PASSWORD FIELD
============================================================ */

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30"
      >
        {label}
      </label>

      <input
        id={id}
        type="password"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-white/[0.09] bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-violet-400/40 focus:bg-black/40"
      />
    </div>
  );
}

/* ============================================================
   SETTING ROW
============================================================ */

function SettingRow({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-white/[0.06] px-6 py-5 last:border-b-0 sm:px-7">
      <div className="min-w-0">
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="mt-1 max-w-xl text-xs leading-5 text-white/30">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-label={`${title}: ${
          enabled ? "on" : "off"
        }`}
        aria-pressed={enabled}
        className={`relative h-6 w-11 shrink-0 rounded-full border transition ${
          enabled
            ? "border-violet-400/40 bg-violet-500/70"
            : "border-white/10 bg-white/[0.06]"
        }`}
      >
        <span
          className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow transition-all ${
            enabled
              ? "left-[22px]"
              : "left-[3px]"
          }`}
        />
      </button>
    </div>
  );
}

/* ============================================================
   NAVIGATION CARD
============================================================ */

function NavigationCard({
  href,
  title,
  description,
  icon,
  accent = false,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 ${
        accent
          ? "border-violet-400/20 bg-violet-500/[0.06] hover:border-violet-400/30 hover:bg-violet-500/[0.10]"
          : "border-white/[0.08] bg-white/[0.018] hover:border-white/[0.14] hover:bg-white/[0.035]"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${
            accent
              ? "bg-violet-500/15 text-violet-300"
              : "bg-white/[0.04] text-white/45"
          }`}
        >
          {icon}
        </span>

        <span className="text-xs text-white/15 transition group-hover:translate-x-1 group-hover:text-white/50">
          →
        </span>
      </div>

      <p className="mt-5 text-sm font-semibold">
        {title}
      </p>

      <p className="mt-1 text-[10px] leading-5 text-white/25">
        {description}
      </p>
    </Link>
  );
}

/* ============================================================
   SPINNER
============================================================ */

function Spinner() {
  return (
    <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}