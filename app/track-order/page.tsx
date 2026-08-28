"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Mail,
  PackageSearch,
  Phone,
  Search,
  ShieldCheck,
} from "lucide-react";

type TrackedOrder = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string | number;
  createdAt: string;
  shippingName: string;
  shippingPhone: string;
  shippingEmail: string;
  shippingDivision: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string | null;
  shippingCountry: string;
};

type TrackOrderResponse = {
  success?: boolean;
  message?: string;
  orders?: TrackedOrder[];
  count?: number;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Order Placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatAmount(value: string | number) {
  const amount =
    typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(amount)) {
    return "৳0";
  }

  return `৳${amount.toLocaleString("en-BD", {
    maximumFractionDigits: 2,
  })}`;
}

export default function TrackOrderPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<TrackedOrder[]>([]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setOrders([]);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (!cleanEmail) {
      setError(
        "Please enter the email address used during checkout.",
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail,
      )
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!cleanPhone) {
      setError(
        "Please enter the phone number used during checkout.",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          email: cleanEmail,
          phone: cleanPhone,
        }),
      });

      const data: TrackOrderResponse =
        await response.json();

      if (
        !response.ok ||
        !data.success ||
        !data.orders?.length
      ) {
        throw new Error(
          data.message ||
            "We couldn't find an order with those details.",
        );
      }

      setOrders(data.orders);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to track your order. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setError("");
    setOrders([]);
    setEmail("");
    setPhone("");
  }

  return (
    <main className="min-h-screen bg-[#08080b] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-600/[0.08] blur-[120px]" />
        <div className="absolute bottom-[-180px] right-[-120px] h-[360px] w-[360px] rounded-full bg-purple-500/[0.05] blur-[120px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-28 pt-8 sm:px-6 sm:pt-10 md:pb-12 lg:px-8">
        <div className="mb-8 flex items-center gap-2 text-xs text-white/35">
          <Link
            href="/"
            className="transition-colors hover:text-white/70"
          >
            Home
          </Link>
          <span className="text-white/15">/</span>
          <span className="text-white/60">
            Track Order
          </span>
        </div>

        <section className="mx-auto w-full max-w-2xl text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/[0.08] shadow-[0_0_35px_rgba(139,92,246,0.12)]">
            <PackageSearch
              className="h-6 w-6 text-violet-300"
              strokeWidth={1.7}
            />
          </div>

          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-300/80">
            NEXORA ORDER SERVICES
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Track Your Order
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/45 sm:text-[15px]">
            Check your order status anytime.
            No account is required.
          </p>
        </section>

        <section className="mx-auto mt-8 w-full max-w-2xl">
          <div className="rounded-3xl border border-white/[0.08] bg-[#101014]/95 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-7">
            {orders.length > 0 ? (
              <div>
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/15 bg-emerald-400/[0.08]">
                    <CheckCircle2
                      className="h-7 w-7 text-emerald-300"
                      strokeWidth={1.7}
                    />
                  </div>

                  <h2 className="mt-4 text-xl font-semibold text-white">
                    {orders.length === 1
                      ? "Order Found"
                      : `${orders.length} Orders Found`}
                  </h2>

                  <p className="mt-1 text-sm text-white/40">
                    {orders.length === 1
                      ? "Your order information is available below."
                      : "Select an order below to view its details and progress."}
                  </p>
                </div>

                <div className="mt-7 space-y-3">
                  {orders.map((order) => {
                    const statusLabel =
                      STATUS_LABELS[order.status] ||
                      order.status;

                    return (
                      <div
                        key={order.id}
                        className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/30">
                              Order Number
                            </p>

                            <p className="mt-1 break-all text-sm font-semibold text-white sm:text-base">
                              {order.orderNumber}
                            </p>

                            <p className="mt-1 text-[11px] text-white/30">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>

                          <div className="shrink-0 rounded-full border border-violet-400/15 bg-violet-500/[0.08] px-3 py-1.5 text-[10px] font-semibold text-violet-300">
                            {statusLabel}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/[0.06] pt-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">
                              Total
                            </p>
                            <p className="mt-0.5 text-sm font-semibold text-white">
                              {formatAmount(
                                order.totalAmount,
                              )}
                            </p>
                          </div>

                          <Link
                            href={`/orders/${order.id}`}
                            className="group inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 text-xs font-semibold text-white shadow-[0_8px_30px_rgba(139,92,246,0.18)] transition-all hover:bg-violet-400 active:scale-[0.98]"
                          >
                            View Order
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-4 min-h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-5 text-sm font-medium text-white/65 transition-all hover:border-white/[0.13] hover:bg-white/[0.045] hover:text-white active:scale-[0.98]"
                >
                  Track Another Order
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04]">
                      <ClipboardList
                        className="h-4 w-4 text-white/60"
                        strokeWidth={1.7}
                      />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold text-white">
                        Find your order
                      </h2>

                      <p className="mt-0.5 text-xs text-white/35">
                        Enter the email and phone used at checkout.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="mb-5 rounded-xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3 text-sm leading-5 text-red-200/85"
                  >
                    {error}
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-xs font-medium text-white/65"
                    >
                      Email Address
                    </label>

                    <div className="relative">
                      <Mail
                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25"
                        strokeWidth={1.7}
                      />

                      <input
                        id="email"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                        disabled={loading}
                        className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/20 transition-all focus:border-violet-400/35 focus:bg-white/[0.04] focus:ring-2 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-xs font-medium text-white/65"
                    >
                      Phone Number
                    </label>

                    <div className="relative">
                      <Phone
                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25"
                        strokeWidth={1.7}
                      />

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="01XXXXXXXXX"
                        value={phone}
                        onChange={(event) =>
                          setPhone(event.target.value)
                        }
                        disabled={loading}
                        className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/20 transition-all focus:border-violet-400/35 focus:bg-white/[0.04] focus:ring-2 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(139,92,246,0.16)] transition-all hover:bg-violet-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Finding Orders...
                      </>
                    ) : (
                      <>
                        <Search
                          className="h-4 w-4 transition-transform group-hover:scale-105"
                          strokeWidth={1.9}
                        />
                        Find My Orders
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.018] px-4 py-3.5">
                  <ShieldCheck
                    className="mt-0.5 h-4 w-4 shrink-0 text-violet-300/60"
                    strokeWidth={1.7}
                  />

                  <p className="text-[11px] leading-5 text-white/35">
                    Your order details are protected by
                    matching the email and phone number
                    used during checkout.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="mx-auto mt-6 w-full max-w-2xl text-center">
          <p className="text-xs text-white/30">
            Need to continue shopping?
          </p>

          <Link
            href="/products"
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-violet-300/75 transition-colors hover:text-violet-200"
          >
            Browse Products
            <ArrowRight className="h-3 w-3" />
          </Link>
        </section>
      </div>
    </main>
  );
}
