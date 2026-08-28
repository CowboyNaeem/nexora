"use client";

import Link from "next/link";
import type { ChangeEvent } from "react";

type PaymentMethod =
  | "CASH_ON_DELIVERY"
  | "MOBILE_BANKING";

type MobileProvider =
  | "BKASH"
  | "NAGAD"
  | "ROCKET";

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number | string;
    sku?: string;
    images?: {
      url: string;
    }[];
  };
  variant?: {
    id: string;
    name: string;
    price: number | string | null;
    sku: string;
  } | null;
};

type MobileCheckoutProps = {
  items: CartItem[];

  name: string;
  email: string;
  phone: string;
  division: string;
  city: string;
  address: string;
  postalCode: string;

  paymentMethod: PaymentMethod;
  mobileProvider: MobileProvider;
  transactionId: string;

  error: string;
  placingOrder: boolean;

  availableCities: string[];
  divisions: Record<string, string[]>;

  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  total: number;

  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setPhone: (value: string) => void;
  setCity: (value: string) => void;
  setAddress: (value: string) => void;
  setPostalCode: (value: string) => void;
  setPaymentMethod: (
    value: PaymentMethod
  ) => void;
  setMobileProvider: (
    value: MobileProvider
  ) => void;
  setTransactionId: (value: string) => void;

  handleDivisionChange: (value: string) => void;
  placeOrder: () => void;
};

const inputClass =
  "w-full rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-violet-400/50 focus:bg-white/[0.055]";

const selectClass =
  "w-full rounded-2xl border border-white/[0.08] bg-[#111111] px-4 py-3.5 text-sm text-white outline-none transition focus:border-violet-400/50";

export default function MobileCheckout({
  items,

  name,
  email,
  phone,
  division,
  city,
  address,
  postalCode,

  paymentMethod,
  mobileProvider,
  transactionId,

  error,
  placingOrder,

  availableCities,
  divisions,

  subtotal,
  shippingCost,
  discountAmount,
  total,

  setName,
  setEmail,
  setPhone,
  setCity,
  setAddress,
  setPostalCode,
  setPaymentMethod,
  setMobileProvider,
  setTransactionId,

  handleDivisionChange,
  placeOrder,
}: MobileCheckoutProps) {
  return (
    <main className="min-h-screen bg-[#070709] pb-32 text-white">
      <div className="mx-auto w-full max-w-md px-5 pb-8 pt-5">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="flex items-center justify-between">
          <Link
            href="/cart"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-lg text-white/65 transition active:scale-95"
            aria-label="Back to cart"
          >
            ←
          </Link>

          <div className="text-center">
            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-violet-400">
              NEXORA
            </p>

            <h1 className="mt-1 text-[17px] font-semibold tracking-tight">
              Checkout
            </h1>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-sm text-emerald-400">
            ✓
          </div>
        </header>

        {/* =====================================================
            PROGRESS
        ===================================================== */}

        <section className="mt-7">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold">
                1
              </span>

              <span className="text-[10px] font-medium text-white/70">
                Shipping
              </span>
            </div>

            <div className="mx-2 h-px flex-1 bg-violet-500/30" />

            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/15 text-[10px] font-bold text-violet-300">
                2
              </span>

              <span className="text-[10px] font-medium text-white/50">
                Payment
              </span>
            </div>

            <div className="mx-2 h-px flex-1 bg-white/[0.08]" />

            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] text-[10px] font-bold text-white/35">
                3
              </span>

              <span className="text-[10px] font-medium text-white/35">
                Review
              </span>
            </div>
          </div>
        </section>

        {/* =====================================================
            INTRO
        ===================================================== */}

        <section className="mt-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-400">
            COMPLETE YOUR ORDER
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">
            Almost yours.
          </h2>

          <p className="mt-2 text-xs leading-6 text-white/35">
            Enter your delivery details and choose your
            preferred payment method.
          </p>
        </section>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4">
            <div className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-xs text-red-400">
                !
              </div>

              <p className="text-xs leading-5 text-red-300">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            SHIPPING
        ===================================================== */}

        <section className="mt-6 overflow-hidden rounded-[26px] border border-white/[0.07] bg-white/[0.025]">

          <div className="border-b border-white/[0.06] p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/[0.1] text-violet-300">
                01
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-violet-400">
                  Shipping
                </p>

                <h3 className="mt-1 text-base font-semibold">
                  Delivery information
                </h3>
              </div>

            </div>
          </div>

          <div className="space-y-4 p-5">

            {/* Full name */}

            <div>
              <label className="mb-2 block text-[11px] font-medium text-white/55">
                Full name
              </label>

              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Your full name"
                autoComplete="name"
                className={inputClass}
              />
            </div>

            {/* Email */}

            <div>
              <label className="mb-2 block text-[11px] font-medium text-white/55">
                Email address
              </label>

              <input
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="you@example.com"
                type="email"
                inputMode="email"
                autoComplete="email"
                className={inputClass}
              />

              <p className="mt-2 text-[9px] text-white/25">
                Used for order updates & tracking.
              </p>
            </div>

            {/* Phone */}

            <div>
              <label className="mb-2 block text-[11px] font-medium text-white/55">
                Phone number
              </label>

              <input
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="01XXXXXXXXX"
                type="tel"
                inputMode="tel"
                maxLength={11}
                autoComplete="tel"
                className={inputClass}
              />

              
            </div>

            {/* Division */}

            <div>
              <label className="mb-2 block text-[11px] font-medium text-white/55">
                Division
              </label>

              <select
                value={division}
                onChange={(event) =>
                  handleDivisionChange(
                    event.target.value
                  )
                }
                className={selectClass}
              >
                <option value="">
                  Select division
                </option>

                {Object.keys(divisions).map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* District */}

            <div>
              <label className="mb-2 block text-[11px] font-medium text-white/55">
                District
              </label>

              <select
                value={city}
                onChange={(event) =>
                  setCity(event.target.value)
                }
                disabled={!division}
                className={`${selectClass} disabled:cursor-not-allowed disabled:opacity-35`}
              >
                <option value="">
                  {division
                    ? "Select district"
                    : "Select division first"}
                </option>

                {availableCities.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Address */}

            <div>
              <label className="mb-2 block text-[11px] font-medium text-white/55">
                Full address
              </label>

              <textarea
                value={address}
                onChange={(event) =>
                  setAddress(event.target.value)
                }
                placeholder="House / Flat, Road, Area, Thana..."
                rows={4}
                autoComplete="street-address"
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Postal */}

            <div>
              <label className="mb-2 block text-[11px] font-medium text-white/55">
                Postal code
                <span className="ml-2 text-[9px] text-white/25">
                  Optional
                </span>
              </label>

              <input
                value={postalCode}
                onChange={(event) =>
                  setPostalCode(
                    event.target.value
                  )
                }
                placeholder="1205"
                inputMode="numeric"
                className={inputClass}
              />
            </div>

            {/* Country */}

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="text-[9px] uppercase tracking-[0.16em] text-white/25">
                Country
              </p>

              <p className="mt-2 text-sm text-white/65">
                🇧🇩 Bangladesh
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            PAYMENT
        ===================================================== */}

        <section className="mt-5 overflow-hidden rounded-[26px] border border-white/[0.07] bg-white/[0.025]">

          <div className="border-b border-white/[0.06] p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/[0.1] text-violet-300">
                02
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-violet-400">
                  Payment
                </p>

                <h3 className="mt-1 text-base font-semibold">
                  Choose payment
                </h3>
              </div>

            </div>
          </div>

          <div className="p-5">

            {/* COD */}

            <button
              type="button"
              onClick={() => {
                setPaymentMethod(
                  "CASH_ON_DELIVERY"
                );
                setTransactionId("");
              }}
              className={`w-full rounded-2xl border p-4 text-left transition active:scale-[0.99] ${
                paymentMethod ===
                "CASH_ON_DELIVERY"
                  ? "border-violet-400/50 bg-violet-500/[0.08]"
                  : "border-white/[0.07] bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/[0.08] text-lg">
                  💵
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    Cash on Delivery
                  </p>

                  <p className="mt-1 text-[10px] text-white/35">
                    Pay when your order arrives.
                  </p>
                </div>

                <div
                  className={`h-5 w-5 rounded-full border ${
                    paymentMethod ===
                    "CASH_ON_DELIVERY"
                      ? "border-violet-400 bg-violet-400"
                      : "border-white/20"
                  }`}
                >
                  {paymentMethod ===
                    "CASH_ON_DELIVERY" && (
                    <div className="m-1 h-2.5 w-2.5 rounded-full bg-[#070709]" />
                  )}
                </div>

              </div>
            </button>

            {/* Mobile Banking */}

            <button
              type="button"
              onClick={() =>
                setPaymentMethod(
                  "MOBILE_BANKING"
                )
              }
              className={`mt-3 w-full rounded-2xl border p-4 text-left transition active:scale-[0.99] ${
                paymentMethod ===
                "MOBILE_BANKING"
                  ? "border-violet-400/50 bg-violet-500/[0.08]"
                  : "border-white/[0.07] bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/[0.1] text-lg">
                  📱
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    Mobile Banking
                  </p>

                  <p className="mt-1 text-[10px] text-white/35">
                    bKash, Nagad or Rocket
                  </p>
                </div>

                <div
                  className={`h-5 w-5 rounded-full border ${
                    paymentMethod ===
                    "MOBILE_BANKING"
                      ? "border-violet-400 bg-violet-400"
                      : "border-white/20"
                  }`}
                >
                  {paymentMethod ===
                    "MOBILE_BANKING" && (
                    <div className="m-1 h-2.5 w-2.5 rounded-full bg-[#070709]" />
                  )}
                </div>

              </div>
            </button>

            {/* Mobile banking details */}

            {paymentMethod ===
              "MOBILE_BANKING" && (
              <div className="mt-4 rounded-2xl border border-violet-400/15 bg-violet-500/[0.035] p-4">

                <p className="text-[11px] font-medium text-white/65">
                  Select provider
                </p>

                <div className="mt-3 grid grid-cols-3 gap-2">

                  {(
                    [
                      "BKASH",
                      "NAGAD",
                      "ROCKET",
                    ] as MobileProvider[]
                  ).map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => {
                        setMobileProvider(
                          provider
                        );
                        setTransactionId("");
                      }}
                      className={`rounded-xl border px-2 py-3 text-[11px] font-medium transition active:scale-95 ${
                        mobileProvider ===
                        provider
                          ? "border-violet-400 bg-violet-500/10 text-white"
                          : "border-white/[0.07] bg-white/[0.02] text-white/45"
                      }`}
                    >
                      {provider ===
                      "BKASH"
                        ? "bKash"
                        : provider ===
                            "NAGAD"
                          ? "Nagad"
                          : "Rocket"}
                    </button>
                  ))}

                </div>

                {/* Payment instruction */}

                <div className="mt-4 rounded-2xl border border-white/[0.07] bg-black/20 p-4">

                  <p className="text-[11px] font-medium">
                    Payment instructions
                  </p>

                  <p className="mt-2 text-[10px] leading-5 text-white/35">
                    Send the exact amount using{" "}
                    <span className="text-violet-300">
                      {mobileProvider ===
                      "BKASH"
                        ? "bKash"
                        : mobileProvider ===
                            "NAGAD"
                          ? "Nagad"
                          : "Rocket"}
                    </span>
                    .
                  </p>

                  <div className="mt-3 rounded-xl border border-emerald-400/15 bg-emerald-500/[0.04] p-3">

                    <p className="text-[9px] uppercase tracking-wider text-white/25">
                      Amount to pay
                    </p>

                    <p className="mt-1 text-lg font-semibold text-emerald-300">
                      ৳{total.toFixed(2)}
                    </p>

                  </div>

                  <div className="mt-3 rounded-xl border border-white/[0.07] bg-black/30 p-3">

                    <p className="text-[9px] uppercase tracking-wider text-white/25">
                      Send Money to
                    </p>

                    <p className="mt-1 text-sm font-semibold text-violet-300">
                      {mobileProvider ===
                      "BKASH"
                        ? process.env
                            .NEXT_PUBLIC_BKASH_NUMBER
                        : mobileProvider ===
                            "NAGAD"
                          ? process.env
                              .NEXT_PUBLIC_NAGAD_NUMBER
                          : process.env
                              .NEXT_PUBLIC_ROCKET_NUMBER}
                    </p>

                  </div>

                  <p className="mt-3 text-[9px] leading-5 text-white/25">
                    After completing the payment,
                    enter your transaction ID below.
                  </p>

                </div>

                {/* Transaction ID */}

                <div className="mt-4">

                  <label className="mb-2 block text-[11px] font-medium text-white/55">
                    Transaction ID
                    <span className="ml-2 text-[9px] text-red-400">
                      Required
                    </span>
                  </label>

                  <input
                    value={transactionId}
                    onChange={(event) =>
                      setTransactionId(
                        event.target.value
                          .replace(/\s+/g, "")
                          .toUpperCase()
                      )
                    }
                    placeholder={`Enter ${mobileProvider} transaction ID`}
                    autoComplete="off"
                    className={inputClass}
                  />

                </div>

              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            ORDER REVIEW
        ===================================================== */}

        <section className="mt-5 overflow-hidden rounded-[26px] border border-white/[0.07] bg-white/[0.025]">

          <div className="border-b border-white/[0.06] p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/[0.1] text-violet-300">
                03
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-violet-400">
                  Review
                </p>

                <h3 className="mt-1 text-base font-semibold">
                  Your order
                </h3>
              </div>

            </div>
          </div>

          <div className="p-5">

            {/* Items */}

            <div className="space-y-4">

              {items.map((item) => {
                const price =
                  item.variant &&
                  item.variant.price !== null
                    ? Number(
                        item.variant.price
                      )
                    : Number(
                        item.product.price
                      );

                const image =
                  item.product.images &&
                  item.product.images.length >
                    0
                    ? item.product.images[0]
                        .url
                    : null;

                return (
                  <div
                    key={item.id}
                    className="flex gap-3"
                  >

                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/[0.04]">

                      {image ? (
                        <img
                          src={image}
                          alt={
                            item.product.name
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-white/15">
                          ◇
                        </div>
                      )}

                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-500 px-1 text-[9px] font-bold">
                        {item.quantity}
                      </span>

                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-xs font-medium text-white/80">
                        {item.product.name}
                      </p>

                      {item.variant && (
                        <p className="mt-1 truncate text-[9px] text-white/30">
                          {item.variant.name}
                        </p>
                      )}

                      <p className="mt-2 text-[10px] text-white/35">
                        ${price.toFixed(2)} ×{" "}
                        {item.quantity}
                      </p>

                    </div>

                    <p className="text-xs font-semibold">
                      $
                      {(
                        price *
                        item.quantity
                      ).toFixed(2)}
                    </p>

                  </div>
                );
              })}

            </div>

            {/* Totals */}

            <div className="mt-6 space-y-3 border-t border-white/[0.07] pt-5">

              <div className="flex justify-between text-xs">
                <span className="text-white/35">
                  Subtotal
                </span>

                <span className="text-white/70">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-white/35">
                  Shipping
                </span>

                <span className="text-emerald-400">
                  {shippingCost === 0
                    ? "Free"
                    : `$${shippingCost.toFixed(
                        2
                      )}`}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-white/35">
                    Discount
                  </span>

                  <span className="text-emerald-400">
                    -$
                    {discountAmount.toFixed(
                      2
                    )}
                  </span>
                </div>
              )}

              <div className="border-t border-white/[0.07] pt-4">

                <div className="flex items-end justify-between">

                  <span className="text-sm font-medium text-white/65">
                    Total
                  </span>

                  <span className="text-2xl font-semibold tracking-[-0.03em]">
                    ${total.toFixed(2)}
                  </span>

                </div>

              </div>
            </div>

          </div>
        </section>

        {/* =====================================================
            TRUST
        ===================================================== */}

        <div className="mt-5 grid grid-cols-3 gap-2">

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-2 py-3 text-center">
            <p className="text-sm text-violet-300">
              ◇
            </p>

            <p className="mt-1 text-[9px] font-medium text-white/55">
              Secure
            </p>

            <p className="mt-0.5 text-[8px] text-white/20">
              Payment
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-2 py-3 text-center">
            <p className="text-sm text-violet-300">
              ↗
            </p>

            <p className="mt-1 text-[9px] font-medium text-white/55">
              Fast
            </p>

            <p className="mt-0.5 text-[8px] text-white/20">
              Delivery
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-2 py-3 text-center">
            <p className="text-sm text-violet-300">
              ✓
            </p>

            <p className="mt-1 text-[9px] font-medium text-white/55">
              Protected
            </p>

            <p className="mt-0.5 text-[8px] text-white/20">
              Checkout
            </p>
          </div>

        </div>

      </div>

      {/* =====================================================
          FIXED MOBILE CHECKOUT BAR
      ===================================================== */}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] bg-[#070709]/95 px-4 pb-[env(safe-area-inset-bottom)] pt-3 backdrop-blur-xl">

        <div className="mx-auto flex max-w-md items-center gap-3">

          <div className="min-w-0 flex-1">

            <p className="text-[9px] uppercase tracking-[0.16em] text-white/25">
              Total
            </p>

            <p className="mt-0.5 text-lg font-semibold">
              ${total.toFixed(2)}
            </p>

          </div>

          <button
            type="button"
            onClick={placeOrder}
            disabled={placingOrder}
            className="flex h-12 flex-[1.55] items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-xs font-semibold text-white shadow-lg shadow-violet-500/15 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {placingOrder
              ? "Placing order..."
              : "Place Order →"}
          </button>

        </div>
      </div>
    </main>
  );
}