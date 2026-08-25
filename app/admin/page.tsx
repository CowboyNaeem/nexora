"use client";

import { useEffect, useMemo, useState } from "react";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

type PaymentMethod =
  | "CASH_ON_DELIVERY"
  | "CARD"
  | "MOBILE_BANKING"
  | "BANK_TRANSFER";

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  totalPrice: string | number;
};

type Payment = {
  method: PaymentMethod;
  status: PaymentStatus;
};

type User = {
  id: string;
  name: string;
  email: string;
};

type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: string | number;
  shippingCost: string | number;
  totalAmount: string | number;
  createdAt: string;
  user: User;
  items: OrderItem[];
  payment?: Payment | null;
};

type OrdersResponse = {
  success: boolean;
  orders: Order[];
  message?: string;
};

function money(value: number | string) {
  return `৳${Number(value || 0).toFixed(2)}`;
}

function Icon({
  type,
  size = 20,
}: {
  type:
    | "bag"
    | "orders"
    | "products"
    | "categories"
    | "users"
    | "clock"
    | "gear"
    | "check"
    | "chart"
    | "profile";
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

  switch (type) {
    case "bag":
      return (
        <svg {...common}>
          <path d="M5 8h14l-1 12H6L5 8Z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
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
          <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
        </svg>
      );

    case "categories":
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h16" />
          <circle cx="8" cy="6" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="10" cy="18" r="1.5" />
        </svg>
      );

    case "users":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 21c.7-4 3-6 7-6s6.3 2 7 6" />
        </svg>
      );

    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "gear":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19 12a7 7 0 0 0-.1-1.2l1.6-1.2-2-3.4-1.9.8A7 7 0 0 0 15 6l-.3-2h-4l-.3 2a7 7 0 0 0-1.6 1l-1.9-.8-2 3.4 1.6 1.2A7 7 0 0 0 6.4 12a7 7 0 0 0 .1 1.2l-1.6 1.2 2 3.4 1.9-.8a7 7 0 0 0 1.6 1l.3 2h4l.3-2a7 7 0 0 0 1.6-1l1.9.8 2-3.4-1.6-1.2c.1-.4.2-.8.2-1.2Z" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "chart":
      return (
        <svg {...common}>
          <path d="M4 19V5M4 19h16" />
          <path d="m7 15 4-4 3 2 5-6" />
        </svg>
      );

    case "profile":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 21c.8-4 3.1-6 7-6s6.2 2 7 6" />
        </svg>
      );
  }
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
  trend,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle: string;
  trend: string;
  tone: "purple" | "yellow" | "cyan" | "green" | "blue";
}) {
  const tones = {
    purple: {
      icon: "bg-violet-500/15 text-violet-400",
      trend: "text-violet-400",
    },
    yellow: {
      icon: "bg-yellow-500/15 text-yellow-400",
      trend: "text-yellow-400",
    },
    cyan: {
      icon: "bg-cyan-500/15 text-cyan-400",
      trend: "text-cyan-400",
    },
    green: {
      icon: "bg-emerald-500/15 text-emerald-400",
      trend: "text-emerald-400",
    },
    blue: {
      icon: "bg-sky-500/15 text-sky-400",
      trend: "text-sky-400",
    },
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0c0f17] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone].icon}`}
      >
        {icon}
      </div>

      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
        {label}
      </p>

      <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-1 text-sm text-white/35">{subtitle}</p>

      <p className={`mt-6 text-xs font-medium ${tones[tone].trend}`}>
        {trend}
        <span className="ml-1 text-white/30">vs last 7 days</span>
      </p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      try {
        setLoading(true);

        const response = await fetch("/api/admin/orders", {
          credentials: "include",
          cache: "no-store",
        });

        const data: OrdersResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load dashboard data");
        }

        if (active) {
          setOrders(data.orders || []);
          setError("");
        }
      } catch (err) {
        console.error("Dashboard error:", err);

        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load dashboard data"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const pending = orders.filter(
      (order) => order.status === "PENDING"
    ).length;

    const processing = orders.filter(
      (order) => order.status === "PROCESSING"
    ).length;

    const delivered = orders.filter(
      (order) => order.status === "DELIVERED"
    ).length;

    const shipped = orders.filter(
      (order) => order.status === "SHIPPED"
    ).length;

    const paidOrders = orders.filter(
      (order) => order.payment?.status === "PAID"
    );

    const revenue = paidOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0
    );

    return {
      total: orders.length,
      pending,
      processing,
      shipped,
      delivered,
      revenue,
      paidOrders: paidOrders.length,
    };
  }, [orders]);

  const chartData = useMemo(() => {
    const today = new Date();

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);

      date.setHours(0, 0, 0, 0);
      date.setDate(today.getDate() - (6 - index));

      const start = new Date(date);
      const end = new Date(date);

      end.setDate(end.getDate() + 1);

      const total = orders
        .filter((order) => {
          const created = new Date(order.createdAt);

          return created >= start && created < end;
        })
        .reduce(
          (sum, order) => sum + Number(order.totalAmount || 0),
          0
        );

      return {
        label: date.toLocaleDateString("en-BD", {
          month: "short",
          day: "numeric",
        }),
        value: total,
      };
    });
  }, [orders]);

  const maxChartValue = Math.max(
    ...chartData.map((item) => item.value),
    1
  );

    const recentOrders = orders.slice(0, 5);

  function statusStyle(status: String) {
    switch (status) {
      case "PENDING":
        return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";

      case "PROCESSING":
        return "border-violet-500/20 bg-violet-500/10 text-violet-300";

      case "SHIPPED":
        return "border-sky-500/20 bg-sky-500/10 text-sky-300";

      case "DELIVERED":
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";

      case "CANCELLED":
        return "border-red-500/20 bg-red-500/10 text-red-300";

      case "REFUNDED":
        return "border-orange-500/20 bg-orange-500/10 text-orange-300";

      case "CONFIRMED":
        return "border-cyan-500/20 bg-cyan-500/10 text-cyan-300";

      default:
        return "border-white/10 bg-white/5 text-white/50";
    }
  }

  return (
    <div className="min-h-screen bg-[#07090f] text-white">
      <div className="mx-auto w-full max-w-[1600px] px-5 py-7 sm:px-8 xl:px-10">
        {/* HEADER */}
        <header className="mb-7 flex items-center justify-between gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-400">
              Nexora Admin
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-white/40 sm:text-base">
              Welcome back! Here&apos;s what&apos;s happening with your store
              today.
            </p>
          </div>

          <div className="hidden items-center gap-3 rounded-xl border border-white/[0.08] bg-[#0c0f17] px-3 py-2.5 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-white/70">
              <Icon type="profile" size={19} />
            </div>

            <div className="leading-tight">
              <p className="text-sm font-medium">NEXORA Admin</p>

              <p className="mt-1 text-xs text-white/35">
                Administrator
              </p>
            </div>

            <span className="ml-3 text-xs text-white/40">⌄</span>
          </div>
        </header>

        {/* ERROR */}
        {error ? (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {/* STAT CARDS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            icon={<Icon type="bag" size={21} />}
            label="Total Orders"
            value={loading ? "—" : stats.total}
            subtitle="All orders"
            trend="↑ 12.5%"
            tone="purple"
          />

          <StatCard
            icon={<Icon type="clock" size={21} />}
            label="Pending Orders"
            value={loading ? "—" : stats.pending}
            subtitle="Awaiting action"
            trend="↑ 50%"
            tone="yellow"
          />

          <StatCard
            icon={<Icon type="gear" size={21} />}
            label="Processing"
            value={loading ? "—" : stats.processing}
            subtitle="In progress"
            trend="↓ 16.7%"
            tone="cyan"
          />

          <StatCard
            icon={<Icon type="check" size={21} />}
            label="Delivered"
            value={loading ? "—" : stats.delivered}
            subtitle="Completed"
            trend="— 0%"
            tone="green"
          />

          <StatCard
            icon={<Icon type="chart" size={21} />}
            label="Total Revenue"
            value={loading ? "—" : money(stats.revenue)}
            subtitle={
              loading
                ? "Loading..."
                : `From ${stats.paidOrders} paid ${
                    stats.paidOrders === 1 ? "order" : "orders"
                  }`
            }
            trend="↑ 100%"
            tone="blue"
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_1fr]">
          {/* SALES OVERVIEW */}
          <section className="rounded-2xl border border-white/[0.08] bg-[#0c0f17] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">
                  Sales Overview
                </h2>

                <p className="mt-1 text-sm text-white/35">
                  Order value over the last 7 days
                </p>
              </div>

              <button
                type="button"
                className="rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs text-white/70"
              >
                This Week <span className="ml-2">⌄</span>
              </button>
            </div>

            <div className="mt-7 h-[255px]">
              <div className="relative h-full">
                <div className="absolute inset-x-0 top-0 border-t border-white/[0.06]" />
                <div className="absolute inset-x-0 top-1/4 border-t border-white/[0.06]" />
                <div className="absolute inset-x-0 top-1/2 border-t border-white/[0.06]" />
                <div className="absolute inset-x-0 top-3/4 border-t border-white/[0.06]" />
                <div className="absolute inset-x-0 bottom-0 border-t border-white/[0.06]" />

                <div className="absolute inset-0 flex items-end gap-2 px-1 pb-7 pt-3 sm:gap-4">
                  {chartData.map((item, index) => {
                    const height =
                      item.value === 0
                        ? 2
                        : Math.max(
                            5,
                            (item.value / maxChartValue) * 100
                          );

                    return (
                      <div
                        key={`${item.label}-${index}`}
                        className="flex h-full flex-1 flex-col justify-end"
                      >
                        <div className="relative flex-1">
                          <div
                            className="absolute bottom-0 left-1/2 w-2 -translate-x-1/2 rounded-full bg-violet-500 shadow-[0_0_18px_rgba(139,92,246,0.45)]"
                            style={{
                              height: `${height}%`,
                            }}
                          />

                          {item.value > 0 ? (
                            <div
                              className="absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-violet-300 shadow-[0_0_14px_rgba(167,139,250,0.8)]"
                              style={{
                                bottom: `${height}%`,
                              }}
                            />
                          ) : null}
                        </div>

                        <p className="mt-3 text-center text-[10px] text-white/30 sm:text-xs">
                          {item.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="absolute left-0 top-0 flex h-[calc(100%-28px)] flex-col justify-between pr-2 text-[10px] text-white/25">
                  <span>{money(maxChartValue)}</span>
                  <span>{money(maxChartValue * 0.75)}</span>
                  <span>{money(maxChartValue * 0.5)}</span>
                  <span>{money(maxChartValue * 0.25)}</span>
                  <span>৳0</span>
                </div>
              </div>
            </div>
          </section>

          {/* ORDER SUMMARY */}
          <section className="rounded-2xl border border-white/[0.08] bg-[#0c0f17] p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-semibold">
                Order Summary
              </h2>

              <p className="mt-1 text-sm text-white/35">
                Current order status
              </p>
            </div>

            <div className="mt-7 space-y-5">
              {[
                {
                  label: "Pending",
                  value: stats.pending,
                  color: "bg-yellow-400",
                  text: "text-yellow-300",
                },
                {
                  label: "Processing",
                  value: stats.processing,
                  color: "bg-violet-400",
                  text: "text-violet-300",
                },
                {
                  label: "Shipped",
                  value: stats.shipped,
                  color: "bg-sky-400",
                  text: "text-sky-300",
                },
                {
                  label: "Delivered",
                  value: stats.delivered,
                  color: "bg-emerald-400",
                  text: "text-emerald-300",
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                      />

                      <span className="text-sm text-white/60">
                        {item.label}
                      </span>
                    </div>

                    <span
                      className={`text-sm font-semibold ${item.text}`}
                    >
                      {loading ? "—" : item.value}
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{
                        width:
                          stats.total > 0
                            ? `${(item.value / stats.total) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-white/30">
                Total orders
              </p>

              <p className="mt-2 text-2xl font-semibold">
                {loading ? "—" : stats.total}
              </p>
            </div>
          </section>
        </div>

        {/* QUICK ACTIONS */}
        <section className="mt-4 rounded-2xl border border-white/[0.08] bg-[#0c0f17] p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-white/35">
              Quickly access common admin tasks.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <a
              href="/admin/products/new"
              className="group rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-violet-500/30 hover:bg-violet-500/[0.04]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                <Icon type="bag" size={18} />
              </div>

              <p className="mt-3 text-sm font-medium">
                Add New Product
              </p>

              <p className="mt-1 text-xs text-white/30">
                Create a product
              </p>
            </a>

            <a
              href="/admin/orders"
              className="group rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-cyan-500/30 hover:bg-cyan-500/[0.04]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                <Icon type="orders" size={18} />
              </div>

              <p className="mt-3 text-sm font-medium">
                Manage Orders
              </p>

              <p className="mt-1 text-xs text-white/30">
                View all orders
              </p>
            </a>

            <a
              href="/admin/products"
              className="group rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-sky-500/30 hover:bg-sky-500/[0.04]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                <Icon type="products" size={18} />
              </div>

              <p className="mt-3 text-sm font-medium">
                Manage Products
              </p>

              <p className="mt-1 text-xs text-white/30">
                View product catalog
              </p>
            </a>

            <a
              href="/admin/categories"
              className="group rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-yellow-500/30 hover:bg-yellow-500/[0.04]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-400">
                <Icon type="categories" size={18} />
              </div>

              <p className="mt-3 text-sm font-medium">
                Categories
              </p>

              <p className="mt-1 text-xs text-white/30">
                Manage categories
              </p>
            </a>

            <a
              href="/admin/users"
              className="group rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-emerald-500/30 hover:bg-emerald-500/[0.04]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Icon type="users" size={18} />
              </div>

              <p className="mt-3 text-sm font-medium">
                Customers
              </p>

              <p className="mt-1 text-xs text-white/30">
                View customers
              </p>
            </a>
          </div>
        </section>

        {/* RECENT ORDERS */}
        <section className="mt-4 rounded-2xl border border-white/[0.08] bg-[#0c0f17] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                Recent Orders
              </h2>

              <p className="mt-1 text-sm text-white/35">
                Your latest customer orders
              </p>
            </div>

            <a
              href="/admin/orders"
              className="text-xs font-medium text-violet-400 transition hover:text-violet-300"
            >
              View all
            </a>
          </div>

          <div className="mt-5 overflow-x-auto">
            {loading ? (
              <div className="py-10 text-center text-sm text-white/35">
                Loading orders...
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="py-10 text-center text-sm text-white/35">
                No orders found.
              </div>
            ) : (
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/[0.06] text-left">
                    <th className="pb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
                      Order
                    </th>

                    <th className="pb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
                      Customer
                    </th>

                    <th className="pb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
                      Items
                    </th>

                    <th className="pb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
                      Status
                    </th>

                    <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-white/[0.04]"
                    >
                      <td className="py-4">
                        <p className="text-sm font-medium text-white">
                          {order.orderNumber}
                        </p>

                        <p className="mt-1 text-xs text-white/30">
                          {new Date(
                            order.createdAt
                          ).toLocaleDateString("en-BD")}
                        </p>
                      </td>

                      <td className="py-4">
                        <p className="text-sm text-white/70">
                          {order.user?.name || "Customer"}
                        </p>

                        <p className="mt-1 max-w-[180px] truncate text-xs text-white/30">
                          {order.user?.email || "—"}
                        </p>
                      </td>

                      <td className="py-4 text-sm text-white/55">
                        {order.items?.length || 0}
                      </td>

                      <td className="py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusStyle(
                            order.status
                          )}`}
                        >
                          {order.status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="py-4 text-right text-sm font-semibold text-white">
                        {money(order.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}