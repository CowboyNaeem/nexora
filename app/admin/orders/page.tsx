"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    const pending = orders.filter((order) => order.status === "PENDING").length;
    const processing = orders.filter(
      (order) => order.status === "PROCESSING"
    ).length;
    const shipped = orders.filter((order) => order.status === "SHIPPED").length;
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

  return (
    <div className="mx-auto w-full max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
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

        <div className="hidden rounded-xl border border-white/[0.07] bg-[#0d1018] px-4 py-2.5 sm:block">
          <div className="text-sm font-medium text-white">NEXORA Admin</div>
          <div className="text-[11px] text-slate-500">Administrator</div>
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
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

      <section className="mt-6 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d1018]">
        <div className="flex flex-col gap-4 border-b border-white/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-white">All Orders</h2>
            <p className="mt-1 text-sm text-slate-500">
              {orders.length} {orders.length === 1 ? "order" : "orders"} total
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.07] px-4 py-2 text-xs font-medium text-slate-500">
            Latest first
          </div>
        </div>

        {loading ? (
          <div className="px-7 py-16 text-center">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-violet-400" />
            <p className="mt-4 text-sm text-slate-500">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="px-7 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              ×
            </div>
            <h3 className="mt-4 font-medium">Unable to load orders</h3>
            <p className="mt-2 text-sm text-slate-500">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="px-7 py-16 text-center">
            <p className="text-slate-500">No orders found.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
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
                {orders.map((order) => (
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
                        {(order.items?.length || 0) === 1 ? "item" : "items"}
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
        )}
      </section>
    </div>
  );
}

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
    <div className={`rounded-2xl border ${borderClass} bg-[#0d1018] p-5`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className={`mt-5 text-3xl font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}
