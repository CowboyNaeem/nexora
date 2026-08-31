"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Filter,
  Package,
  Search,
  Truck,
  WalletCards,
  XCircle,
  Zap,
} from "lucide-react";

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

type FilterStatus = "ALL" | OrderStatus;

type DateFilter =
  | "ALL"
  | "TODAY"
  | "YESTERDAY"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "THIS_MONTH"
  | "CUSTOM";

function money(value: string | number) {
  return `৳${Number(value || 0).toFixed(2)}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-BD", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getDateRange(
  filter: DateFilter,
  customFrom: string,
  customTo: string
) {
  const today = startOfDay(new Date());

  if (filter === "ALL") return null;
  if (filter === "TODAY") return { start: today, end: addDays(today, 1) };

  if (filter === "YESTERDAY") {
    const start = addDays(today, -1);
    return { start, end: today };
  }

  if (filter === "LAST_7_DAYS") {
    return { start: addDays(today, -6), end: addDays(today, 1) };
  }

  if (filter === "LAST_30_DAYS") {
    return { start: addDays(today, -29), end: addDays(today, 1) };
  }

  if (filter === "THIS_MONTH") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return { start, end };
  }

  if (filter === "CUSTOM" && customFrom) {
    const start = new Date(`${customFrom}T00:00:00`);
    const end = customTo
      ? new Date(`${customTo}T00:00:00`)
      : addDays(start, 1);

    if (customTo) end.setDate(end.getDate() + 1);
    return { start, end };
  }

  return null;
}

function statusClasses(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
    case "CONFIRMED":
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
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
    default:
      return "border-white/10 bg-white/5 text-white/60";
  }
}

function statusDot(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-400";
    case "CONFIRMED":
      return "bg-blue-400";
    case "PROCESSING":
      return "bg-violet-400";
    case "SHIPPED":
      return "bg-sky-400";
    case "DELIVERED":
      return "bg-emerald-400";
    case "CANCELLED":
      return "bg-red-400";
    case "REFUNDED":
      return "bg-orange-400";
    default:
      return "bg-white/40";
  }
}

function paymentMethodLabel(method?: PaymentMethod) {
  switch (method) {
    case "CASH_ON_DELIVERY":
      return "Cash on Delivery";
    case "MOBILE_BANKING":
      return "Mobile Banking";
    case "BANK_TRANSFER":
      return "Bank Transfer";
    case "CARD":
      return "Card";
    default:
      return "—";
  }
}

function StatusIcon({ status }: { status: OrderStatus }) {
  if (status === "PENDING") {
    return <Clock3 size={16} strokeWidth={1.8} />;
  }

  if (status === "PROCESSING" || status === "CONFIRMED") {
    return <Zap size={16} strokeWidth={1.8} />;
  }

  if (status === "SHIPPED") {
    return <Truck size={16} strokeWidth={1.8} />;
  }

  if (status === "DELIVERED") {
    return <CheckCircle2 size={16} strokeWidth={1.8} />;
  }

  if (status === "CANCELLED") {
    return <XCircle size={16} strokeWidth={1.8} />;
  }

  return <Package size={16} strokeWidth={1.8} />;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("ALL");
  const [dateFilter, setDateFilter] = useState<DateFilter>("ALL");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/orders", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data: OrdersResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load orders");
        }

        if (mounted) {
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error("Admin orders error:", err);

        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Unable to load orders"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const pending = orders.filter(
      (order) => order.status === "PENDING"
    ).length;

    const processing = orders.filter(
      (order) => order.status === "PROCESSING"
    ).length;

    const shipped = orders.filter(
      (order) => order.status === "SHIPPED"
    ).length;

    const delivered = orders.filter(
      (order) => order.status === "DELIVERED"
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

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    const range = getDateRange(dateFilter, customFrom, customTo);

    return orders.filter((order) => {
      const matchesStatus =
        activeFilter === "ALL" || order.status === activeFilter;

      if (!matchesStatus) return false;

      if (range) {
        const created = new Date(order.createdAt);
        if (created < range.start || created >= range.end) return false;
      }

      if (!query) return true;

      return (
        order.orderNumber.toLowerCase().includes(query) ||
        order.user?.name?.toLowerCase().includes(query) ||
        order.user?.email?.toLowerCase().includes(query)
      );
    });
  }, [orders, search, activeFilter, dateFilter, customFrom, customTo]);

  const hasActiveFilters =
    Boolean(search.trim()) || activeFilter !== "ALL" || dateFilter !== "ALL";

  const filters: {
    key: FilterStatus;
    label: string;
    count: number;
  }[] = [
    {
      key: "ALL",
      label: "All",
      count: stats.total,
    },
    {
      key: "PENDING",
      label: "Pending",
      count: stats.pending,
    },
    {
      key: "PROCESSING",
      label: "Processing",
      count: stats.processing,
    },
    {
      key: "SHIPPED",
      label: "Shipped",
      count: stats.shipped,
    },
    {
      key: "DELIVERED",
      label: "Delivered",
      count: stats.delivered,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 pb-28 pt-5 sm:px-8 sm:pb-10 sm:pt-7 lg:px-10 lg:py-9">
      {/* =========================================================
          MOBILE HEADER
          ========================================================= */}
      <header className="lg:hidden">
        <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-400">
          Nexora Admin
        </div>

        <div className="mt-1 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-white">
              Orders
            </h1>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Manage and track customer orders.
            </p>
          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-slate-400">
            <Package size={17} strokeWidth={1.8} />
          </div>
        </div>
      </header>

      {/* =========================================================
          DESKTOP HEADER
          ========================================================= */}
      <header className="hidden flex-col gap-5 xl:flex-row xl:items-start xl:justify-between lg:flex">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-400">
            Nexora Admin
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Orders
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-[15px]">
            Manage customer orders, payments and fulfillment.
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-[#0d1018] px-4 py-2.5">
          <div className="text-sm font-medium text-white">NEXORA Admin</div>
          <div className="text-[11px] text-slate-500">Administrator</div>
        </div>
      </header>

      {/* =========================================================
          MOBILE SUMMARY CARDS
          ========================================================= */}
      <section className="mt-5 grid grid-cols-2 gap-3 lg:hidden">
        <MobileStat
          label="Total Orders"
          value={stats.total}
          icon={<Package size={16} />}
          iconClass="bg-violet-500/15 text-violet-300"
        />

        <MobileStat
          label="Pending"
          value={stats.pending}
          icon={<Clock3 size={16} />}
          iconClass="bg-yellow-500/15 text-yellow-300"
        />

        <MobileStat
          label="Processing"
          value={stats.processing}
          icon={<Zap size={16} />}
          iconClass="bg-violet-500/15 text-violet-300"
        />

        <MobileStat
          label="Shipped"
          value={stats.shipped}
          icon={<Truck size={16} />}
          iconClass="bg-sky-500/15 text-sky-300"
        />
      </section>

      {/* =========================================================
          MOBILE REVENUE
          ========================================================= */}
      <section className="mt-3 lg:hidden">
        <div className="rounded-2xl border border-cyan-500/15 bg-[#0d1018] p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Paid Revenue
              </p>

              <p className="mt-2 text-2xl font-semibold text-cyan-300">
                {money(stats.revenue)}
              </p>

              <p className="mt-1 text-[11px] text-slate-500">
                {stats.paidOrders} paid{" "}
                {stats.paidOrders === 1 ? "order" : "orders"}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
              <WalletCards size={17} strokeWidth={1.8} />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          DESKTOP STATS
          ========================================================= */}
      <div className="mt-8 hidden gap-4 sm:grid-cols-2 xl:grid-cols-6 lg:grid">
        <StatCard label="Total Orders" value={stats.total} />

        <StatCard
          label="Pending"
          value={stats.pending}
          valueClass="text-yellow-300"
          borderClass="border-yellow-500/20"
        />

        <StatCard
          label="Processing"
          value={stats.processing}
          valueClass="text-violet-300"
          borderClass="border-violet-500/20"
        />

        <StatCard
          label="Shipped"
          value={stats.shipped}
          valueClass="text-sky-300"
          borderClass="border-sky-500/20"
        />

        <StatCard
          label="Delivered"
          value={stats.delivered}
          valueClass="text-emerald-300"
          borderClass="border-emerald-500/20"
        />

        <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1018] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Revenue
          </p>

          <p className="mt-5 text-2xl font-semibold text-cyan-300">
            {money(stats.revenue)}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {stats.paidOrders} paid{" "}
            {stats.paidOrders === 1 ? "order" : "orders"}
          </p>
        </div>
      </div>

      {/* =========================================================
          ORDERS SECTION
          ========================================================= */}
      <section className="mt-5 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d1018] lg:mt-6">
        {/* Section heading */}
        <div className="border-b border-white/[0.07] px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white sm:text-lg">
                All Orders
              </h2>

              <p className="mt-1 text-[11px] text-slate-500 sm:text-sm">
                {filteredOrders.length}{" "}
                {filteredOrders.length === 1 ? "order" : "orders"} shown
              </p>
            </div>

            <div className="hidden rounded-xl border border-white/[0.07] px-4 py-2 text-xs font-medium text-slate-500 sm:block">
              Latest first
            </div>
          </div>

          {/* =====================================================
              MOBILE SEARCH
              ===================================================== */}
          <div className="mt-4 lg:hidden">
            <div className="relative">
              <Search
                size={17}
                strokeWidth={1.8}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search order or customer..."
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#090c12] pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/40"
              />
            </div>
          </div>

          {/* =====================================================
              MOBILE FILTERS
              ===================================================== */}
          <div className="-mx-4 mt-3 overflow-x-auto px-4 pb-1 lg:hidden">
            <div className="flex min-w-max gap-2">
              {filters.map((filter) => {
                const active = activeFilter === filter.key;

                return (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setActiveFilter(filter.key)}
                    className={`flex h-9 items-center gap-2 rounded-xl border px-3 text-[11px] font-medium transition ${
                      active
                        ? "border-violet-500/40 bg-violet-500/15 text-violet-200"
                        : "border-white/[0.07] bg-white/[0.02] text-slate-500 active:bg-white/[0.05]"
                    }`}
                  >
                    {filter.key !== "ALL" ? (
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${statusDot(
                          filter.key
                        )}`}
                      />
                    ) : null}

                    {filter.label}

                    <span
                      className={
                        active ? "text-violet-300" : "text-slate-600"
                      }
                    >
                      {filter.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* =====================================================
              MOBILE DATE FILTER
              ===================================================== */}
          <div className="mt-3 lg:hidden">
            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[11px] font-medium ${
                dateFilter !== "ALL"
                  ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                  : "border-white/[0.07] bg-white/[0.02] text-slate-500"
              }`}
            >
              <Filter size={14} />
              Date filter
            </button>
          </div>

          {showFilters ? (
            <DateFilterPanel
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              customFrom={customFrom}
              setCustomFrom={setCustomFrom}
              customTo={customTo}
              setCustomTo={setCustomTo}
              onClear={() => {
                setSearch("");
                setActiveFilter("ALL");
                setDateFilter("ALL");
                setCustomFrom("");
                setCustomTo("");
              }}
              mobile
            />
          ) : null}

          {/* =====================================================
              DESKTOP SEARCH
              ===================================================== */}
          <div className="mt-4 hidden items-center justify-between gap-4 lg:flex">
            <div className="relative max-w-md flex-1">
              <Search
                size={17}
                strokeWidth={1.8}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search order number or customer..."
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#090c12] pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/40"
              />
            </div>

            <div className="flex items-center gap-2">
              {filters.map((filter) => {
                const active = activeFilter === filter.key;

                return (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setActiveFilter(filter.key)}
                    className={`flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition ${
                      active
                        ? "border-violet-500/35 bg-violet-500/10 text-violet-200"
                        : "border-white/[0.07] bg-white/[0.02] text-slate-500 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    {filter.key !== "ALL" ? (
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${statusDot(
                          filter.key
                        )}`}
                      />
                    ) : null}

                    {filter.label}

                    <span className="text-slate-600">
                      {filter.count}
                    </span>
                  </button>
                );
              })}

              <div className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 text-xs text-slate-500">
                <Filter size={14} />
                Filter
              </div>
            </div>
          </div>

          {showFilters ? (
            <DateFilterPanel
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              customFrom={customFrom}
              setCustomFrom={setCustomFrom}
              customTo={customTo}
              setCustomTo={setCustomTo}
              onClear={() => {
                setSearch("");
                setActiveFilter("ALL");
                setDateFilter("ALL");
                setCustomFrom("");
                setCustomTo("");
              }}
            />
          ) : null}
        </div>

        {/* =======================================================
            CONTENT STATES
            ======================================================= */}
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : filteredOrders.length === 0 ? (
          <EmptyState search={search} hasFilters={hasActiveFilters} />
        ) : (
          <>
            {/* ===================================================
                MOBILE ORDER CARDS
                =================================================== */}
            <div className="divide-y divide-white/[0.05] lg:hidden">
              {filteredOrders.map((order) => (
                <MobileOrderCard key={order.id} order={order} />
              ))}
            </div>

            {/* ===================================================
                DESKTOP TABLE
                =================================================== */}
            <div className="hidden w-full overflow-x-auto lg:block">
              <table className="w-full min-w-[1000px] text-left">
                <thead className="border-b border-white/[0.06] bg-white/[0.02]">
                  <tr>
                    <th className="w-[18%] px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      Order
                    </th>

                    <th className="w-[19%] px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      Customer
                    </th>

                    <th className="w-[8%] px-2 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      Items
                    </th>

                    <th className="w-[15%] px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      Payment
                    </th>

                    <th className="w-[13%] px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      Status
                    </th>

                    <th className="w-[11%] px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      Total
                    </th>

                    <th className="w-[16%] px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.025]"
                    >
                      <td className="px-4 py-5">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="block min-w-0"
                        >
                          <p className="truncate font-medium text-violet-300 transition hover:text-violet-200">
                            {order.orderNumber}
                          </p>

                          <p className="mt-2 truncate text-xs text-slate-600">
                            {formatDate(order.createdAt)}
                          </p>
                        </Link>
                      </td>

                      <td className="px-4 py-5">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white/90">
                            {order.user?.name || "Unknown"}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-600">
                            {order.user?.email || "—"}
                          </p>
                        </div>
                      </td>

                      <td className="px-2 py-5">
                        <p className="font-medium text-white/80">
                          {order.items?.length || 0}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {(order.items?.length || 0) === 1
                            ? "item"
                            : "items"}
                        </p>
                      </td>

                      <td className="px-4 py-5">
                        <div className="min-w-0">
                          <p className="text-sm font-medium uppercase text-white/75">
                            {paymentMethodLabel(order.payment?.method)}
                          </p>

                          <p
                            className={`mt-1 text-xs font-medium ${
                              order.payment?.status === "PAID"
                                ? "text-emerald-400"
                                : "text-yellow-300"
                            }`}
                          >
                            {order.payment?.status || "PENDING"}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-5">
                        <span
                          className={`inline-flex max-w-full truncate rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide ${statusClasses(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="px-4 py-5">
                        <p className="font-semibold text-white">
                          {money(order.totalAmount)}
                        </p>

                        {Number(order.shippingCost) === 0 && (
                          <p className="mt-1 text-xs text-emerald-400">
                            Free shipping
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-5 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-xs font-medium text-white/70 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white"
                        >
                          View
                          <span className="ml-2">→</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

/* ===============================================================
   MOBILE STAT
   =============================================================== */

function MobileStat({
  label,
  value,
  icon,
  iconClass,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0d1018] p-3.5">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}

/* ===============================================================
   MOBILE ORDER CARD
   =============================================================== */

function MobileOrderCard({ order }: { order: Order }) {
  const itemCount = order.items?.length || 0;

  return (
    <Link
      href={`/admin/orders/${order.id}`}
      className="block px-4 py-4 transition active:bg-white/[0.025]"
    >
      <article className="rounded-2xl border border-white/[0.07] bg-[#090c12] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
              <Package size={18} strokeWidth={1.8} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-white">
                  {order.orderNumber}
                </p>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[8px] font-semibold uppercase tracking-wide ${statusClasses(
                    order.status
                  )}`}
                >
                  <StatusIcon status={order.status} />
                  {order.status}
                </span>
              </div>

              <p className="mt-1.5 truncate text-xs font-medium text-white/80">
                {order.user?.name || "Unknown"}
              </p>

              <p className="mt-0.5 truncate text-[10px] text-slate-600">
                {order.user?.email || "—"}
              </p>
            </div>
          </div>

          <ArrowRight
            size={17}
            strokeWidth={1.8}
            className="mt-1 shrink-0 text-slate-600"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/[0.05] pt-3">
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Total
            </p>

            <p className="mt-1 text-sm font-semibold text-white">
              {money(order.totalAmount)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Payment
            </p>

            <p
              className={`mt-1 text-[11px] font-semibold ${
                order.payment?.status === "PAID"
                  ? "text-emerald-400"
                  : "text-yellow-300"
              }`}
            >
              {order.payment?.status || "PENDING"}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-slate-600">
          <span className="flex min-w-0 items-center gap-1.5 truncate">
            <CalendarDays size={12} strokeWidth={1.7} />
            {formatDate(order.createdAt)}
          </span>

          <span className="shrink-0">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </div>

        {Number(order.shippingCost) === 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
            <Truck size={12} strokeWidth={1.7} />
            Free shipping
          </div>
        )}
      </article>
    </Link>
  );
}

/* ===============================================================
   LOADING
   =============================================================== */

function LoadingState() {
  return (
    <div className="px-5 py-16 text-center">
      <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-violet-400" />

      <p className="mt-4 text-sm text-slate-500">
        Loading orders...
      </p>
    </div>
  );
}

/* ===============================================================
   ERROR
   =============================================================== */

function ErrorState({ message }: { message: string }) {
  return (
    <div className="px-5 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
        <XCircle size={22} strokeWidth={1.7} />
      </div>

      <h3 className="mt-4 font-medium text-white">
        Unable to load orders
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
        {message}
      </p>
    </div>
  );
}

/* ===============================================================
   EMPTY
   =============================================================== */

function EmptyState({
  search,
  hasFilters,
}: {
  search: string;
  hasFilters: boolean;
}) {
  return (
    <div className="px-5 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] text-slate-500">
        <Search size={20} strokeWidth={1.7} />
      </div>

      <h3 className="mt-4 font-medium text-white">
        {hasFilters ? "No matching orders" : "No orders found"}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {hasFilters
          ? "Try changing your search or date/status filters."
          : "There are no orders to display right now."}
      </p>
    </div>
  );
}

/* ===============================================================
   DATE FILTER PANEL
   =============================================================== */

function DateFilterPanel({
  dateFilter,
  setDateFilter,
  customFrom,
  setCustomFrom,
  customTo,
  setCustomTo,
  onClear,
  mobile = false,
}: {
  dateFilter: DateFilter;
  setDateFilter: (value: DateFilter) => void;
  customFrom: string;
  setCustomFrom: (value: string) => void;
  customTo: string;
  setCustomTo: (value: string) => void;
  onClear: () => void;
  mobile?: boolean;
}) {
  const options: [DateFilter, string][] = [
    ["ALL", "All dates"],
    ["TODAY", "Today"],
    ["YESTERDAY", "Yesterday"],
    ["LAST_7_DAYS", "Last 7 days"],
    ["LAST_30_DAYS", "Last 30 days"],
    ["THIS_MONTH", "This month"],
    ["CUSTOM", "Custom"],
  ];

  return (
    <div
      className={`${
        mobile ? "lg:hidden" : "hidden lg:flex"
      } border-t border-white/[0.05] ${
        mobile ? "mt-3 rounded-xl border bg-[#090c12] p-3" : "px-6 py-4"
      }`}
    >
      <div className={`flex ${mobile ? "flex-col" : "w-full items-center"} gap-3`}>
        <div className="flex flex-wrap gap-2">
          {options.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setDateFilter(key)}
              className={`rounded-lg border px-3 py-2 text-[10px] font-medium transition ${
                dateFilter === key
                  ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                  : "border-white/[0.06] bg-white/[0.02] text-slate-500 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {dateFilter === "CUSTOM" ? (
          <div className={`flex ${mobile ? "w-full" : "ml-auto"} items-center gap-2`}>
            <input
              aria-label="From date"
              type="date"
              value={customFrom}
              onChange={(event) => setCustomFrom(event.target.value)}
              className="h-9 min-w-0 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2 text-xs text-white outline-none focus:border-cyan-500/30"
            />
            <span className="shrink-0 text-xs text-slate-600">to</span>
            <input
              aria-label="To date"
              type="date"
              value={customTo}
              min={customFrom || undefined}
              onChange={(event) => setCustomTo(event.target.value)}
              className="h-9 min-w-0 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2 text-xs text-white outline-none focus:border-cyan-500/30"
            />
          </div>
        ) : null}

        {(dateFilter !== "ALL" || customFrom || customTo) ? (
          <button
            type="button"
            onClick={onClear}
            className={`${mobile ? "self-start" : "ml-auto"} inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-white`}
          >
            Clear filters
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* ===============================================================
   DESKTOP STAT
   =============================================================== */

function StatCard({
  label,
  value,
  valueClass = "text-white",
  borderClass = "border-white/[0.07]",
}: {
  label: string;
  value: number;
  valueClass?: string;
  borderClass?: string;
}) {
  return (
    <div
      className={`rounded-2xl border ${borderClass} bg-[#0d1018] p-5`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      <p className={`mt-5 text-3xl font-semibold ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}