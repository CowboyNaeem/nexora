"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: string | number;
  totalPrice: string | number;
  sku: string;
};

type Payment = {
  method: string;
  status: string;
  amount: string | number;
  transactionId: string | null;
  paidAt: string | null;
};

type Shipment = {
  status: string;
  courier: string | null;
  trackingNumber: string | null;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string | number;
  shippingCost: string | number;
  discountAmount: string | number;
  totalAmount: string | number;
  createdAt: string;
  items: OrderItem[];
  payment: Payment | null;
  shipment: Shipment | null;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatMoney(value: string | number) {
  return `$${Number(value).toFixed(2)}`;
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

function getOrderStatusClass(status: string) {
  switch (status) {
    case "DELIVERED":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-400";

    case "SHIPPED":
      return "border-blue-400/20 bg-blue-400/10 text-blue-400";

    case "PROCESSING":
      return "border-violet-400/20 bg-violet-400/10 text-violet-400";

    case "CONFIRMED":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-400";

    case "CANCELLED":
      return "border-red-400/20 bg-red-400/10 text-red-400";

    case "REFUNDED":
      return "border-orange-400/20 bg-orange-400/10 text-orange-400";

    default:
      return "border-yellow-400/20 bg-yellow-400/10 text-yellow-400";
  }
}

function getPaymentStatusClass(status: string) {
  switch (status) {
    case "PAID":
      return "text-emerald-400";

    case "FAILED":
    case "CANCELLED":
      return "text-red-400";

    case "REFUNDED":
      return "text-orange-400";

    default:
      return "text-yellow-400";
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/orders", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          if (response.status === 401) {
            setError("Please login to view your orders.");
          } else {
            setError(
              data.message || "Unable to load your orders."
            );
          }

          return;
        }

        setOrders(data.orders || []);
      } catch (error) {
        console.error("Load orders error:", error);
        setError(
          "Something went wrong while loading your orders."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-[1200px] px-5 pb-20 pt-10 sm:px-8 lg:px-10">

        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-400">
            ACCOUNT
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            My Orders
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/40">
            View your previous orders, payment status and
            delivery progress.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-3xl border border-white/[0.07] bg-white/[0.025]"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-400/20 bg-red-400/[0.05] p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-400/10 text-red-400">
              !
            </div>

            <h2 className="mt-4 text-lg font-semibold">
              Unable to load orders
            </h2>

            <p className="mt-2 text-sm text-white/40">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-2xl">
              🛍
            </div>

            <h2 className="mt-6 text-xl font-semibold">
              No orders yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">
              You haven't placed any orders yet.
              Start shopping and your orders will appear here.
            </p>

            <Link
              href="/"
              className="mt-7 inline-flex rounded-xl bg-violet-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {/* Orders */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-5">
            {orders.map((order) => {
              const itemCount = order.items.reduce(
                (total, item) => total + item.quantity,
                0
              );

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] transition hover:border-white/[0.12]"
                >
                  {/* Order header */}
                  <div className="border-b border-white/[0.07] p-5 sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
                          Order Number
                        </p>

                        <p className="mt-1.5 text-sm font-semibold text-violet-300">
                          {order.orderNumber}
                        </p>

                        <p className="mt-2 text-xs text-white/30">
                          {formatDate(order.createdAt)}
                          {" • "}
                          {formatTime(order.createdAt)}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full border px-3 py-1.5 text-xs font-medium ${getOrderStatusClass(
                          order.status
                        )}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </div>
                  </div>

                  {/* Order body */}
                  <div className="p-5 sm:p-6">
                    <div className="grid gap-6 lg:grid-cols-[1fr_auto]">

                      {/* Items */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/30">
                          Items
                        </p>

                        <div className="mt-4 space-y-3">
                          {order.items.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-white/80">
                                  {item.productName}
                                </p>

                                <p className="mt-1 text-xs text-white/30">
                                  Qty: {item.quantity}
                                </p>
                              </div>

                              <p className="shrink-0 text-sm font-medium text-white/70">
                                {formatMoney(item.totalPrice)}
                              </p>
                            </div>
                          ))}

                          {order.items.length > 3 && (
                            <p className="px-1 text-xs text-white/30">
                              + {order.items.length - 3} more{" "}
                              {order.items.length - 3 === 1
                                ? "item"
                                : "items"}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="lg:min-w-[230px]">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/30">
                          Order Summary
                        </p>

                        <div className="mt-4 space-y-3">
                          <div className="flex justify-between gap-6 text-sm">
                            <span className="text-white/35">
                              Items
                            </span>

                            <span className="text-white/65">
                              {itemCount}
                            </span>
                          </div>

                          <div className="flex justify-between gap-6 text-sm">
                            <span className="text-white/35">
                              Subtotal
                            </span>

                            <span className="text-white/65">
                              {formatMoney(order.subtotal)}
                            </span>
                          </div>

                          <div className="flex justify-between gap-6 text-sm">
                            <span className="text-white/35">
                              Shipping
                            </span>

                            <span className="text-emerald-400">
                              {Number(order.shippingCost) === 0
                                ? "Free"
                                : formatMoney(order.shippingCost)}
                            </span>
                          </div>

                          <div className="border-t border-white/[0.07] pt-3">
                            <div className="flex items-end justify-between gap-6">
                              <span className="text-sm text-white/40">
                                Total
                              </span>

                              <span className="text-xl font-semibold">
                                {formatMoney(order.totalAmount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment + View Order */}
                    <div className="mt-6 flex flex-col gap-4 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <p className="text-xs text-white/30">
                          Payment
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-sm text-white/60">
                            {order.payment?.method ===
                            "CASH_ON_DELIVERY"
                              ? "Cash on Delivery"
                              : order.payment?.method ===
                                "MOBILE_BANKING"
                              ? "Mobile Banking"
                              : "Not specified"}
                          </span>

                          {order.payment && (
                            <span
                              className={`text-xs font-medium ${getPaymentStatusClass(
                                order.payment.status
                              )}`}
                            >
                              {formatStatus(
                                order.payment.status
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white"
                      >
                        View Order
                        <span className="ml-2">→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}