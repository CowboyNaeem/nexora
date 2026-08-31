"use client";

import Link from "next/link";
import { useMemo } from "react";
import MobileBottomNav from "@/app/components/MobileBottomNav";

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number | string;
    images?: {
      url: string;
    }[];
  };
};

type MobileCartProps = {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  error: string;
  notice: string;
  updateQuantity: (
    itemId: string,
    newQuantity: number,
  ) => void;
  removeItem: (itemId: string) => void;
  loading?: boolean;
};

function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded bg-white/[0.055] ${className}`}
    />
  );
}

export default function MobileCart({
  items,
  totalQuantity,
  subtotal,
  error,
  notice,
  updateQuantity,
  removeItem,
  loading = false,
}: MobileCartProps) {
  const shipping = 0;
  const total = subtotal + shipping;

  const itemLabel = useMemo(() => {
    if (totalQuantity === 1) return "1 ITEM";
    return `${totalQuantity} ITEMS`;
  }, [totalQuantity]);

  /*
   * =========================================================
   * LOADING STATE
   * =========================================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070709] pb-28 pt-5 text-white">
        <div className="mx-auto w-full max-w-md px-5">
          {/* =================================================
              HEADER SKELETON
          ================================================= */}

          <header className="flex items-center justify-between">
            <Skeleton className="h-11 w-11 rounded-2xl" />

            <div className="flex flex-col items-center">
              <Skeleton className="h-2.5 w-16 rounded" />
              <Skeleton className="mt-2 h-4 w-24 rounded-lg" />
            </div>

            <Skeleton className="h-11 w-11 rounded-2xl" />
          </header>

          {/* =================================================
              SHOPPING BAG HEADER
          ================================================= */}

          <section className="mt-8">
            <Skeleton className="h-2.5 w-24 rounded" />

            <div className="mt-3 flex items-end justify-between">
              <Skeleton className="h-7 w-40 rounded-lg" />

              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </section>

          {/* =================================================
              CART ITEMS
          ================================================= */}

          <section className="mt-7 space-y-3">
            {[1, 2, 3].map((item) => (
              <article
                key={item}
                className="relative overflow-hidden rounded-[22px] border border-white/[0.07] bg-white/[0.025] p-3.5"
              >
                <div className="flex gap-3">
                  {/* Product image */}

                  <Skeleton className="h-[92px] w-[92px] shrink-0 rounded-[17px]" />

                  {/* Product information */}

                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-3.5 w-[78%] rounded" />

                    <Skeleton className="mt-2 h-2.5 w-20 rounded" />

                    <Skeleton className="mt-3 h-4 w-20 rounded" />

                    <Skeleton className="mt-3 h-9 w-[108px] rounded-xl" />
                  </div>
                </div>

                {/* Remove button */}

                <Skeleton className="absolute right-3.5 top-3.5 h-8 w-8 rounded-full" />
              </article>
            ))}
          </section>

          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <section className="mt-6 overflow-hidden rounded-[24px] border border-white/[0.07] bg-white/[0.025]">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-2.5 w-16 rounded" />

                  <Skeleton className="mt-2 h-5 w-28 rounded-lg" />
                </div>

                <Skeleton className="h-10 w-10 rounded-full" />
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-10 rounded" />
                  <Skeleton className="h-3 w-7 rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-14 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-3 w-10 rounded" />
                </div>

                <div className="h-px bg-white/[0.06]" />

                <div className="flex items-end justify-between">
                  <Skeleton className="h-3 w-10 rounded" />
                  <Skeleton className="h-7 w-24 rounded-lg" />
                </div>
              </div>
            </div>

            {/* Checkout buttons */}

            <div className="border-t border-white/[0.07] p-4">
              <Skeleton className="h-13 w-full rounded-2xl" />

              <Skeleton className="mt-3 h-11 w-full rounded-2xl" />
            </div>
          </section>

          {/* =================================================
              TRUST STRIP
          ================================================= */}

          <section className="mt-5 grid grid-cols-3 gap-2 pb-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-2 py-3"
              >
                <Skeleton className="mx-auto h-4 w-4 rounded" />

                <Skeleton className="mx-auto mt-2 h-2.5 w-12 rounded" />

                <Skeleton className="mx-auto mt-1 h-2 w-14 rounded" />
              </div>
            ))}
          </section>
        </div>

        {/* ===================================================
            GLOBAL MOBILE BOTTOM NAVIGATION
        =================================================== */}

        <MobileBottomNav />
      </main>
    );
  }

  /*
   * =========================================================
   * NORMAL CART UI
   * =========================================================
   */

  return (
    <main className="min-h-screen bg-[#070709] pb-28 text-white">
      <div className="mx-auto w-full max-w-md px-5 pt-5">
        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="flex items-center justify-between">
          <Link
            href="/products"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-lg text-white/70 transition active:scale-95"
            aria-label="Back to products"
          >
            ←
          </Link>

          <div className="text-center">
            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-violet-400">
              NEXORA
            </p>

            <h1 className="mt-1 text-[17px] font-semibold tracking-[-0.02em]">
              Your Cart
            </h1>
          </div>

          <Link
            href="/wishlist"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-lg text-white/65 transition active:scale-95"
            aria-label="Wishlist"
          >
            ♡
          </Link>
        </header>

        {/* ===================================================
            CART COUNT
        =================================================== */}

        <div className="mt-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-400">
            SHOPPING BAG
          </p>

          <div className="mt-2 flex items-end justify-between">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">
              {items.length === 0
                ? "Your cart"
                : "Ready to checkout?"}
            </h2>

            {items.length > 0 && (
              <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1 text-[10px] font-medium text-white/45">
                {itemLabel}
              </span>
            )}
          </div>
        </div>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs leading-5 text-red-300">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ===================================================
            SUCCESS NOTICE
        =================================================== */}

        {notice && (
          <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3">
            <p className="text-xs text-emerald-300">
              ✓ {notice}
            </p>
          </div>
        )}

        {/* ===================================================
            EMPTY CART
        =================================================== */}

        {items.length === 0 ? (
          <section className="mt-8 rounded-[28px] border border-white/[0.07] bg-white/[0.025] px-6 py-14 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/[0.08]">
              <span className="text-3xl text-violet-300">
                ♡
              </span>
            </div>

            <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">
              NEXORA CART
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-3 max-w-[270px] text-xs leading-6 text-white/35">
              Discover something worth bringing home.
              Your next favorite product might be waiting.
            </p>

            <Link
              href="/products"
              className="mt-7 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-sm font-semibold text-white shadow-lg shadow-violet-500/15 transition active:scale-[0.98]"
            >
              Explore Products →
            </Link>
          </section>
        ) : (
          <>
            {/* =================================================
                CART ITEMS
            ================================================= */}

            <section className="mt-7 space-y-3">
              {items.map((item) => {
                const price = Number(
                  item.product.price,
                );

                const image =
                  item.product.images &&
                  item.product.images.length > 0
                    ? item.product.images[0].url
                    : null;

                const itemTotal =
                  price * item.quantity;

                return (
                  <article
                    key={item.id}
                    className="relative overflow-hidden rounded-[22px] border border-white/[0.07] bg-white/[0.025] p-3.5"
                  >
                    <div className="flex gap-3">
                      {/* Product image */}

                      <div className="h-[92px] w-[92px] shrink-0 overflow-hidden rounded-[17px] bg-white/[0.04]">
                        {image ? (
                          <img
                            src={image}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl text-white/15">
                            ◇
                          </div>
                        )}
                      </div>

                      {/* Product information */}

                      <div className="min-w-0 flex-1 pr-7">
                        <h3 className="truncate text-[13px] font-medium text-white/90">
                          {item.product.name}
                        </h3>

                        <p className="mt-1 text-xs text-white/35">
                          ${price.toFixed(2)} each
                        </p>

                        <p className="mt-2 text-[15px] font-semibold text-white">
                          ${itemTotal.toFixed(2)}
                        </p>

                        {/* Quantity */}

                        <div className="mt-3 inline-flex h-9 items-center overflow-hidden rounded-xl border border-white/[0.09] bg-black/30">
                          <button
                            type="button"
                            disabled={item.quantity <= 1}
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity - 1,
                              )
                            }
                            className="flex h-full w-9 items-center justify-center text-base text-white/55 transition active:bg-white/10 disabled:cursor-not-allowed disabled:opacity-25"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>

                          <span className="flex h-full min-w-9 items-center justify-center border-x border-white/[0.08] px-2 text-xs font-semibold">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity + 1,
                              )
                            }
                            className="flex h-full w-9 items-center justify-center text-base text-white/65 transition active:bg-white/10"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Remove */}

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(item.id)
                      }
                      className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] bg-black/30 text-sm text-white/35 transition active:scale-90 active:text-red-400"
                      aria-label={`Remove ${item.product.name}`}
                    >
                      ×
                    </button>
                  </article>
                );
              })}
            </section>

            {/* =================================================
                ORDER SUMMARY
            ================================================= */}

            <section className="mt-6 overflow-hidden rounded-[24px] border border-white/[0.07] bg-white/[0.025]">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                      SUMMARY
                    </p>

                    <h2 className="mt-1 text-lg font-semibold">
                      Order total
                    </h2>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/[0.1] text-violet-300">
                    ✓
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">
                      Items
                    </span>

                    <span className="text-white/75">
                      {totalQuantity}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">
                      Subtotal
                    </span>

                    <span className="text-white/75">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">
                      Shipping
                    </span>

                    <span className="text-emerald-400">
                      Free
                    </span>
                  </div>

                  <div className="h-px bg-white/[0.07]" />

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

              {/* Checkout */}

              <div className="border-t border-white/[0.07] p-4">
                <Link
                  href="/checkout"
                  className="flex h-13 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-sm font-semibold text-white shadow-lg shadow-violet-500/15 transition active:scale-[0.98]"
                >
                  Proceed to Checkout

                  <span className="ml-2 text-base">
                    →
                  </span>
                </Link>

                <Link
                  href="/products"
                  className="mt-3 flex h-11 w-full items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.02] text-xs font-medium text-white/50 transition active:bg-white/[0.05] active:text-white/80"
                >
                  Continue Shopping
                </Link>
              </div>
            </section>

            {/* =================================================
                TRUST STRIP
            ================================================= */}

            <section className="mt-5 grid grid-cols-3 gap-2 pb-6">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-2 py-3 text-center">
                <div className="text-sm text-violet-300">
                  ◇
                </div>

                <p className="mt-1 text-[9px] font-medium text-white/60">
                  Secure
                </p>

                <p className="mt-0.5 text-[8px] text-white/25">
                  Checkout
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-2 py-3 text-center">
                <div className="text-sm text-violet-300">
                  ↗
                </div>

                <p className="mt-1 text-[9px] font-medium text-white/60">
                  Fast
                </p>

                <p className="mt-0.5 text-[8px] text-white/25">
                  Delivery
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-2 py-3 text-center">
                <div className="text-sm text-violet-300">
                  ↻
                </div>

                <p className="mt-1 text-[9px] font-medium text-white/60">
                  Easy
                </p>

                <p className="mt-0.5 text-[8px] text-white/25">
                  Returns
                </p>
              </div>
            </section>
          </>
        )}
      </div>

      {/* =======================================================
          SHARED MOBILE BOTTOM NAVIGATION
      ======================================================= */}

      <MobileBottomNav />
    </main>
  );
}