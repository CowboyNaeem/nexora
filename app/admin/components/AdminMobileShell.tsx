"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Boxes,
  ChevronRight,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  Settings,
  Store,
  Tags,
  Users,
  X,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const primaryNavItems: NavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: PackageCheck,
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Boxes,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
  },
];

const secondaryNavItems: NavItem[] = [
  {
    href: "/admin/categories",
    label: "Categories",
    icon: Tags,
  },
];

export default function AdminMobileShell() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(`${href}/`);

  async function logout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Redirect even if logout request fails.
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <>
      {/* =========================================================
          MOBILE TOP HEADER
          ========================================================= */}
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#07090f]/95 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex h-[68px] max-w-md items-center justify-between px-4">
          {/* Menu */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open admin menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/70 transition active:scale-95"
          >
            <Menu size={20} strokeWidth={1.8} />
          </button>

          {/* Brand */}
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2"
            aria-label="NEXORA Admin Dashboard"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 text-sm font-bold shadow-[0_8px_22px_rgba(139,92,246,0.28)]">
              N
            </span>

            <span className="text-[14px] font-bold tracking-[0.22em] text-white">
              NEXORA
            </span>
          </button>

          {/* Notification */}
          <div
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/55"
          >
            <Bell size={17} strokeWidth={1.7} />
          </div>
        </div>
      </header>

      {/* =========================================================
          MOBILE DRAWER
          ========================================================= */}
      {open ? (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close admin menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
          />

          {/* Drawer */}
          <aside className="relative flex h-full w-[min(86vw,330px)] flex-col border-r border-white/[0.08] bg-[#0a0c12] shadow-[20px_0_70px_rgba(0,0,0,0.45)]">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-5">
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 text-base font-bold shadow-[0_8px_24px_rgba(139,92,246,0.25)]">
                  N
                </span>

                <span>
                  <span className="block text-[15px] font-bold tracking-[0.2em] text-white">
                    NEXORA
                  </span>

                  <span className="mt-1 block text-[9px] font-semibold tracking-[0.24em] text-slate-500">
                    ADMIN PANEL
                  </span>
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/55 transition active:scale-95"
              >
                <X size={18} strokeWidth={1.8} />
              </button>
            </div>

            {/* Drawer Navigation */}
            <nav
              className="flex-1 overflow-y-auto px-4 py-6"
              aria-label="Admin navigation"
            >
              {/* Primary */}
              <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600">
                Primary
              </p>

              <div className="mt-3 space-y-1.5">
                {primaryNavItems.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-12 items-center justify-between rounded-xl px-4 text-sm font-medium transition ${
                        active
                          ? "bg-violet-600/20 text-white shadow-[inset_0_0_0_1px_rgba(139,92,246,0.22)]"
                          : "text-slate-400 active:bg-white/[0.05] hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon
                          size={19}
                          strokeWidth={1.8}
                          className={
                            active
                              ? "text-violet-300"
                              : "text-slate-500"
                          }
                        />

                        {item.label}
                      </span>

                      <ChevronRight
                        size={15}
                        className={
                          active
                            ? "text-violet-300/70"
                            : "text-slate-700"
                        }
                      />
                    </Link>
                  );
                })}
              </div>

              {/* Quick Tools */}
              <p className="mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600">
                Quick Tools
              </p>

              <div className="mt-3 space-y-1.5">
                {secondaryNavItems.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-12 items-center justify-between rounded-xl px-4 text-sm font-medium transition ${
                        active
                          ? "bg-violet-600/20 text-white shadow-[inset_0_0_0_1px_rgba(139,92,246,0.22)]"
                          : "text-slate-400 active:bg-white/[0.05] hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon
                          size={19}
                          strokeWidth={1.8}
                          className={
                            active
                              ? "text-violet-300"
                              : "text-slate-500"
                          }
                        />

                        {item.label}
                      </span>

                      <ChevronRight
                        size={15}
                        className={
                          active
                            ? "text-violet-300/70"
                            : "text-slate-700"
                        }
                      />
                    </Link>
                  );
                })}
              </div>

              {/* Account */}
              <p className="mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600">
                Account
              </p>

              <div className="mt-3 space-y-1.5">
                <button
                  type="button"
                  disabled
                  className="flex min-h-12 w-full items-center justify-between rounded-xl px-4 text-left text-sm font-medium text-slate-500 opacity-70"
                >
                  <span className="flex items-center gap-3">
                    <Settings size={19} strokeWidth={1.8} />
                    Settings
                  </span>

                  <span className="text-[9px] uppercase tracking-wider text-slate-700">
                    Soon
                  </span>
                </button>

                <button
                  type="button"
                  disabled
                  className="flex min-h-12 w-full items-center justify-between rounded-xl px-4 text-left text-sm font-medium text-slate-500 opacity-70"
                >
                  <span className="flex items-center gap-3">
                    <CircleHelp size={19} strokeWidth={1.8} />
                    Help & Support
                  </span>

                  <span className="text-[9px] uppercase tracking-wider text-slate-700">
                    Soon
                  </span>
                </button>
              </div>
            </nav>

            {/* Drawer Footer */}
            <div className="border-t border-white/[0.07] p-4">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="mb-2 flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm text-slate-400 transition active:bg-white/[0.05] hover:bg-white/[0.04] hover:text-white"
              >
                <Store size={18} strokeWidth={1.8} />
                Back to Store
              </Link>

              <button
                type="button"
                onClick={logout}
                disabled={loggingOut}
                className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-red-400/10 bg-red-400/[0.035] px-4 text-sm font-medium text-red-300 transition active:scale-[0.99] disabled:opacity-50"
              >
                <LogOut size={18} strokeWidth={1.8} />

                {loggingOut ? "Signing out..." : "Sign out"}
              </button>

              <p className="px-1 pt-4 text-[9px] text-white/20">
                NEXORA · Admin Panel
              </p>
            </div>
          </aside>
        </div>
      ) : null}

      {/* =========================================================
          GLOBAL MOBILE BOTTOM NAVIGATION
          ========================================================= */}
      <nav
        aria-label="Primary mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-[#090b11]/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:hidden"
      >
        <div className="mx-auto flex w-full max-w-md items-stretch justify-between">
          {primaryNavItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition active:scale-95 ${
                  active
                    ? "text-violet-300"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <span
                  className={`flex h-8 w-10 items-center justify-center rounded-xl transition ${
                    active
                      ? "bg-violet-500/15 text-violet-300"
                      : "bg-transparent"
                  }`}
                >
                  <Icon size={19} strokeWidth={1.8} />
                </span>

                <span
                  className={`text-[9px] font-medium ${
                    active ? "text-violet-300" : "text-slate-500"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open more admin options"
            aria-expanded={open}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition active:scale-95 ${
              open
                ? "text-violet-300"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <span
              className={`flex h-8 w-10 items-center justify-center rounded-xl transition ${
                open
                  ? "bg-violet-500/15 text-violet-300"
                  : "bg-transparent"
              }`}
            >
              <Menu size={19} strokeWidth={1.8} />
            </span>

            <span
              className={`text-[9px] font-medium ${
                open ? "text-violet-300" : "text-slate-500"
              }`}
            >
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}