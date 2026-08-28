"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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

type Props = {
  orders: Order[];
  loading: boolean;
  error: string;
};

type SortOption =
  | "NEWEST"
  | "OLDEST"
  | "HIGHEST"
  | "LOWEST";

const FILTERS = [
  "ALL",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

function formatDate(date: string) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "—";
  }

  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date: string) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return value.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatMoney(value: string | number) {
  return `৳${Number(value || 0).toFixed(2)}`;
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

function statusClass(status: string) {
  switch (status) {
    case "DELIVERED":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "SHIPPED":
      return "border-sky-400/20 bg-sky-400/10 text-sky-300";

    case "PROCESSING":
      return "border-violet-400/20 bg-violet-400/10 text-violet-300";

    case "CONFIRMED":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";

    case "CANCELLED":
      return "border-red-400/20 bg-red-400/10 text-red-300";

    case "REFUNDED":
      return "border-orange-400/20 bg-orange-400/10 text-orange-300";

    default:
      return "border-yellow-400/20 bg-yellow-400/10 text-yellow-300";
  }
}

function paymentLabel(method?: string) {
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
      return "Not specified";
  }
}

function paymentClass(status?: string) {
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

function getTimeline(order: Order) {
  return [
    {
      key: "PLACED",
      label: "Order Placed",
      icon: "✓",
      done: true,
    },
    {
      key: "CONFIRMED",
      label: "Payment Confirmed",
      icon: "✓",
      done:
        order.payment?.status === "PAID" ||
        [
          "CONFIRMED",
          "PROCESSING",
          "SHIPPED",
          "DELIVERED",
        ].includes(order.status),
    },
    {
      key: "PROCESSING",
      label: "Packed",
      icon: "✓",
      done: [
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
      ].includes(order.status),
    },
    {
      key: "SHIPPED",
      label: "Shipped",
      icon: "✓",
      done: ["SHIPPED", "DELIVERED"].includes(
        order.status,
      ),
    },
    {
      key: "DELIVERED",
      label: "Delivered",
      icon: "✓",
      done: order.status === "DELIVERED",
    },
  ];
}

export default function MobileOrders({
  orders,
  loading,
  error,
}: Props) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<(typeof FILTERS)[number]>("ALL");

  const [sort, setSort] =
    useState<SortOption>("NEWEST");

  const [filterOpen, setFilterOpen] =
    useState(false);

  const [expandedId, setExpandedId] =
    useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.orderNumber
          .toLowerCase()
          .includes(query) ||
        order.items.some((item) =>
          item.productName
            .toLowerCase()
            .includes(query),
        );

      const matchesFilter =
        activeFilter === "ALL" ||
        order.status === activeFilter;

      return matchesSearch && matchesFilter;
    });

    return [...result].sort((a, b) => {
      if (sort === "OLDEST") {
        return (
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
        );
      }

      if (sort === "HIGHEST") {
        return (
          Number(b.totalAmount) -
          Number(a.totalAmount)
        );
      }

      if (sort === "LOWEST") {
        return (
          Number(a.totalAmount) -
          Number(b.totalAmount)
        );
      }

      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    });
  }, [
    orders,
    search,
    activeFilter,
    sort,
  ]);

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="space-y-4">

        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-52 animate-pulse rounded-[28px] border border-white/[0.07] bg-white/[0.025]"
          />
        ))}

      </div>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error) {
    return (
      <div className="rounded-[28px] border border-red-400/20 bg-red-400/[0.04] px-6 py-12 text-center">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-400/10 text-xl text-red-400">
          !
        </div>

        <h2 className="mt-5 text-lg font-semibold">
          Unable to load orders
        </h2>

        <p className="mt-2 text-sm leading-6 text-white/35">
          {error}
        </p>

        <button
          type="button"
          onClick={() =>
            window.location.reload()
          }
          className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition active:scale-[0.98]"
        >
          Try Again
        </button>

      </div>
    );
  }

  /*
   * ============================================================
   * EMPTY
   * ============================================================
   */

  if (orders.length === 0) {
    return (
      <div className="px-5 py-12 text-center">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] border border-violet-400/10 bg-violet-500/[0.07] text-3xl">
          ◇
        </div>

        <h2 className="mt-7 text-xl font-semibold">
          No orders yet
        </h2>

        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-white/35">
          Your purchases will appear here
          once you place your first order.
        </p>

        <Link
          href="/products"
          className="mt-7 inline-flex rounded-2xl bg-violet-500 px-7 py-3.5 text-sm font-semibold text-white transition active:scale-[0.98]"
        >
          Start Shopping
        </Link>

      </div>
    );
  }

  /*
   * ============================================================
   * MAIN
   * ============================================================
   */

  return (
    <div className="space-y-5">

      {/* ========================================================
          SEARCH
      ======================================================== */}

      <div className="relative">

        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-white/25">
          ⌕
        </span>

        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search orders..."
          className="h-12 w-full rounded-2xl border border-white/[0.07] bg-white/[0.025] pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 transition focus:border-violet-400/30 focus:bg-white/[0.035]"
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.06] text-xs text-white/40"
          >
            ×
          </button>
        )}

      </div>

      {/* ========================================================
          STATUS FILTERS
      ======================================================== */}

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">

        {FILTERS.map((filter) => {
          const active =
            activeFilter === filter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() =>
                setActiveFilter(filter)
              }
              className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-medium transition active:scale-[0.97] ${
                active
                  ? "border-violet-400/30 bg-violet-500 text-white"
                  : "border-white/[0.07] bg-white/[0.025] text-white/40"
              }`}
            >
              {filter === "ALL"
                ? "All"
                : formatStatus(filter)}
            </button>
          );
        })}

      </div>

      {/* ========================================================
          RESULTS / FILTER BUTTON
      ======================================================== */}

      <div className="flex items-center justify-between">

        <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-white/25">
          {filteredOrders.length}{" "}
          {filteredOrders.length === 1
            ? "Order"
            : "Orders"}
        </p>

        <button
          type="button"
          onClick={() =>
            setFilterOpen(true)
          }
          className="flex min-h-10 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 text-[10px] font-medium text-white/50 transition active:scale-[0.97]"
        >
          <span className="text-sm">
            ☷
          </span>

          Filter & Sort
        </button>

      </div>

      {/* ========================================================
          NO FILTER RESULTS
      ======================================================== */}

      {filteredOrders.length === 0 && (
        <div className="rounded-[28px] border border-white/[0.07] bg-white/[0.025] px-6 py-12 text-center">

          <div className="text-3xl text-white/20">
            ⌕
          </div>

          <h3 className="mt-4 text-base font-semibold">
            No matching orders
          </h3>

          <p className="mt-2 text-sm text-white/30">
            Try another search or filter.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setActiveFilter("ALL");
              setSort("NEWEST");
            }}
            className="mt-5 text-sm font-medium text-violet-400"
          >
            Clear filters
          </button>

        </div>
      )}

      {/* ========================================================
          ORDER CARDS
      ======================================================== */}

      {filteredOrders.map((order) => {
        const expanded =
          expandedId === order.id;

        const itemCount =
          order.items.reduce(
            (total, item) =>
              total + item.quantity,
            0,
          );

        const timeline =
          getTimeline(order);

        return (
          <article
            key={order.id}
            className="overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.025] transition-colors"
          >

            {/* --------------------------------------------------
                ORDER SUMMARY
            -------------------------------------------------- */}

            <button
              type="button"
              onClick={() =>
                setExpandedId(
                  expanded ? null : order.id,
                )
              }
              className="w-full p-5 text-left"
            >

              <div className="flex items-start justify-between gap-4">

                <div className="min-w-0">

                  <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-white/25">
                    Order
                  </p>

                  <p className="mt-1 text-sm font-semibold text-violet-300">
                    #{order.orderNumber}
                  </p>

                  <p className="mt-2 text-[10px] text-white/30">
                    {formatDate(
                      order.createdAt,
                    )}

                    <span className="mx-1.5 text-white/10">
                      •
                    </span>

                    {formatTime(
                      order.createdAt,
                    )}
                  </p>

                </div>

                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1.5 text-[9px] font-medium ${statusClass(
                    order.status,
                  )}`}
                >
                  {formatStatus(
                    order.status,
                  )}
                </span>

              </div>

              <div className="mt-5 flex items-center gap-3">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.035] text-lg text-white/40">
                  ◇
                </div>

                <div className="min-w-0 flex-1">

                  <p className="truncate text-sm font-medium text-white/75">
                    {order.items[0]
                      ?.productName ||
                      "Order Items"}
                  </p>

                  <p className="mt-1 text-[10px] text-white/30">
                    {itemCount}{" "}
                    {itemCount === 1
                      ? "item"
                      : "items"}
                  </p>

                </div>

                <div className="shrink-0 text-right">

                  <p className="text-sm font-semibold">
                    {formatMoney(
                      order.totalAmount,
                    )}
                  </p>

                  <span
                    className={`mt-1 inline-block text-base text-white/20 transition-transform duration-300 ${
                      expanded
                        ? "rotate-180"
                        : ""
                    }`}
                  >
                    ⌄
                  </span>

                </div>

              </div>

            </button>

            {/* ==================================================
                EXPANDED ORDER
            ================================================== */}

            {expanded && (
              <div className="border-t border-white/[0.07] px-5 pb-5">

                {/* ------------------------------------------------
                    PROGRESS
                ------------------------------------------------ */}

                <div className="pt-6">

                  <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-white/25">
                    Order Progress
                  </p>

                  <div className="mt-5">

                    {timeline.map(
                      (stage, index) => {
                        const last =
                          index ===
                          timeline.length - 1;

                        return (
                          <div
                            key={stage.key}
                            className="relative flex gap-4"
                          >

                            {!last && (
                              <div
                                className={`absolute left-[10px] top-6 h-[calc(100%-2px)] w-px ${
                                  stage.done
                                    ? "bg-violet-400/30"
                                    : "bg-white/[0.07]"
                                }`}
                              />
                            )}

                            <div
                              className={`relative z-10 flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full border text-[9px] ${
                                stage.done
                                  ? "border-violet-400/40 bg-violet-500 text-white"
                                  : "border-white/[0.1] bg-white/[0.03] text-white/20"
                              }`}
                            >
                              {stage.icon}
                            </div>

                            <div className="pb-6">

                              <p
                                className={`text-xs ${
                                  stage.done
                                    ? "text-white/70"
                                    : "text-white/25"
                                }`}
                              >
                                {stage.label}
                              </p>

                              {index === 0 && (
                                <p className="mt-1 text-[9px] text-white/25">
                                  {formatDate(
                                    order.createdAt,
                                  )}{" "}
                                  •{" "}
                                  {formatTime(
                                    order.createdAt,
                                  )}
                                </p>
                              )}

                            </div>

                          </div>
                        );
                      },
                    )}

                  </div>

                </div>

                {/* ------------------------------------------------
                    PAYMENT
                ------------------------------------------------ */}

                <div className="border-t border-white/[0.07] pt-5">

                  <div className="flex items-center justify-between gap-4">

                    <div>

                      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/25">
                        Payment
                      </p>

                      <p className="mt-1 text-xs text-white/55">
                        {paymentLabel(
                          order.payment
                            ?.method,
                        )}
                      </p>

                    </div>

                    {order.payment && (
                      <span
                        className={`text-[10px] font-medium ${paymentClass(
                          order.payment
                            .status,
                        )}`}
                      >
                        {formatStatus(
                          order.payment
                            .status,
                        )}
                      </span>
                    )}

                  </div>

                </div>

                {/* ------------------------------------------------
                    ORDER SUMMARY
                ------------------------------------------------ */}

                <div className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">

                  <div className="flex justify-between text-xs">

                    <span className="text-white/30">
                      Subtotal
                    </span>

                    <span className="text-white/60">
                      {formatMoney(
                        order.subtotal,
                      )}
                    </span>

                  </div>

                  <div className="mt-3 flex justify-between text-xs">

                    <span className="text-white/30">
                      Shipping
                    </span>

                    <span className="text-white/60">
                      {Number(
                        order.shippingCost,
                      ) === 0
                        ? "Free"
                        : formatMoney(
                            order.shippingCost,
                          )}
                    </span>

                  </div>

                  {Number(
                    order.discountAmount,
                  ) > 0 && (
                    <div className="mt-3 flex justify-between text-xs">

                      <span className="text-white/30">
                        Discount
                      </span>

                      <span className="text-emerald-400">
                        -
                        {formatMoney(
                          order.discountAmount,
                        )}
                      </span>

                    </div>
                  )}

                  <div className="mt-4 border-t border-white/[0.06] pt-4">

                    <div className="flex items-end justify-between">

                      <span className="text-sm text-white/40">
                        Total
                      </span>

                      <span className="text-lg font-semibold">
                        {formatMoney(
                          order.totalAmount,
                        )}
                      </span>

                    </div>

                  </div>

                </div>

                {/* ------------------------------------------------
                    DETAILS BUTTON
                ------------------------------------------------ */}

                <Link
                  href={`/orders/${order.id}`}
                  className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-violet-500 text-sm font-semibold text-white transition active:scale-[0.99] active:bg-violet-400"
                >
                  View Details
                  <span className="ml-2">
                    →
                  </span>
                </Link>

              </div>
            )}

          </article>
        );
      })}

      {/* ========================================================
          FILTER / SORT BOTTOM SHEET
          
          FIXED:
          - z-[70] puts it above bottom navigation
          - max-h-[88dvh]
          - overflow-y-auto
          - safe-area padding
          - Apply button remains visible
      ======================================================== */}

      {filterOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">

          {/* Backdrop */}

          <button
            type="button"
            aria-label="Close filters"
            onClick={() =>
              setFilterOpen(false)
            }
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Bottom Sheet */}

          <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto overscroll-contain rounded-t-[32px] border-t border-white/[0.08] bg-[#0c0d12] px-5 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-5 shadow-2xl">

            {/* Drag Handle */}

            <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-white/15" />

            {/* Header */}

            <div className="flex items-center justify-between">

              <h2 className="text-lg font-semibold text-white">
                Filter Orders
              </h2>

              <button
                type="button"
                onClick={() => {
                  setActiveFilter("ALL");
                  setSort("NEWEST");
                }}
                className="rounded-lg px-2 py-1 text-xs font-medium text-violet-400 transition active:bg-violet-400/10 active:opacity-70"
              >
                Reset
              </button>

            </div>

            {/* Status */}

            <div className="mt-7">

              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">
                Filter by Status
              </p>

              <div className="mt-3 flex flex-wrap gap-2">

                {FILTERS.map((filter) => {
                  const active =
                    activeFilter ===
                    filter;

                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() =>
                        setActiveFilter(
                          filter,
                        )
                      }
                      className={`rounded-xl border px-3.5 py-2.5 text-[11px] font-medium transition active:scale-[0.97] ${
                        active
                          ? "border-violet-400/30 bg-violet-500 text-white"
                          : "border-white/[0.07] bg-white/[0.025] text-white/40"
                      }`}
                    >
                      {filter ===
                      "ALL"
                        ? "All"
                        : formatStatus(
                            filter,
                          )}
                    </button>
                  );
                })}

              </div>

            </div>

            {/* Sort */}

            <div className="mt-7">

              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">
                Sort by
              </p>

              <div className="mt-3 space-y-2">

                {(
                  [
                    [
                      "NEWEST",
                      "Newest First",
                    ],
                    [
                      "OLDEST",
                      "Oldest First",
                    ],
                    [
                      "HIGHEST",
                      "Highest Amount",
                    ],
                    [
                      "LOWEST",
                      "Lowest Amount",
                    ],
                  ] as const
                ).map(
                  ([value, label]) => {
                    const active =
                      sort === value;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setSort(value)
                        }
                        className={`flex min-h-12 w-full items-center justify-between rounded-xl border px-4 py-3 text-xs font-medium transition active:scale-[0.995] ${
                          active
                            ? "border-violet-400/20 bg-violet-500/10 text-white"
                            : "border-white/[0.06] bg-white/[0.02] text-white/40"
                        }`}
                      >

                        <span>
                          {label}
                        </span>

                        {active && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/15 text-[10px] text-violet-300">
                            ✓
                          </span>
                        )}

                      </button>
                    );
                  },
                )}

              </div>

            </div>

            {/* Apply */}

            <button
              type="button"
              onClick={() =>
                setFilterOpen(false)
              }
              className="mt-7 flex h-12 w-full items-center justify-center rounded-2xl bg-violet-500 text-sm font-semibold text-white shadow-lg shadow-violet-500/15 transition active:scale-[0.99] active:bg-violet-400"
            >
              Apply Filters
            </button>

          </div>

        </div>
      )}

    </div>
  );
}