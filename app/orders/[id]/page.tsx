"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type OrderItem = {
  id: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
};

type Payment = {
  id: string;
  method: string;
  status: string;
  amount: number | string;
  transactionId?: string | null;
  paidAt?: string | null;
};

type Shipment = {
  id: string;
  status: string;
  courier?: string | null;
  trackingNumber?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;

  subtotal: number | string;
  shippingCost: number | string;
  discountAmount: number | string;
  totalAmount: number | string;

  shippingName: string;
  shippingPhone: string;
  shippingDivision?: string | null;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode?: string | null;
  shippingCountry: string;

  createdAt: string;

  items: OrderItem[];
  payment?: Payment | null;
  shipment?: Shipment | null;
};

type OrderResponse = {
  success: boolean;
  message?: string;
  order?: Order;
};

function money(value: number | string) {
  return Number(value).toFixed(2);
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isCancellableStatus(status: string) {
  return (
    status === "PENDING" ||
    status === "CONFIRMED" ||
    status === "PROCESSING"
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "DELIVERED":
      return "text-emerald-400";

    case "SHIPPED":
    case "IN_TRANSIT":
      return "text-blue-400";

    case "CONFIRMED":
    case "PROCESSING":
      return "text-violet-300";

    case "CANCELLED":
      return "text-red-400";

    case "REFUNDED":
      return "text-orange-400";

    default:
      return "text-yellow-400";
  }
}

function getPaymentStatusColor(status: string) {
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

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const orderId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    async function loadOrder() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/orders/${orderId}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data: OrderResponse = await response.json();

        if (!response.ok || !data.success || !data.order) {
          setError(data.message || "Unable to load order");
          return;
        }

        setOrder(data.order);
      } catch (error) {
        console.error("Load order error:", error);
        setError(
          "Something went wrong while loading your order."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  async function handleCancelOrder() {
    if (!order || cancelling) return;

    try {
      setCancelling(true);
      setCancelError("");

      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "CANCEL",
        }),
      });

      const data: OrderResponse = await response.json();

      if (!response.ok || !data.success) {
        setCancelError(
          data.message || "Unable to cancel this order."
        );
        return;
      }

      if (data.order) {
        setOrder((currentOrder) => {
          if (!currentOrder) return data.order!;

          return {
            ...currentOrder,
            ...data.order,
            payment:
              currentOrder.payment &&
              currentOrder.payment.status === "PENDING"
                ? {
                    ...currentOrder.payment,
                    status: "CANCELLED",
                  }
                : currentOrder.payment,
          };
        });
      } else {
        setOrder((currentOrder) =>
          currentOrder
            ? {
                ...currentOrder,
                status: "CANCELLED",
                payment:
                  currentOrder.payment &&
                  currentOrder.payment.status === "PENDING"
                    ? {
                        ...currentOrder.payment,
                        status: "CANCELLED",
                      }
                    : currentOrder.payment,
              }
            : currentOrder
        );
      }

      setShowCancelDialog(false);
    } catch (error) {
      console.error("Cancel order error:", error);

      setCancelError(
        "Something went wrong while cancelling the order."
      );
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-8 w-40 rounded bg-white/10" />
          <div className="mt-4 h-12 w-80 rounded bg-white/10" />
          <div className="mt-10 h-40 rounded-2xl bg-white/5" />
          <div className="mt-5 h-64 rounded-2xl bg-white/5" />
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-2xl rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-2xl">
            !
          </div>

          <h1 className="mt-5 text-2xl font-semibold">
            Unable to load order
          </h1>

          <p className="mt-3 text-sm text-white/50">
            {error || "The requested order could not be found."}
          </p>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-7 rounded-xl bg-violet-500 px-6 py-3 text-sm font-semibold transition hover:bg-violet-400"
          >
            Back to Shopping
          </button>
        </div>
      </main>
    );
  }

  const canCancel = isCancellableStatus(order.status);

  return (
    <main className="min-h-screen bg-black px-6 py-14 text-white">
      <div className="mx-auto max-w-6xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-10">
          <a
            href="/"
            className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-violet-400 transition-opacity hover:opacity-70"
          >
            NEXORA
          </a>

          <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Order Details
              </h1>

              <p className="mt-3 text-sm text-white/40">
                Thank you for your purchase.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-xs text-white/40">
                Order Number
              </p>

              <p className="mt-1 font-semibold text-violet-300">
                {order.orderNumber}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            SUCCESS / STATUS BANNER
        ===================================================== */}

        <div
          className={`mb-8 rounded-2xl border p-5 ${
            order.status === "CANCELLED"
              ? "border-red-500/20 bg-red-500/5"
              : "border-emerald-500/20 bg-emerald-500/5"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                order.status === "CANCELLED"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {order.status === "CANCELLED" ? "×" : "✓"}
            </div>

            <div>
              <h2 className="font-semibold">
                {order.status === "CANCELLED"
                  ? "Your order has been cancelled"
                  : "Your order has been placed successfully"}
              </h2>

              <p className="mt-1 text-sm text-white/40">
                {order.status === "CANCELLED"
                  ? "This order will no longer be processed."
                  : `Placed on ${formatDate(order.createdAt)}`}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            MAIN LAYOUT
        ===================================================== */}

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

          {/* ===================================================
              LEFT
          =================================================== */}

          <div className="space-y-6">

            {/* ORDER ITEMS */}

            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
              <h2 className="text-xl font-semibold">
                Items
              </h2>

              <div className="mt-6 divide-y divide-white/[0.08]">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-5 py-5 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <h3 className="truncate font-medium">
                        {item.productName}
                      </h3>

                      <p className="mt-1 text-sm text-white/40">
                        SKU: {item.sku}
                      </p>

                      <p className="mt-1 text-sm text-white/40">
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm text-white/40">
                        ${money(item.unitPrice)} ×{" "}
                        {item.quantity}
                      </p>

                      <p className="mt-1 font-semibold">
                        ${money(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SHIPPING INFORMATION */}

            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
              <h2 className="text-xl font-semibold">
                Shipping Information
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">

                <div>
                  <p className="text-xs uppercase tracking-wider text-white/30">
                    Name
                  </p>

                  <p className="mt-1 text-sm">
                    {order.shippingName}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-white/30">
                    Phone
                  </p>

                  <p className="mt-1 text-sm">
                    {order.shippingPhone}
                  </p>
                </div>

                {order.shippingDivision && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/30">
                      Division
                    </p>

                    <p className="mt-1 text-sm">
                      {order.shippingDivision}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs uppercase tracking-wider text-white/30">
                    City
                  </p>

                  <p className="mt-1 text-sm">
                    {order.shippingCity}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-wider text-white/30">
                    Address
                  </p>

                  <p className="mt-1 text-sm">
                    {order.shippingAddress}
                  </p>
                </div>

                {order.shippingPostalCode && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/30">
                      Postal Code
                    </p>

                    <p className="mt-1 text-sm">
                      {order.shippingPostalCode}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs uppercase tracking-wider text-white/30">
                    Country
                  </p>

                  <p className="mt-1 text-sm">
                    {order.shippingCountry}
                  </p>
                </div>

              </div>
            </section>

            {/* PAYMENT */}

            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
              <h2 className="text-xl font-semibold">
                Payment
              </h2>

              {order.payment ? (
                <div className="mt-5 space-y-4">

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-white/40">
                      Method
                    </span>

                    <span className="font-medium">
                      {formatStatus(order.payment.method)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-white/40">
                      Status
                    </span>

                    <span
                      className={getPaymentStatusColor(
                        order.payment.status
                      )}
                    >
                      {formatStatus(order.payment.status)}
                    </span>
                  </div>

                  {order.payment.transactionId && (
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-white/40">
                        Transaction ID
                      </span>

                      <span className="font-mono text-xs">
                        {order.payment.transactionId}
                      </span>
                    </div>
                  )}

                </div>
              ) : (
                <p className="mt-4 text-sm text-white/40">
                  Payment information is not available.
                </p>
              )}
            </section>

            {/* SHIPMENT */}

            {order.shipment && (
              <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
                <h2 className="text-xl font-semibold">
                  Delivery
                </h2>

                <div className="mt-5 space-y-4">

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-white/40">
                      Status
                    </span>

                    <span>
                      {formatStatus(order.shipment.status)}
                    </span>
                  </div>

                  {order.shipment.courier && (
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-white/40">
                        Courier
                      </span>

                      <span>
                        {order.shipment.courier}
                      </span>
                    </div>
                  )}

                  {order.shipment.trackingNumber && (
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-white/40">
                        Tracking Number
                      </span>

                      <span className="font-mono text-xs">
                        {order.shipment.trackingNumber}
                      </span>
                    </div>
                  )}

                </div>
              </section>
            )}

          </div>

          {/* ===================================================
              RIGHT SIDEBAR
          =================================================== */}

          <aside className="h-fit rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 lg:sticky lg:top-8">

            <h2 className="text-xl font-semibold">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4">

              <div className="flex justify-between text-sm">
                <span className="text-white/40">
                  Subtotal
                </span>

                <span>
                  ${money(order.subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-white/40">
                  Shipping
                </span>

                <span>
                  {Number(order.shippingCost) === 0
                    ? "Free"
                    : `$${money(order.shippingCost)}`}
                </span>
              </div>

              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">
                    Discount
                  </span>

                  <span className="text-emerald-400">
                    -${money(order.discountAmount)}
                  </span>
                </div>
              )}

              <div className="border-t border-white/[0.08] pt-5">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    Total
                  </span>

                  <span className="text-2xl font-semibold">
                    ${money(order.totalAmount)}
                  </span>
                </div>
              </div>

            </div>

            {/* ORDER STATUS */}

            <div className="mt-7 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
              <p className="text-xs uppercase tracking-wider text-white/30">
                Order Status
              </p>

              <p
                className={`mt-2 font-semibold ${getStatusColor(
                  order.status
                )}`}
              >
                {formatStatus(order.status)}
              </p>
            </div>

            {/* CANCEL ERROR */}

            {cancelError && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-sm text-red-400">
                  {cancelError}
                </p>
              </div>
            )}

            {/* CANCEL BUTTON */}

            {canCancel && (
              <button
                type="button"
                onClick={() => {
                  setCancelError("");
                  setShowCancelDialog(true);
                }}
                disabled={cancelling}
                className="mt-4 w-full rounded-xl border border-red-500/20 bg-red-500/5 py-3.5 text-sm font-semibold text-red-400 transition hover:border-red-500/30 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel Order
              </button>
            )}

            {/* CONTINUE SHOPPING */}

            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-6 w-full rounded-xl bg-violet-500 py-3.5 text-sm font-semibold transition hover:bg-violet-400"
            >
              Continue Shopping
            </button>

            {/* VIEW CART */}

            <button
              type="button"
              onClick={() => router.push("/cart")}
              className="mt-3 w-full rounded-xl border border-white/10 py-3.5 text-sm font-medium text-white/70 transition hover:border-white/20 hover:text-white"
            >
              View Cart
            </button>

          </aside>

        </div>
      </div>

      {/* =======================================================
          CANCEL CONFIRMATION DIALOG
      ======================================================= */}

      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111111] p-6 shadow-2xl">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-xl text-red-400">
              !
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Cancel this order?
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/45">
              Are you sure you want to cancel order{" "}
              <span className="font-medium text-white/70">
                {order.orderNumber}
              </span>
              ? This action cannot be undone.
            </p>

            {order.payment?.status === "PAID" && (
              <div className="mt-4 rounded-xl border border-orange-400/20 bg-orange-400/5 p-4">
                <p className="text-xs leading-5 text-orange-300/80">
                  This order has already been paid. Cancellation
                  will require refund processing.
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() => {
                  if (!cancelling) {
                    setShowCancelDialog(false);
                  }
                }}
                disabled={cancelling}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-white/60 transition hover:border-white/20 hover:text-white disabled:opacity-50"
              >
                Keep Order
              </button>

              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelling
                  ? "Cancelling..."
                  : "Yes, Cancel Order"}
              </button>

            </div>

          </div>
        </div>
      )}

    </main>
  );
}