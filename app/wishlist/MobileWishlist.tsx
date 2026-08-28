"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Heart,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

import MobileBottomNav from "@/app/components/MobileBottomNav";

type WishlistItem = {
  id: string;
  productId: string;
  createdAt: string;
  product: Record<string, any>;
};

type MobileWishlistProps = {
  items: WishlistItem[];
  loading: boolean;
  error: string;
  isAuthenticated: boolean;
  cartCount: number;
  removingId: string | null;
  onRemove: (productId: string) => void;
  onBack: () => void;
  onContinueShopping: () => void;
};

function getProductName(product: Record<string, any>) {
  return (
    product?.name ??
    product?.title ??
    product?.productName ??
    "Nexora Product"
  );
}

function getProductImage(product: Record<string, any>) {
  if (
    Array.isArray(product?.images) &&
    product.images.length > 0
  ) {
    const primary =
      product.images.find(
        (item: any) =>
          item?.isPrimary &&
          typeof item?.url === "string",
      ) ?? product.images[0];

    if (
      typeof primary === "string" &&
      primary.trim()
    ) {
      return primary.trim();
    }

    if (
      typeof primary?.url === "string" &&
      primary.url.trim()
    ) {
      return primary.url.trim();
    }
  }

  for (const candidate of [
    product?.image,
    product?.imageUrl,
    product?.thumbnail,
  ]) {
    if (
      typeof candidate === "string" &&
      candidate.trim()
    ) {
      return candidate.trim();
    }
  }

  return null;
}

function getProductPrice(product: Record<string, any>) {
  const price =
    product?.price ??
    product?.salePrice ??
    product?.sellingPrice ??
    null;

  if (
    price === null ||
    price === undefined ||
    price === ""
  ) {
    return null;
  }

  const numericPrice = Number(price);

  if (!Number.isNaN(numericPrice)) {
    return `৳${numericPrice.toFixed(2)}`;
  }

  return String(price);
}

function getProductCategory(
  product: Record<string, any>,
) {
  const category =
    product?.category?.name ??
    product?.categoryName ??
    product?.category ??
    "";

  return typeof category === "string"
    ? category
    : "";
}

function getStockState(product: Record<string, any>) {
  const stock =
    product?.stock ??
    product?.stockQuantity ??
    product?.quantity ??
    product?.inventory?.quantity;

  if (
    stock !== undefined &&
    stock !== null &&
    stock !== ""
  ) {
    const numericStock = Number(stock);

    if (!Number.isNaN(numericStock)) {
      return numericStock > 0
        ? "In stock"
        : "Out of stock";
    }
  }

  if (
    product?.inStock === false ||
    product?.available === false
  ) {
    return "Out of stock";
  }

  return "Available";
}

function ShoppingBagIcon({
  size = 19,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 8h12l1 12H5L6 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  );
}

function ProductPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-950/30 via-[#101014] to-purple-950/20">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/[0.07] text-violet-300">
        <Heart size={23} />
      </div>
    </div>
  );
}

export default function MobileWishlist({
  items,
  loading,
  error,
  isAuthenticated,
  removingId,
  onRemove,
  onBack,
  onContinueShopping,
}: MobileWishlistProps) {
  const itemCount = items.length;

  /*
   * ============================================================
   * LOADING STATE
   * ============================================================
   */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050506] pb-24 text-white">
        <header className="border-b border-white/[0.06] bg-[#050506]">
          <div className="flex h-[62px] items-center justify-between px-4">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-white/[0.05]" />

            <div className="h-5 w-28 animate-pulse rounded bg-white/[0.05]" />

            <div className="h-10 w-10 animate-pulse rounded-xl bg-white/[0.05]" />
          </div>
        </header>

        <main className="px-4 pt-7">
          <div className="h-8 w-48 animate-pulse rounded bg-white/[0.05]" />

          <div className="mt-3 h-4 w-64 animate-pulse rounded bg-white/[0.04]" />

          <div className="mt-6 flex justify-between">
            <div className="h-10 w-24 animate-pulse rounded-xl bg-white/[0.04]" />

            <div className="h-10 w-36 animate-pulse rounded-xl bg-white/[0.04]" />
          </div>

          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-[174px] animate-pulse rounded-[24px] border border-white/[0.06] bg-white/[0.025]"
                />
              ),
            )}
          </div>
        </main>

        <MobileBottomNav />
      </div>
    );
  }

  /*
   * ============================================================
   * NOT AUTHENTICATED
   * ============================================================
   */

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050506] pb-24 text-white">
        <header className="border-b border-white/[0.06] bg-[#050506]">
          <div className="flex h-[62px] items-center justify-between px-4">
            <button
              type="button"
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/65 transition active:scale-95"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>

            <Link
              href="/"
              className="text-[12px] font-bold tracking-[0.25em]"
            >
              NEXORA
            </Link>

            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/60 transition active:scale-95"
              aria-label="Shopping cart"
            >
              <ShoppingBagIcon size={18} />
            </Link>
          </div>
        </header>

        <main className="flex min-h-[calc(100vh-130px)] items-center px-5 py-12">
          <div className="w-full rounded-[28px] border border-white/[0.07] bg-white/[0.025] px-6 py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
              <Heart size={28} />
            </div>

            <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
              Your Collection
            </p>

            <h1 className="mt-3 text-2xl font-semibold">
              Sign in to view your wishlist
            </h1>

            <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-white/35">
              Save products you love and access
              them from any device.
            </p>

            <div className="mt-7 space-y-2.5">
              <Link
                href="/login"
                className="flex h-12 items-center justify-center rounded-2xl bg-violet-500 text-sm font-semibold text-white transition active:scale-[0.99]"
              >
                Sign in
              </Link>

              <Link
                href="/products"
                className="flex h-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-sm font-medium text-white/65 transition active:scale-[0.99]"
              >
                Browse products
              </Link>
            </div>
          </div>
        </main>

        <MobileBottomNav />
      </div>
    );
  }

  /*
   * ============================================================
   * AUTHENTICATED WISHLIST
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-[#050506] pb-24 text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#050506]/95 backdrop-blur-xl">
        <div className="flex h-[62px] items-center justify-between px-4">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/65 transition active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>

          <Link
            href="/"
            className="text-[12px] font-bold tracking-[0.25em] text-white"
          >
            NEXORA
          </Link>

          <Link
            href="/cart"
            aria-label="Shopping cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/60 transition active:scale-95"
          >
            <ShoppingBagIcon size={18} />
          </Link>
        </div>
      </header>

      <main className="px-4 pt-7">
        {/* TITLE */}
        <section>
          <div className="flex items-center gap-2">
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-violet-400">
              Your Collection
            </p>

            <span className="h-1 w-1 rounded-full bg-violet-400" />
          </div>

          <div className="mt-2 flex items-center gap-2">
            <h1 className="text-[28px] font-semibold tracking-[-0.04em]">
              My Wishlist
            </h1>

            <Heart
              size={24}
              className="text-violet-400"
              fill="currentColor"
            />
          </div>

          <p className="mt-2 max-w-[310px] text-[12px] leading-5 text-white/35">
            Your favorite picks, saved for
            whenever you are ready.
          </p>
        </section>

        {/* COUNT + SORT */}
        {itemCount > 0 && (
          <section className="mt-6 flex items-center justify-between gap-2">
            <div className="flex shrink-0 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-2.5">
              <Heart
                size={14}
                className="text-violet-400"
                fill="currentColor"
              />

              <span className="text-[11px] font-medium text-white/65">
                {itemCount}{" "}
                {itemCount === 1
                  ? "item"
                  : "items"}
              </span>
            </div>

            <button
              type="button"
              className="flex min-w-0 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5 text-[10px] font-medium text-white/55 transition active:scale-[0.98]"
            >
              <SlidersHorizontal size={14} />

              <span className="truncate">
                Recently added
              </span>

              <ChevronDown size={13} />
            </button>
          </section>
        )}

        {/* ERROR */}
        {error && (
          <div className="mt-4 rounded-2xl border border-red-400/15 bg-red-500/[0.05] px-4 py-3.5 text-[11px] leading-5 text-red-300">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {itemCount === 0 && (
          <section className="mt-8 rounded-[28px] border border-white/[0.07] bg-white/[0.025] px-6 py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/[0.08] text-violet-300">
              <Heart size={28} />
            </div>

            <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.24em] text-violet-400">
              Nothing saved yet
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Your wishlist is empty
            </h2>

            <p className="mx-auto mt-3 max-w-xs text-[12px] leading-5 text-white/35">
              Save products you love and
              they will appear here.
            </p>

            <button
              type="button"
              onClick={onContinueShopping}
              className="mt-7 w-full rounded-2xl bg-violet-500 py-3.5 text-[12px] font-semibold text-white shadow-[0_10px_35px_rgba(124,58,237,0.16)] transition hover:bg-violet-400 active:scale-[0.99]"
            >
              Explore Products
              <span className="ml-2">
                →
              </span>
            </button>
          </section>
        )}

        {/* PRODUCTS */}
        {itemCount > 0 && (
          <section className="mt-5 space-y-3">
            {items.map((item) => {
              const product =
                item.product || {};

              const name =
                getProductName(product);

              const image =
                getProductImage(product);

              const price =
                getProductPrice(product);

              const category =
                getProductCategory(product);

              const stock =
                getStockState(product);

              const isRemoving =
                removingId ===
                item.productId;

              return (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-[24px] border border-white/[0.07] bg-white/[0.025] transition active:scale-[0.995]"
                >
                  <div className="flex gap-3 p-3">
                    {/* PRODUCT IMAGE */}
                    <Link
                      href={`/products/${item.productId}`}
                      className="relative h-[142px] w-[132px] shrink-0 overflow-hidden rounded-[18px] border border-white/[0.06] bg-[#0c0c10]"
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <ProductPlaceholder />
                      )}

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

                      <span className="absolute left-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-white shadow-[0_4px_18px_rgba(139,92,246,0.28)]">
                        <Heart
                          size={15}
                          fill="currentColor"
                        />
                      </span>
                    </Link>

                    {/* PRODUCT CONTENT */}
                    <div className="min-w-0 flex-1 py-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          {category && (
                            <p className="truncate text-[8px] font-semibold uppercase tracking-[0.14em] text-violet-400/75">
                              {category}
                            </p>
                          )}

                          <Link
                            href={`/products/${item.productId}`}
                            className="mt-1 block line-clamp-2 text-[13px] font-semibold leading-5 text-white/90"
                          >
                            {name}
                          </Link>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            onRemove(
                              item.productId,
                            )
                          }
                          disabled={isRemoving}
                          aria-label={`Remove ${name} from wishlist`}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.025] text-white/35 transition active:scale-90 hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isRemoving ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>

                      <div className="mt-2">
                        {price ? (
                          <p className="text-[16px] font-semibold tracking-tight text-violet-300">
                            {price}
                          </p>
                        ) : (
                          <p className="text-[11px] text-white/35">
                            View product
                          </p>
                        )}
                      </div>

                      <div className="mt-2 flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            stock ===
                            "Out of stock"
                              ? "bg-red-400"
                              : "bg-emerald-400"
                          }`}
                        />

                        <span
                          className={`text-[9px] font-medium ${
                            stock ===
                            "Out of stock"
                              ? "text-red-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {stock}
                        </span>
                      </div>

                      <Link
                        href={`/products/${item.productId}`}
                        className="mt-3 flex h-9 items-center justify-center gap-1 rounded-xl border border-violet-400/20 bg-violet-500/[0.06] text-[10px] font-semibold text-white/70 transition active:scale-[0.98] hover:bg-violet-500/10 hover:text-white"
                      >
                        View Product
                        <ChevronRight
                          size={13}
                        />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* CONTINUE SHOPPING */}
        {itemCount > 0 && (
          <section className="mt-6 overflow-hidden rounded-[24px] border border-violet-500/20 bg-gradient-to-r from-violet-500/[0.10] via-violet-500/[0.045] to-transparent p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
                <Heart size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  Love something?
                </p>

                <p className="mt-1 text-[10px] leading-4 text-white/35">
                  Keep discovering products
                  you'll love.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onContinueShopping}
              className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-violet-500 text-[11px] font-semibold text-white shadow-[0_8px_25px_rgba(124,58,237,0.15)] transition hover:bg-violet-400 active:scale-[0.99]"
            >
              Continue Shopping
              <span className="ml-2">
                →
              </span>
            </button>
          </section>
        )}

        {/* BOTTOM SPACE */}
        <div className="h-4" />
      </main>

      {/* SHARED NEXORA MOBILE NAVIGATION */}
      <MobileBottomNav /> 
    </div>
  );
}