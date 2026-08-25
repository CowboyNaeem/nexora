"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";

type IconName =
  | "grid"
  | "orders"
  | "products"
  | "categories"
  | "users";

function Icon({
  name,
  size = 20,
}: {
  name: IconName;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );

    case "orders":
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );

    case "products":
      return (
        <svg {...common}>
          <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
          <path d="m4.5 7.5 7.5 4 7.5-4M12 11.5V21" />
        </svg>
      );

    case "categories":
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h16" />
          <circle cx="8" cy="6" r="2" />
          <circle cx="15" cy="12" r="2" />
          <circle cx="10" cy="18" r="2" />
        </svg>
      );

      case "users":
  return (
    <svg {...common}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6" />
      <path d="M16 5.5a3 3 0 0 1 0 5.5M17 14c2.5.5 3.8 2.3 4 5" />
    </svg>
  );

    default:
      return null;
  }
}

function SidebarLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: IconName;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex h-11 items-center gap-3 rounded-xl px-4 text-[14px] font-medium transition ${
        active
          ? "bg-violet-600/20 text-white shadow-[inset_0_0_0_1px_rgba(139,92,246,0.25)]"
          : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      <span
        className={`transition ${
          active
            ? "text-violet-300"
            : "text-slate-500 group-hover:text-slate-300"
        }`}
      >
        <Icon name={icon} size={19} />
      </span>

      <span>{label}</span>
    </Link>
  );
}

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-screen bg-[#080a0f] text-white">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden w-[250px] shrink-0 border-r border-white/[0.07] bg-[#0a0c12] lg:flex lg:flex-col">

          {/* LOGO */}
          <div className="px-5 pt-7">
            <Link
              href="/admin"
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 text-lg font-bold shadow-[0_8px_25px_rgba(124,58,237,0.25)]">
                N
              </div>

              <div>
                <div className="text-[21px] font-bold tracking-[0.22em] text-white">
                  NEXORA
                </div>

                <div className="mt-0.5 text-[10px] font-semibold tracking-[0.28em] text-slate-500">
                  ADMIN PANEL
                </div>
              </div>
            </Link>
          </div>

          <div className="mx-5 mt-7 h-px bg-white/[0.07]" />

          {/* NAVIGATION */}
          <nav className="flex-1 overflow-y-auto px-4 py-7">

            <p className="px-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600">
              Management
            </p>

            <div className="mt-3 space-y-1">

              <SidebarLink
                href="/admin"
                label="Dashboard"
                icon="grid"
                active={isActive("/admin")}
              />

              <SidebarLink
                href="/admin/orders"
                label="Orders"
                icon="orders"
                active={isActive("/admin/orders")}
              />

              <SidebarLink
                href="/admin/products"
                label="Products"
                icon="products"
                active={isActive("/admin/products")}
              />

              <SidebarLink
                href="/admin/categories"
                label="Categories"
                icon="categories"
                active={isActive("/admin/categories")}
              />
              <SidebarLink
  href="/admin/users"
  label="Users"
  icon="users"
  active={isActive("/admin/users")}
/>

            </div>
          </nav>

          {/* HELP */}
          <div className="mx-4 mb-5 rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-4">
            <p className="text-sm font-medium text-white">
              Need Help?
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Contact the Nexora support team.
            </p>
          </div>

        </aside>

        {/* MAIN CONTENT */}
        <main className="min-w-0 flex-1">
          {children}
        </main>

      </div>
    </div>
  );
}