"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

type OrdersResponse = {
  success: boolean;
  orders?: Order[];
  message?: string;
};

type WishlistResponse = {
  success: boolean;
  items?: Array<{
    productId: string;
  }>;
  message?: string;
};

type CartResponse = {
  success: boolean;
  cart?: {
    items?: unknown[];
  };
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadAccount() {
      try {
        setLoading(true);
        setError("");

        const [
          userResponse,
          ordersResponse,
          wishlistResponse,
          cartResponse,
        ] = await Promise.all([
          fetch("/api/auth/me", {
            credentials: "include",
            cache: "no-store",
          }),

          fetch("/api/orders", {
            credentials: "include",
            cache: "no-store",
          }),

          fetch("/api/wishlist", {
            credentials: "include",
            cache: "no-store",
          }),

          fetch("/api/cart", {
            credentials: "include",
            cache: "no-store",
          }),
        ]);

        if (!userResponse.ok) {
          throw new Error("Please sign in to view your account.");
        }

        const userData = await userResponse.json();

        if (!userData?.success || !userData?.user) {
          throw new Error("Unable to load your account.");
        }

        const ordersData: OrdersResponse = ordersResponse.ok
          ? await ordersResponse.json()
          : { success: false };

        const wishlistData: WishlistResponse = wishlistResponse.ok
          ? await wishlistResponse.json()
          : { success: false };

        const cartData: CartResponse = cartResponse.ok
          ? await cartResponse.json()
          : { success: false };

        if (!mounted) return;

        setUser(userData.user);

        setOrders(
          ordersData.success && Array.isArray(ordersData.orders)
            ? ordersData.orders
            : [],
        );

        setWishlistCount(
          wishlistData.success && Array.isArray(wishlistData.items)
            ? wishlistData.items.length
            : 0,
        );

        setCartCount(
          cartData.success && cartData.cart?.items
            ? cartData.cart.items.length
            : 0,
        );
      } catch (err) {
        console.error("Account loading error:", err);

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your account.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAccount();

    return () => {
      mounted = false;
    };
  }, []);

  const isAdmin = user?.role === "ADMIN";

  const accountInitial = useMemo(() => {
    return user?.name?.trim()?.charAt(0)?.toUpperCase() || "N";
  }, [user]);

  const totalSpent = useMemo(() => {
    return orders.reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0,
    );
  }, [orders]);

  const formatMoney = (value: number) => {
    return `৳${value.toFixed(2)}`;
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatStatus = (status: string) => {
    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070709] px-5 py-10 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1100px] animate-pulse">
          <div className="h-4 w-28 rounded bg-white/10" />
          <div className="mt-8 h-12 w-72 rounded bg-white/10" />

          <div className="mt-8 h-40 rounded-3xl bg-white/[0.035]" />

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="h-28 rounded-2xl bg-white/[0.035]" />
            <div className="h-28 rounded-2xl bg-white/[0.035]" />
            <div className="h-28 rounded-2xl bg-white/[0.035]" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="min-h-screen bg-[#070709] px-5 py-10 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[700px]">
          <Link
            href="/"
            className="text-sm text-white/40 transition hover:text-white"
          >
            ← Back to shop
          </Link>

          <div className="mt-10 rounded-3xl border border-red-400/20 bg-red-400/[0.04] p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-red-300">
              Account unavailable
            </p>

            <h1 className="mt-3 text-2xl font-semibold">
              {error || "Please sign in"}
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/40">
              Sign in to access your Nexora account, orders and saved
              products.
            </p>

            <Link
              href="/login"
              className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-xs font-semibold text-black transition hover:bg-white/90"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070709] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-160px] top-[10%] h-[420px] w-[420px] rounded-full bg-violet-600/[0.08] blur-[110px]" />

        <div className="absolute right-[-160px] top-[40%] h-[420px] w-[420px] rounded-full bg-indigo-600/[0.07] blur-[110px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.07),transparent_38%)]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#070709]/90 backdrop-blur-2xl">
        <div className="mx-auto flex min-h-[70px] max-w-[1100px] items-center justify-between px-5 sm:px-8 lg:px-0">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-black shadow-lg shadow-violet-500/20">
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
                className="hidden rounded-xl border border-violet-400/20 bg-violet-500/[0.08] px-4 py-2.5 text-xs font-medium text-violet-200 transition hover:border-violet-400/40 hover:bg-violet-500/[0.14] sm:inline-flex"
              >
                Admin Panel →
              </Link>
            )}

            <Link
              href="/"
              className="text-xs text-white/40 transition hover:text-white"
            >
              Continue shopping →
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1100px] px-5 py-12 sm:px-8 lg:px-0 lg:py-16">
        {/* Heading */}
        <div>
          <p className="text-[9px] font-semibold tracking-[0.22em] text-violet-400">
            YOUR ACCOUNT
          </p>

          <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                Welcome back, {user.name?.split(" ")[0] || "there"}.
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/35">
                Manage your profile, orders and saved products from one place.
              </p>
            </div>

            {isAdmin && (
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-3.5 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-violet-300">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.8)]" />
                Administrator
              </div>
            )}
          </div>
        </div>

        {/* Profile */}
        <section className="mt-10 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.018]">
          <div className="flex flex-col gap-7 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex min-w-0 items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-3xl font-bold shadow-xl shadow-violet-600/15">
                {accountInitial}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-2xl font-semibold tracking-tight">
                    {user.name || "Nexora User"}
                  </p>

                  {isAdmin && (
                    <span className="rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-violet-300">
                      Admin
                    </span>
                  )}
                </div>

                <p className="mt-1 break-all text-sm text-white/35">
                  {user.email}
                </p>

                {user.phone && (
                  <p className="mt-1 text-xs text-white/25">
                    {user.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/settings"
                className="inline-flex shrink-0 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.025] px-5 py-3 text-xs font-medium text-white/60 transition hover:border-white/15 hover:bg-white/[0.05] hover:text-white"
              >
                Account settings
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-violet-600/15 transition hover:brightness-110"
                >
                  Open Admin Panel
                </Link>
              )}
            </div>
          </div>

          <div className="grid border-t border-white/[0.06] sm:grid-cols-3">
            <div className="border-b border-white/[0.06] px-6 py-5 sm:border-b-0 sm:border-r">
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                Member since
              </p>

              <p className="mt-2 text-sm font-medium text-white/70">
                {formatDate(user.createdAt)}
              </p>
            </div>

            <div className="border-b border-white/[0.06] px-6 py-5 sm:border-b-0 sm:border-r">
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                Account
              </p>

              <p className="mt-2 text-sm font-medium text-white/70">
                {user.role
                  ? formatStatus(String(user.role))
                  : "Customer"}
              </p>
            </div>

            <div className="px-6 py-5">
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                Email
              </p>

              <p className="mt-2 truncate text-sm font-medium text-white/70">
                {user.email}
              </p>
            </div>
          </div>
        </section>

        {/* Admin shortcut */}
        {isAdmin && (
          <section className="mt-6 overflow-hidden rounded-3xl border border-violet-400/15 bg-gradient-to-r from-violet-500/[0.07] via-indigo-500/[0.04] to-transparent">
            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                  NEXORA ADMIN
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  Store management is ready.
                </h2>

                <p className="mt-1 max-w-xl text-xs leading-5 text-white/35">
                  Manage products, categories, users, orders and your
                  marketplace from the dedicated admin dashboard.
                </p>
              </div>

              <Link
                href="/admin"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-5 py-3 text-xs font-semibold text-black transition hover:bg-white/90"
              >
                Go to dashboard →
              </Link>
            </div>
          </section>
        )}

        {/* Stats */}
        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Orders"
            value={orders.length.toString()}
            href="/orders"
          />

          <StatCard
            label="Wishlist"
            value={wishlistCount.toString()}
            href="/wishlist"
          />

          <StatCard
            label="Total spent"
            value={formatMoney(totalSpent)}
            href="/orders"
          />
        </section>

        {/* Quick actions */}
        <section className="mt-10">
          <p className="text-[9px] font-semibold tracking-[0.2em] text-violet-400">
            QUICK ACCESS
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickLink
              href="/orders"
              title="My orders"
              description="Track purchases"
              icon="↗"
            />

            <QuickLink
              href="/wishlist"
              title="Wishlist"
              description={`${wishlistCount} saved`}
              icon="♡"
            />

            <QuickLink
              href="/cart"
              title="Shopping cart"
              description={`${cartCount} items`}
              icon="□"
            />

            <QuickLink
              href="/settings"
              title="Settings"
              description="Manage preferences"
              icon="⚙"
            />
          </div>
        </section>

        {/* Recent orders */}
        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-semibold tracking-[0.2em] text-violet-400">
                ACTIVITY
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Recent orders
              </h2>
            </div>

            <Link
              href="/orders"
              className="text-[10px] font-medium text-white/35 transition hover:text-white"
            >
              View all →
            </Link>
          </div>

          <div className="mt-5 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.015]">
            {orders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-white/40">
                  You haven't placed any orders yet.
                </p>

                <Link
                  href="/products"
                  className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 text-xs font-semibold text-black transition hover:bg-white/90"
                >
                  Explore products
                </Link>
              </div>
            ) : (
              orders.slice(0, 5).map((order, index) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className={`flex flex-col gap-4 px-5 py-5 transition hover:bg-white/[0.025] sm:flex-row sm:items-center sm:justify-between ${
                    index !== 0 ? "border-t border-white/[0.06]" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {order.orderNumber}
                    </p>

                    <p className="mt-1 text-xs text-white/30">
                      {formatDate(order.createdAt)}
                      <span className="mx-2 text-white/10">•</span>
                      {order.items?.length || 0}{" "}
                      {order.items?.length === 1 ? "item" : "items"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-5 sm:justify-end">
                    <span
                      className={`rounded-full border px-3 py-1.5 text-[9px] font-medium ${statusClass(
                        order.status,
                      )}`}
                    >
                      {formatStatus(order.status)}
                    </span>

                    <span className="text-sm font-semibold">
                      {formatMoney(Number(order.totalAmount || 0))}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <footer className="mt-14 border-t border-white/[0.06] pt-7 text-[10px] text-white/20">
          NEXORA · Your account
        </footer>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/[0.08] bg-white/[0.018] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-white/[0.035]"
    >
      <p className="text-[9px] uppercase tracking-[0.18em] text-white/25">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-2 text-[9px] text-white/20 transition group-hover:text-white/40">
        Open →
      </p>
    </Link>
  );
}

function QuickLink({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/[0.08] bg-white/[0.018] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/20 hover:bg-white/[0.035]"
    >
      <div className="flex items-center justify-between">
        <span className="text-lg text-white/50">{icon}</span>

        <span className="text-xs text-white/15 transition group-hover:translate-x-1 group-hover:text-white/50">
          →
        </span>
      </div>

      <p className="mt-6 text-sm font-semibold">{title}</p>

      <p className="mt-1 text-[10px] text-white/25">
        {description}
      </p>
    </Link>
  );
}

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