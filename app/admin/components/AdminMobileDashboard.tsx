"use client";

import { useMemo } from "react";

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

type DashboardStats = {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  revenue: number;
  paidOrders: number;
};

type ChartPoint = {
  label: string;
  value: number;
};

type Props = {
  orders: Order[];
  loading: boolean;
  error: string;
  stats: DashboardStats;
  chartData: ChartPoint[];
  maxChartValue: number;
  recentOrders: Order[];
  money: (value: number | string) => string;
};

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
    | "profile"
    | "arrow";
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
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );
  }
}

function statusTone(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return "border-yellow-400/20 bg-yellow-400/10 text-yellow-300";
    case "PROCESSING":
      return "border-violet-400/20 bg-violet-400/10 text-violet-300";
    case "SHIPPED":
      return "border-sky-400/20 bg-sky-400/10 text-sky-300";
    case "DELIVERED":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
    case "CANCELLED":
      return "border-red-400/20 bg-red-400/10 text-red-300";
    case "REFUNDED":
      return "border-orange-400/20 bg-orange-400/10 text-orange-300";
    case "CONFIRMED":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";
    default:
      return "border-white/10 bg-white/5 text-white/50";
  }
}

function formatStatus(status: OrderStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function AdminMobileDashboard({
  orders,
  loading,
  error,
  stats,
  chartData,
  maxChartValue,
  recentOrders,
  money,
}: Props) {
  const orderSummary = useMemo(
    () => [
      {
        label: "Pending",
        value: stats.pending,
        dot: "bg-yellow-400",
        text: "text-yellow-300",
      },
      {
        label: "Processing",
        value: stats.processing,
        dot: "bg-violet-400",
        text: "text-violet-300",
      },
      {
        label: "Shipped",
        value: stats.shipped,
        dot: "bg-sky-400",
        text: "text-sky-300",
      },
      {
        label: "Delivered",
        value: stats.delivered,
        dot: "bg-emerald-400",
        text: "text-emerald-300",
      },
    ],
    [stats]
  );

  return (
    <main className="min-h-screen bg-[#07090f] px-4 pb-8 pt-4 text-white">
      <div className="mx-auto w-full max-w-md">
        {/* MOBILE HEADER */}
        <header className="mb-5 flex items-center justify-between rounded-2xl border border-white/[0.07] bg-[#0c0f17] px-4 py-3.5 shadow-[0_14px_40px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 text-lg font-bold shadow-[0_8px_25px_rgba(139,92,246,0.28)]">
              N
            </div>
            <div className="leading-none">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-violet-400">
                Nexora
              </p>
              <p className="mt-1.5 text-sm font-semibold text-white">
                Admin Dashboard
              </p>
            </div>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/60">
            <Icon type="profile" size={18} />
          </div>
        </header>

        {/* INTRO */}
        <section className="mb-5 px-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-400">
            Overview
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1.5 text-xs leading-5 text-white/40">
            A quick look at what&apos;s happening with your store today.
          </p>
        </section>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-xs leading-5 text-red-300">
            {error}
          </div>
        ) : null}

        {/* STATS */}
        <section className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Total Orders",
              value: stats.total,
              subtitle: "All orders",
              icon: "bag" as const,
              iconClass: "bg-violet-500/15 text-violet-400",
              trend: "↑ 12.5%",
              trendClass: "text-violet-400",
            },
            {
              label: "Pending Orders",
              value: stats.pending,
              subtitle: "Awaiting action",
              icon: "clock" as const,
              iconClass: "bg-yellow-500/15 text-yellow-400",
              trend: "↑ 50%",
              trendClass: "text-yellow-400",
            },
            {
              label: "Processing",
              value: stats.processing,
              subtitle: "In progress",
              icon: "gear" as const,
              iconClass: "bg-cyan-500/15 text-cyan-400",
              trend: "↓ 16.7%",
              trendClass: "text-cyan-400",
            },
            {
              label: "Delivered",
              value: stats.delivered,
              subtitle: "Completed",
              icon: "check" as const,
              iconClass: "bg-emerald-500/15 text-emerald-400",
              trend: "— 0%",
              trendClass: "text-emerald-400",
            },
          ].map((card) => (
            <article
              key={card.label}
              className="rounded-2xl border border-white/[0.07] bg-[#0c0f17] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.16)]"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.iconClass}`}
              >
                <Icon type={card.icon} size={18} />
              </div>
              <p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/40">
                {card.label}
              </p>
              <p className="mt-1.5 text-2xl font-semibold tracking-tight">
                {loading ? "—" : card.value}
              </p>
              <p className="mt-0.5 text-[11px] text-white/35">
                {card.subtitle}
              </p>
              <p className={`mt-4 text-[10px] font-medium ${card.trendClass}`}>
                {card.trend}
                <span className="ml-1 text-white/25">vs last 7 days</span>
              </p>
            </article>
          ))}
        </section>

        {/* REVENUE */}
        <section className="mt-3 rounded-2xl border border-white/[0.07] bg-[#0c0f17] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.16)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
                  <Icon type="chart" size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/40">
                    Total Revenue
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {loading ? "—" : money(stats.revenue)}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-white/35">
                {loading
                  ? "Loading revenue..."
                  : `From ${stats.paidOrders} paid ${
                      stats.paidOrders === 1 ? "order" : "orders"
                    }`}
              </p>
            </div>
            <span className="rounded-full border border-sky-400/15 bg-sky-400/10 px-2.5 py-1 text-[9px] font-medium text-sky-300">
              ↑ 100%
            </span>
          </div>
        </section>

        {/* SALES OVERVIEW */}
        <section className="mt-3 rounded-2xl border border-white/[0.07] bg-[#0c0f17] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.16)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Sales Overview</h2>
              <p className="mt-1 text-[11px] text-white/35">
                Order value over the last 7 days
              </p>
            </div>
            <span className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 py-2 text-[9px] text-white/60">
              This Week
            </span>
          </div>

          <div className="mt-5 h-48">
            <div className="relative h-full pl-8 pb-6">
              <div className="absolute inset-x-8 top-0 border-t border-white/[0.05]" />
              <div className="absolute inset-x-8 top-1/4 border-t border-white/[0.05]" />
              <div className="absolute inset-x-8 top-1/2 border-t border-white/[0.05]" />
              <div className="absolute inset-x-8 top-3/4 border-t border-white/[0.05]" />
              <div className="absolute inset-x-8 bottom-6 border-t border-white/[0.05]" />

              <div className="absolute left-0 top-0 flex h-[calc(100%-24px)] flex-col justify-between text-[8px] text-white/20">
                <span>{money(maxChartValue)}</span>
                <span>{money(maxChartValue * 0.5)}</span>
                <span>৳0</span>
              </div>

              <div className="relative flex h-full items-end gap-2 px-1">
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
                      className="flex h-full min-w-0 flex-1 flex-col justify-end"
                    >
                      <div className="relative flex-1">
                        <div
                          className="absolute bottom-0 left-1/2 w-2 -translate-x-1/2 rounded-full bg-violet-500 shadow-[0_0_16px_rgba(139,92,246,0.42)]"
                          style={{ height: `${height}%` }}
                        />
                        {item.value > 0 ? (
                          <div
                            className="absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-violet-300 shadow-[0_0_12px_rgba(167,139,250,0.75)]"
                            style={{ bottom: `${height}%` }}
                          />
                        ) : null}
                      </div>
                      <p className="mt-2 truncate text-center text-[8px] text-white/25">
                        {item.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ORDER SUMMARY */}
        <section className="mt-3 rounded-2xl border border-white/[0.07] bg-[#0c0f17] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.16)]">
          <h2 className="text-base font-semibold">Order Summary</h2>
          <p className="mt-1 text-[11px] text-white/35">Current order status</p>

          <div className="mt-5 space-y-4">
            {orderSummary.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                    <span className="text-xs text-white/60">{item.label}</span>
                  </div>
                  <span className={`text-xs font-semibold ${item.text}`}>
                    {loading ? "—" : item.value}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className={`h-full rounded-full ${item.dot}`}
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

          <div className="mt-5 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.025] px-3.5 py-3">
            <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/30">
              Total Orders
            </span>
            <span className="text-xl font-semibold">
              {loading ? "—" : stats.total}
            </span>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="mt-3 rounded-2xl border border-white/[0.07] bg-[#0c0f17] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.16)]">
          <h2 className="text-base font-semibold">Quick Actions</h2>
          <p className="mt-1 text-[11px] text-white/35">
            Common admin tasks at your fingertips.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {[
              {
                href: "/admin/products/new",
                label: "Add Product",
                subtitle: "Create a product",
                icon: "bag" as const,
                iconClass: "bg-violet-500/10 text-violet-400",
              },
              {
                href: "/admin/orders",
                label: "Orders",
                subtitle: "View all orders",
                icon: "orders" as const,
                iconClass: "bg-cyan-500/10 text-cyan-400",
              },
              {
                href: "/admin/products",
                label: "Products",
                subtitle: "View catalog",
                icon: "products" as const,
                iconClass: "bg-sky-500/10 text-sky-400",
              },
              {
                href: "/admin/categories",
                label: "Categories",
                subtitle: "Manage categories",
                icon: "categories" as const,
                iconClass: "bg-yellow-500/10 text-yellow-400",
              },
              {
                href: "/admin/users",
                label: "Customers",
                subtitle: "View customers",
                icon: "users" as const,
                iconClass: "bg-emerald-500/10 text-emerald-400",
              },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition active:scale-[0.98] hover:border-white/[0.12] hover:bg-white/[0.04]"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${action.iconClass}`}
                >
                  <Icon type={action.icon} size={16} />
                </div>
                <p className="mt-2.5 text-[11px] font-medium text-white">
                  {action.label}
                </p>
                <p className="mt-0.5 text-[9px] text-white/30">
                  {action.subtitle}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* RECENT ORDERS */}
        <section className="mt-3 rounded-2xl border border-white/[0.07] bg-[#0c0f17] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.16)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Recent Orders</h2>
              <p className="mt-1 text-[11px] text-white/35">
                Your latest customer orders
              </p>
            </div>
            <a
              href="/admin/orders"
              className="mt-1 text-[10px] font-medium text-violet-400"
            >
              View all
            </a>
          </div>

          <div className="mt-4 space-y-2.5">
            {loading ? (
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] py-8 text-center text-xs text-white/30">
                Loading orders...
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] py-8 text-center text-xs text-white/30">
                No orders found.
              </div>
            ) : (
              recentOrders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-xl border border-white/[0.055] bg-white/[0.018] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-semibold text-white">
                        {order.orderNumber}
                      </p>
                      <p className="mt-1 text-[9px] text-white/30">
                        {new Date(order.createdAt).toLocaleDateString("en-BD", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-1 text-[8px] font-medium ${statusTone(
                        order.status
                      )}`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-end justify-between gap-3 border-t border-white/[0.05] pt-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-[10px] text-white/60">
                        {order.user?.name || "Customer"}
                      </p>
                      <p className="mt-0.5 truncate text-[9px] text-white/25">
                        {order.user?.email || "—"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[9px] text-white/25">
                        {order.items?.length || 0} item
                        {(order.items?.length || 0) === 1 ? "" : "s"}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-white">
                        {money(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <footer className="px-1 py-6 text-center text-[9px] text-white/20">
          NEXORA Admin · Store management
        </footer>
      </div>
    </main>
  );
}
