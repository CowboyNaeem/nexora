"use client";

import Link from "next/link";

type OrderItem = {
  id: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;

  // Product image returned by the order API
  product?: {
    images?: {
      url: string;
    }[];
  } | null;

  imageUrl?: string | null;
  productImage?: string | null;
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

type MobileOrderDetailsProps = {
  order: Order;
  canCancel: boolean;
  cancelling: boolean;
  cancelError: string;
  onCancel: () => void;
  onContinueShopping: () => void;
  onViewCart: () => void;
  onBack: () => void;
};

function money(value: number | string) {
  const amount = Number(value);

  return Number.isFinite(amount)
    ? amount.toFixed(2)
    : "0.00";
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
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getStatusTone(status: string) {
  switch (status) {
    case "DELIVERED":
      return {
        text: "text-emerald-400",
        bg: "bg-emerald-400/10",
        border: "border-emerald-400/20",
      };

    case "SHIPPED":
    case "IN_TRANSIT":
      return {
        text: "text-blue-400",
        bg: "bg-blue-400/10",
        border: "border-blue-400/20",
      };

    case "CONFIRMED":
    case "PROCESSING":
      return {
        text: "text-violet-300",
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
      };

    case "CANCELLED":
      return {
        text: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
      };

    case "REFUNDED":
      return {
        text: "text-orange-400",
        bg: "bg-orange-400/10",
        border: "border-orange-400/20",
      };

    default:
      return {
        text: "text-yellow-400",
        bg: "bg-yellow-400/10",
        border: "border-yellow-400/20",
      };
  }
}

function getPaymentTone(status: string) {
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

function Icon({
  name,
  size = 18,
}: {
  name:
    | "back"
    | "check"
    | "box"
    | "truck"
    | "card"
    | "location"
    | "chevron"
    | "cart"
    | "home"
    | "copy";
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

  if (name === "back") {
    return (
      <svg {...common}>
        <path d="M15 18l-6-6 6-6" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg {...common}>
        <path d="M5 12l4 4L19 6" />
      </svg>
    );
  }

  if (name === "box") {
    return (
      <svg {...common}>
        <path d="M21 8l-9-5-9 5 9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </svg>
    );
  }

  if (name === "truck") {
    return (
      <svg {...common}>
        <path d="M3 6h11v10H3z" />
        <path d="M14 10h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </svg>
    );
  }

  if (name === "card") {
    return (
      <svg {...common}>
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
        />
        <path d="M3 10h18" />
        <path d="M7 15h3" />
      </svg>
    );
  }

  if (name === "location") {
    return (
      <svg {...common}>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (name === "chevron") {
    return (
      <svg {...common}>
        <path d="M9 18l6-6-6-6" />
      </svg>
    );
  }

  if (name === "cart") {
    return (
      <svg {...common}>
        <circle cx="9" cy="19" r="1.5" />
        <circle cx="18" cy="19" r="1.5" />
        <path d="M3 4h2l2.2 10.5h10.5L21 7H6" />
      </svg>
    );
  }

  if (name === "home") {
    return (
      <svg {...common}>
        <path d="M3 11l9-8 9 8" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }

  if (name === "copy") {
    return (
      <svg {...common}>
        <rect
          x="9"
          y="9"
          width="11"
          height="11"
          rx="2"
        />
        <path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" />
      </svg>
    );
  }

  return null;
}

function StatusTimeline({
  status,
}: {
  status: string;
}) {
  const steps = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
  ];

  const cancelled = status === "CANCELLED";
  const refunded = status === "REFUNDED";

  let currentIndex = steps.indexOf(status);

  if (status === "IN_TRANSIT") {
    currentIndex = 3;
  }

  if (currentIndex < 0) {
    currentIndex = 0;
  }

  return (
    <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
          Order progress
        </p>

        {cancelled && (
          <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-red-400">
            Cancelled
          </span>
        )}

        {refunded && (
          <span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-orange-400">
            Refunded
          </span>
        )}
      </div>

      {cancelled || refunded ? (
        <div className="mt-5 flex items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              cancelled
                ? "bg-red-500/10 text-red-400"
                : "bg-orange-400/10 text-orange-400"
            }`}
          >
            {cancelled ? "×" : "↻"}
          </div>

          <div>
            <p className="text-sm font-medium text-white">
              {cancelled
                ? "Order cancelled"
                : "Order refunded"}
            </p>

            <p className="mt-0.5 text-[11px] text-white/35">
              This order is no longer progressing.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <div className="flex items-start">
            {steps.map((step, index) => {
              const completed =
                index < currentIndex;

              const active =
                index === currentIndex;

              return (
                <div
                  key={step}
                  className="flex min-w-0 flex-1 items-start"
                >
                  <div className="flex min-w-0 flex-1 flex-col items-center">
                    <div className="relative flex w-full items-center justify-center">
                      {index > 0 && (
                        <div
                          className={`absolute right-1/2 top-1/2 h-px w-full -translate-y-1/2 ${
                            completed || active
                              ? "bg-violet-500/70"
                              : "bg-white/[0.08]"
                          }`}
                        />
                      )}

                      <div
                        className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border text-[9px] font-semibold ${
                          completed
                            ? "border-violet-500/40 bg-violet-500 text-white"
                            : active
                              ? "border-violet-400 bg-violet-500/20 text-violet-200 shadow-[0_0_18px_rgba(139,92,246,0.25)]"
                              : "border-white/[0.1] bg-[#0d0d10] text-white/25"
                        }`}
                      >
                        {completed ? (
                          <Icon
                            name="check"
                            size={13}
                          />
                        ) : (
                          index + 1
                        )}
                      </div>
                    </div>

                    <p
                      className={`mt-2 max-w-[54px] text-center text-[8px] font-semibold uppercase tracking-[0.08em] ${
                        active || completed
                          ? "text-white/65"
                          : "text-white/20"
                      }`}
                    >
                      {step === "IN_TRANSIT"
                        ? "In Transit"
                        : step}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Returns the best available product image.
 *
 * Supports:
 * 1. item.product.images[0].url
 * 2. item.imageUrl
 * 3. item.productImage
 *
 * If none exists, the UI falls back to the box icon.
 */
function getProductImage(
  item: OrderItem
) {
  const nestedImage =
    item.product?.images?.[0]?.url;

  if (nestedImage) {
    return nestedImage;
  }

  if (item.imageUrl) {
    return item.imageUrl;
  }

  if (item.productImage) {
    return item.productImage;
  }

  return null;
}

export default function MobileOrderDetails({
  order,
  canCancel,
  cancelling,
  cancelError,
  onCancel,
  onContinueShopping,
  onViewCart,
  onBack,
}: MobileOrderDetailsProps) {
  const statusTone = getStatusTone(
    order.status
  );

  return (
    <div className="min-h-screen bg-[#050506] pb-8 text-white">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#050506]/95 backdrop-blur-xl">
        <div className="flex h-[62px] items-center justify-between px-4">

          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/65 transition active:scale-95"
            aria-label="Go back"
          >
            <Icon
              name="back"
              size={19}
            />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-violet-500 text-xs font-bold shadow-[0_0_18px_rgba(139,92,246,0.25)]">
              N
            </div>

            <span className="text-[12px] font-bold tracking-[0.25em] text-white">
              NEXORA
            </span>
          </div>

          <button
            type="button"
            onClick={onViewCart}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/60 transition active:scale-95"
            aria-label="View cart"
          >
            <Icon
              name="cart"
              size={18}
            />
          </button>

        </div>
      </header>

      <main className="px-4 pb-10 pt-5">

        {/* ===================================================
            TITLE
        =================================================== */}

        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-violet-400">
            NEXORA / ORDERS
          </p>

          <div className="mt-3 flex items-end justify-between gap-4">

            <div className="min-w-0">
              <h1 className="text-[26px] font-semibold tracking-[-0.04em]">
                Order details
              </h1>

              <p className="mt-1 truncate text-[11px] text-white/35">
                {order.orderNumber}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] ${statusTone.bg} ${statusTone.border} ${statusTone.text}`}
            >
              {formatStatus(order.status)}
            </span>

          </div>
        </div>

        {/* ===================================================
            STATUS
        =================================================== */}

        <section
          className={`mt-5 rounded-2xl border p-4 ${
            order.status === "CANCELLED"
              ? "border-red-500/20 bg-red-500/[0.045]"
              : "border-violet-500/15 bg-violet-500/[0.035]"
          }`}
        >
          <div className="flex items-center gap-3">

            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                order.status === "CANCELLED"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-violet-500/10 text-violet-300"
              }`}
            >
              {order.status === "CANCELLED" ? (
                "×"
              ) : (
                <Icon
                  name="check"
                  size={18}
                />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold">
                {order.status === "CANCELLED"
                  ? "Order cancelled"
                  : "Order placed successfully"}
              </p>

              <p className="mt-1 text-[10px] leading-4 text-white/35">
                {order.status === "CANCELLED"
                  ? "This order will no longer be processed."
                  : `Placed on ${formatDate(
                      order.createdAt
                    )}`}
              </p>
            </div>

          </div>

          <StatusTimeline
            status={order.status}
          />
        </section>

        {/* ===================================================
            ORDER ITEMS
        =================================================== */}

        <section className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.025]">

          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4">

            <div className="flex items-center gap-2.5">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
                <Icon
                  name="box"
                  size={16}
                />
              </div>

              <div>
                <h2 className="text-sm font-semibold">
                  Order items
                </h2>

                <p className="mt-0.5 text-[9px] text-white/30">
                  {order.items.length}{" "}
                  {order.items.length === 1
                    ? "item"
                    : "items"}
                </p>
              </div>

            </div>

          </div>

          <div className="divide-y divide-white/[0.06] px-4">

            {order.items.map((item) => {
              const image =
                getProductImage(item);

              return (
                <div
                  key={item.id}
                  className="flex gap-3 py-4"
                >

                  {/* =========================================
                      PRODUCT IMAGE
                  ========================================= */}

                  <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border border-white/[0.06] bg-[#101014]">

                    {image ? (
                      <img
                        src={image}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";

                          const fallback =
                            event.currentTarget
                              .nextElementSibling;

                          if (
                            fallback instanceof
                            HTMLElement
                          ) {
                            fallback.style.display =
                              "flex";
                          }
                        }}
                      />
                    ) : null}

                    <div
                      className={`h-full w-full items-center justify-center text-white/20 ${
                        image
                          ? "hidden"
                          : "flex"
                      }`}
                    >
                      <Icon
                        name="box"
                        size={25}
                      />
                    </div>

                  </div>

                  {/* =========================================
                      PRODUCT INFORMATION
                  ========================================= */}

                  <div className="min-w-0 flex-1">

                    <h3 className="truncate text-[13px] font-medium text-white/90">
                      {item.productName}
                    </h3>

                    <p className="mt-1 truncate text-[9px] text-white/30">
                      SKU: {item.sku}
                    </p>

                    <p className="mt-2 text-[10px] text-white/40">
                      Qty {item.quantity} × $
                      {money(item.unitPrice)}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      ${money(item.totalPrice)}
                    </p>

                  </div>

                </div>
              );
            })}

          </div>
        </section>

        {/* ===================================================
            ORDER SUMMARY
        =================================================== */}

        <section className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">

          <div className="flex items-center gap-2.5">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
              <Icon
                name="card"
                size={16}
              />
            </div>

            <h2 className="text-sm font-semibold">
              Order summary
            </h2>

          </div>

          <div className="mt-5 space-y-3">

            <div className="flex items-center justify-between text-[12px]">
              <span className="text-white/35">
                Subtotal
              </span>

              <span className="text-white/70">
                ${money(order.subtotal)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[12px]">
              <span className="text-white/35">
                Shipping
              </span>

              <span
                className={
                  Number(order.shippingCost) ===
                  0
                    ? "text-emerald-400"
                    : "text-white/70"
                }
              >
                {Number(order.shippingCost) ===
                0
                  ? "Free"
                  : `$${money(
                      order.shippingCost
                    )}`}
              </span>
            </div>

            {Number(order.discountAmount) >
              0 && (
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-white/35">
                  Discount
                </span>

                <span className="text-emerald-400">
                  -$
                  {money(
                    order.discountAmount
                  )}
                </span>
              </div>
            )}

            <div className="border-t border-white/[0.07] pt-4">

              <div className="flex items-end justify-between">

                <div>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-white/30">
                    Total
                  </p>

                  <p className="mt-1 text-[20px] font-semibold tracking-tight text-white">
                    ${money(order.totalAmount)}
                  </p>
                </div>

                <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-violet-300">
                  Paid order
                </span>

              </div>

            </div>

          </div>
        </section>

        {/* ===================================================
            PAYMENT
        =================================================== */}

        <section className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">

          <div className="flex items-center gap-2.5">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
              <Icon
                name="card"
                size={16}
              />
            </div>

            <div>
              <h2 className="text-sm font-semibold">
                Payment
              </h2>

              <p className="mt-0.5 text-[9px] text-white/30">
                Payment information
              </p>
            </div>

          </div>

          {order.payment ? (
            <div className="mt-5 space-y-3.5">

              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] text-white/35">
                  Method
                </span>

                <span className="max-w-[58%] text-right text-[11px] font-medium text-white/75">
                  {formatStatus(
                    order.payment.method
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] text-white/35">
                  Status
                </span>

                <span
                  className={`text-[11px] font-medium ${getPaymentTone(
                    order.payment.status
                  )}`}
                >
                  {formatStatus(
                    order.payment.status
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] text-white/35">
                  Amount
                </span>

                <span className="text-[11px] font-medium text-white/75">
                  $
                  {money(
                    order.payment.amount
                  )}
                </span>
              </div>

              {order.payment
                .transactionId && (
                <div className="flex items-start justify-between gap-4">

                  <span className="text-[11px] text-white/35">
                    Transaction ID
                  </span>

                  <span className="max-w-[58%] break-all text-right font-mono text-[9px] text-white/60">
                    {
                      order.payment
                        .transactionId
                    }
                  </span>

                </div>
              )}

            </div>
          ) : (
            <p className="mt-4 text-[11px] text-white/30">
              Payment information is not available.
            </p>
          )}

        </section>

        {/* ===================================================
            DELIVERY
        =================================================== */}

        <section className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">

          <div className="flex items-center gap-2.5">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
              <Icon
                name="truck"
                size={16}
              />
            </div>

            <div>
              <h2 className="text-sm font-semibold">
                Delivery
              </h2>

              <p className="mt-0.5 text-[9px] text-white/30">
                Shipping & tracking
              </p>
            </div>

          </div>

          {order.shipment ? (
            <div className="mt-5 space-y-3.5">

              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] text-white/35">
                  Status
                </span>

                <span
                  className={`text-[11px] font-medium ${
                    getStatusTone(
                      order.shipment.status
                    ).text
                  }`}
                >
                  {formatStatus(
                    order.shipment.status
                  )}
                </span>
              </div>

              {order.shipment.courier && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[11px] text-white/35">
                    Courier
                  </span>

                  <span className="text-[11px] font-medium text-white/70">
                    {order.shipment.courier}
                  </span>
                </div>
              )}

              {order.shipment
                .trackingNumber && (
                <div className="flex items-center justify-between gap-4">

                  <span className="text-[11px] text-white/35">
                    Tracking
                  </span>

                  <span className="max-w-[58%] truncate text-right font-mono text-[9px] text-white/60">
                    {
                      order.shipment
                        .trackingNumber
                    }
                  </span>

                </div>
              )}

              {order.shipment.shippedAt && (
                <div className="flex items-center justify-between gap-4">

                  <span className="text-[11px] text-white/35">
                    Shipped
                  </span>

                  <span className="text-right text-[10px] text-white/55">
                    {formatDate(
                      order.shipment.shippedAt
                    )}
                  </span>

                </div>
              )}

              {order.shipment.deliveredAt && (
                <div className="flex items-center justify-between gap-4">

                  <span className="text-[11px] text-white/35">
                    Delivered
                  </span>

                  <span className="text-right text-[10px] text-emerald-400">
                    {formatDate(
                      order.shipment.deliveredAt
                    )}
                  </span>

                </div>
              )}

            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3.5">

              <p className="text-[11px] text-white/40">
                Shipment information will appear here
                once your order is shipped.
              </p>

            </div>
          )}

        </section>

        {/* ===================================================
            SHIPPING ADDRESS
        =================================================== */}

        <section className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">

          <div className="flex items-center gap-2.5">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
              <Icon
                name="location"
                size={16}
              />
            </div>

            <div>
              <h2 className="text-sm font-semibold">
                Delivery address
              </h2>

              <p className="mt-0.5 text-[9px] text-white/30">
                Where your order is going
              </p>
            </div>

          </div>

          <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3.5">

            <p className="text-[12px] font-medium text-white/80">
              {order.shippingName}
            </p>

            <p className="mt-1 text-[10px] text-white/40">
              {order.shippingPhone}
            </p>

            <p className="mt-3 text-[11px] leading-5 text-white/55">
              {order.shippingAddress}
              <br />
              {order.shippingCity}
              {order.shippingDivision
                ? `, ${order.shippingDivision}`
                : ""}
              {order.shippingPostalCode
                ? ` — ${order.shippingPostalCode}`
                : ""}
              <br />
              {order.shippingCountry}
            </p>

          </div>
        </section>

        {/* ===================================================
            CANCEL ERROR
        =================================================== */}

        {cancelError && (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-4">
            <p className="text-[11px] leading-5 text-red-400">
              {cancelError}
            </p>
          </div>
        )}

        {/* ===================================================
            ACTIONS
        =================================================== */}

        <div className="mt-6 space-y-3">

          {canCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={cancelling}
              className="w-full rounded-xl border border-red-500/20 bg-red-500/[0.045] py-3.5 text-[12px] font-semibold text-red-400 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelling
                ? "Cancelling..."
                : "Cancel order"}
            </button>
          )}

          <button
            type="button"
            onClick={onContinueShopping}
            className="w-full rounded-xl bg-violet-500 py-3.5 text-[12px] font-semibold text-white shadow-[0_8px_30px_rgba(139,92,246,0.16)] transition active:scale-[0.99]"
          >
            Continue shopping
          </button>

          <button
            type="button"
            onClick={onViewCart}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] py-3.5 text-[12px] font-medium text-white/60 transition active:scale-[0.99]"
          >
            View cart
          </button>

        </div>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <div className="mt-8 flex items-center justify-center gap-2 text-[9px] text-white/20">
          <span className="h-px w-8 bg-white/[0.06]" />
          <span>NEXORA MARKETPLACE</span>
          <span className="h-px w-8 bg-white/[0.06]" />
        </div>

      </main>
    </div>
  );
}