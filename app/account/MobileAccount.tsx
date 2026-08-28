"use client";

import Link from "next/link";
import MobileBottomNav from "@/app/components/MobileBottomNav";

type User = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  avatar?: string | null;
  role?: string | null;
  status?: string | null;
  createdAt?: string | null;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string | number;
  createdAt: string;
  items?: Array<{
    id: string;
    productName: string;
    quantity: number;
    totalPrice: string | number;
  }>;
};

type MobileAccountProps = {
  user: User;
  orders: Order[];
  wishlistCount: number;
  cartCount: number;
  totalSpent: number;
  accountInitial: string;
  formatMoney: (value: number) => string;
  formatDate: (value?: string | null) => string;
  formatStatus: (status: string) => string;
};

export default function MobileAccount({
  user,
  orders,
  wishlistCount,
  cartCount,
  totalSpent,
  accountInitial,
  formatMoney,
  formatDate,
  formatStatus,
}: MobileAccountProps) {
  const isAdmin = user.role === "ADMIN";

  return (
    <main className="min-h-screen bg-[#070709] pb-28 text-white">

      {/* =====================================================
          AMBIENT BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-violet-600/[0.08] blur-[100px]" />

        <div className="absolute -right-32 top-[45%] h-72 w-72 rounded-full bg-indigo-600/[0.07] blur-[100px]" />
      </div>

      <div className="mx-auto max-w-md px-5">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="flex items-center justify-between py-5">

          <Link
            href="/"
            aria-label="Back to home"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/70 transition active:scale-95"
          >
            ←
          </Link>

          <div className="text-center">
            <p className="text-[9px] font-semibold tracking-[0.3em] text-violet-400">
              NEXORA
            </p>

            <h1 className="mt-1 text-[16px] font-semibold">
              My Account
            </h1>
          </div>

          <Link
            href="/settings"
            aria-label="Account settings"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/60 transition active:scale-95"
          >
            ⚙
          </Link>

        </header>

        {/* =====================================================
            PROFILE CARD
        ===================================================== */}

        <section className="overflow-hidden rounded-[26px] border border-white/[0.08] bg-white/[0.025]">

          <div className="p-5">

            <div className="flex items-center gap-4">

              {/* Avatar */}

              <div className="relative shrink-0">

                <div className="flex h-[62px] w-[62px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-2xl font-bold shadow-lg shadow-violet-500/15">

                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || "Account"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    accountInitial
                  )}

                </div>

                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#111114] bg-violet-500 text-[8px]">
                  ✓
                </span>

              </div>

              {/* User */}

              <div className="min-w-0 flex-1">

                <div className="flex items-center gap-2">

                  <h2 className="truncate text-base font-semibold">
                    {user.name || "Nexora User"}
                  </h2>

                  {isAdmin && (
                    <span className="shrink-0 rounded-full bg-violet-500/10 px-2 py-1 text-[7px] font-semibold uppercase tracking-wider text-violet-300">
                      Admin
                    </span>
                  )}

                </div>

                <p className="mt-1 truncate text-[10px] text-white/35">
                  {user.email}
                </p>

                {user.phone && (
                  <p className="mt-1 text-[9px] text-white/25">
                    {user.phone}
                  </p>
                )}

              </div>

            </div>

            <Link
              href="/settings"
              className="mt-5 flex w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] py-3 text-[10px] font-medium text-white/60 transition active:scale-[0.99]"
            >
              Edit profile →
            </Link>

          </div>

          {/* Member strip */}

          <div className="border-t border-white/[0.06] px-5 py-4">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[8px] uppercase tracking-[0.18em] text-white/25">
                  Member since
                </p>

                <p className="mt-1 text-[10px] text-white/60">
                  {formatDate(user.createdAt)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[8px] uppercase tracking-[0.18em] text-white/25">
                  Status
                </p>

                <p className="mt-1 text-[10px] text-emerald-400">
                  {user.status || "Active"}
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            NEXORA CLUB
        ===================================================== */}

        <section className="mt-4 overflow-hidden rounded-[22px] border border-violet-400/20 bg-gradient-to-r from-violet-600/[0.15] to-indigo-600/[0.08]">

          <div className="flex items-center gap-4 p-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-xl text-violet-300">
              ◇
            </div>

            <div className="min-w-0 flex-1">

              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-violet-300">
                NEXORA CLUB
              </p>

              <p className="mt-1 text-xs font-medium">
                Member benefits
              </p>

              <p className="mt-1 text-[9px] text-white/30">
                Exclusive offers & faster shopping
              </p>

            </div>

            <span className="text-xs text-violet-300">
              →
            </span>

          </div>

        </section>

        {/* =====================================================
            ACCOUNT OVERVIEW
        ===================================================== */}

        <section className="mt-7">

          <div className="flex items-end justify-between">

            <div>

              <p className="text-[9px] font-semibold tracking-[0.22em] text-violet-400">
                OVERVIEW
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                Your activity
              </h2>

            </div>

          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">

            <MobileStat
              label="Orders"
              value={orders.length.toString()}
              icon="□"
              href="/orders"
            />

            <MobileStat
              label="Wishlist"
              value={wishlistCount.toString()}
              icon="♡"
              href="/wishlist"
            />

            <MobileStat
              label="Cart"
              value={cartCount.toString()}
              icon="◇"
              href="/cart"
            />

            <MobileStat
              label="Total spent"
              value={formatMoney(totalSpent)}
              icon="৳"
              href="/orders"
            />

          </div>

        </section>

        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}

        <section className="mt-7">

          <p className="text-[9px] font-semibold tracking-[0.22em] text-violet-400">
            QUICK ACCESS
          </p>

          <div className="mt-3 overflow-hidden rounded-[22px] border border-white/[0.08] bg-white/[0.02]">

            <MobileAction
              href="/orders"
              icon="□"
              title="My Orders"
              description="Track your purchases"
            />

            <MobileAction
              href="/wishlist"
              icon="♡"
              title="Wishlist"
              description={`${wishlistCount} saved products`}
            />

            <MobileAction
              href="/cart"
              icon="◇"
              title="Shopping Cart"
              description={`${cartCount} items in your cart`}
            />

            <MobileAction
              href="/settings"
              icon="⚙"
              title="Account Settings"
              description="Manage your preferences"
            />

          </div>

        </section>

        {/* =====================================================
            ADMIN
        ===================================================== */}

        {isAdmin && (
          <section className="mt-7 overflow-hidden rounded-[22px] border border-violet-400/15 bg-violet-500/[0.05]">

            <div className="p-5">

              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                NEXORA ADMIN
              </p>

              <h2 className="mt-2 text-lg font-semibold">
                Store management
              </h2>

              <p className="mt-2 text-[10px] leading-5 text-white/35">
                Manage products, orders, categories and
                users from the admin dashboard.
              </p>

              <Link
                href="/admin"
                className="mt-4 flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-[10px] font-semibold transition active:scale-[0.99]"
              >
                Open Admin Panel →
              </Link>

            </div>

          </section>
        )}

        {/* =====================================================
            RECENT ORDERS
        ===================================================== */}

        <section className="mt-8">

          <div className="flex items-end justify-between">

            <div>

              <p className="text-[9px] font-semibold tracking-[0.22em] text-violet-400">
                ACTIVITY
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Recent orders
              </h2>

            </div>

            <Link
              href="/orders"
              className="text-[10px] text-violet-300"
            >
              View all →
            </Link>

          </div>

          <div className="mt-4 overflow-hidden rounded-[22px] border border-white/[0.08] bg-white/[0.02]">

            {orders.length === 0 ? (
              <div className="px-5 py-10 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] text-white/25">
                  □
                </div>

                <p className="mt-4 text-xs text-white/45">
                  No orders yet
                </p>

                <Link
                  href="/products"
                  className="mt-4 inline-flex rounded-xl bg-violet-500 px-5 py-2.5 text-[10px] font-semibold transition active:scale-[0.98]"
                >
                  Start shopping
                </Link>

              </div>
            ) : (
              orders.slice(0, 3).map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block border-b border-white/[0.06] p-4 last:border-b-0 active:bg-white/[0.03]"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <p className="text-xs font-semibold">
                        {order.orderNumber}
                      </p>

                      <p className="mt-1 text-[9px] text-white/25">
                        {formatDate(order.createdAt)}
                      </p>

                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[8px] font-medium ${statusClass(
                        order.status,
                      )}`}
                    >
                      {formatStatus(order.status)}
                    </span>

                  </div>

                  <div className="mt-4 flex items-center justify-between">

                    <p className="text-[9px] text-white/30">
                      {order.items?.length || 0}{" "}
                      {order.items?.length === 1
                        ? "item"
                        : "items"}
                    </p>

                    <p className="text-sm font-semibold">
                      {formatMoney(
                        Number(
                          order.totalAmount || 0,
                        ),
                      )}
                    </p>

                  </div>

                </Link>
              ))
            )}

          </div>

        </section>

        {/* =====================================================
            TRUST
        ===================================================== */}

        <section className="mt-7 grid grid-cols-3 gap-2">

          <TrustItem
            icon="◇"
            title="Secure"
            subtitle="Protected"
          />

          <TrustItem
            icon="↗"
            title="Fast"
            subtitle="Delivery"
          />

          <TrustItem
            icon="✓"
            title="Support"
            subtitle="24/7"
          />

        </section>

        {/* =====================================================
            LOGOUT
        ===================================================== */}

        <button
          type="button"
          onClick={async () => {
            try {
              await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
              });

              window.location.href = "/login";
            } catch {
              window.location.href = "/login";
            }
          }}
          className="mt-7 w-full rounded-2xl border border-red-400/15 bg-red-400/[0.03] py-4 text-[10px] font-medium text-red-300 transition active:scale-[0.99]"
        >
          Sign out
        </button>

        <p className="pb-5 pt-6 text-center text-[8px] text-white/15">
          NEXORA · Discover. Choose. Own.
        </p>

      </div>

      {/* =====================================================
          SHARED MOBILE BOTTOM NAVIGATION
      ===================================================== */}

      <MobileBottomNav />

    </main>
  );
}

/* ============================================================
   STAT
============================================================ */

function MobileStat({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: string;
  icon: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[20px] border border-white/[0.07] bg-white/[0.025] p-4 transition active:scale-[0.98]"
    >

      <div className="flex items-start justify-between">

        <p className="text-[9px] uppercase tracking-[0.14em] text-white/25">
          {label}
        </p>

        <span className="text-sm text-violet-300">
          {icon}
        </span>

      </div>

      <p className="mt-4 truncate text-xl font-semibold tracking-tight">
        {value}
      </p>

    </Link>
  );
}

/* ============================================================
   ACTION
============================================================ */

function MobileAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 border-b border-white/[0.06] p-4 last:border-b-0 active:bg-white/[0.03]"
    >

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/[0.08] text-sm text-violet-300">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-xs font-medium">
          {title}
        </p>

        <p className="mt-1 truncate text-[9px] text-white/25">
          {description}
        </p>

      </div>

      <span className="text-xs text-white/20">
        →
      </span>

    </Link>
  );
}

/* ============================================================
   TRUST
============================================================ */

function TrustItem({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-2 py-3 text-center">

      <div className="text-sm text-violet-300">
        {icon}
      </div>

      <p className="mt-1 text-[9px] font-medium text-white/55">
        {title}
      </p>

      <p className="mt-0.5 text-[8px] text-white/20">
        {subtitle}
      </p>

    </div>
  );
}

/* ============================================================
   STATUS
============================================================ */

function statusClass(status: string) {
  switch (status) {
    case "DELIVERED":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "SHIPPED":
      return "border-sky-400/20 bg-sky-400/10 text-sky-300";

    case "IN_TRANSIT":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";

    case "PROCESSING":
      return "border-violet-400/20 bg-violet-400/10 text-violet-300";

    case "CONFIRMED":
      return "border-blue-400/20 bg-blue-400/10 text-blue-300";

    case "CANCELLED":
      return "border-red-400/20 bg-red-400/10 text-red-300";

    case "REFUNDED":
      return "border-orange-400/20 bg-orange-400/10 text-orange-300";

    default:
      return "border-yellow-400/20 bg-yellow-400/10 text-yellow-300";
  }
}