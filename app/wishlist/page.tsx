"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Trash2 } from "lucide-react";

type WishlistItem = {
  id: string;
  productId: string;
  createdAt: string;
  product: Record<string, any>;
};

type WishlistResponse = {
  success: boolean;
  message?: string;
  count?: number;
  items?: WishlistItem[];
};

/* =========================================================
   PRODUCT HELPERS
========================================================= */

function getProductName(product: Record<string, any>) {
  return (
    product?.name ??
    product?.title ??
    product?.productName ??
    "Nexora Product"
  );
}

function getProductImage(product: Record<string, any>) {
  // Prefer the ProductImage records used by NEXORA.
  // A legacy `image` field can contain a stale/invalid URL.
  if (Array.isArray(product?.images) && product.images.length > 0) {
    const primary =
      product.images.find(
        (item: any) =>
          item?.isPrimary && typeof item?.url === "string",
      ) ?? product.images[0];

    if (typeof primary === "string" && primary.trim()) {
      return primary.trim();
    }

    if (
      typeof primary?.url === "string" &&
      primary.url.trim()
    ) {
      return primary.url.trim();
    }
  }

  // Fallbacks for older API response shapes.
  for (const candidate of [
    product?.image,
    product?.imageUrl,
    product?.thumbnail,
  ]) {
    if (typeof candidate === "string" && candidate.trim()) {
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

  if (price === null || price === undefined || price === "") {
    return null;
  }

  const numericPrice = Number(price);

  if (!Number.isNaN(numericPrice)) {
    return `৳${numericPrice.toFixed(2)}`;
  }

  return String(price);
}

function getProductCategory(product: Record<string, any>) {
  const category =
    product?.category?.name ??
    product?.categoryName ??
    product?.category ??
    "";

  return typeof category === "string" ? category : "";
}

/* =========================================================
   SHOPPING BAG ICON

   This is intentionally the same SVG shape used by the
   main NEXORA StoreHeader so the wishlist cart icon matches
   the homepage/header cart icon.
========================================================= */

function ShoppingBagIcon({ size = 19 }: { size?: number }) {
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

/* =========================================================
   PAGE
========================================================= */

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Cart count shown in the header.
  const [cartCount, setCartCount] = useState(0);

  /* =======================================================
     LOAD WISHLIST
  ======================================================= */

  async function loadWishlist() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/wishlist", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data: WishlistResponse = await response.json();

      if (response.status === 401) {
        setIsAuthenticated(false);
        setItems([]);
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load your wishlist.",
        );
      }

      setIsAuthenticated(true);
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error("Wishlist loading error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your wishlist.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     LOAD CART COUNT

     Uses the same /api/cart endpoint and the same counting
     method as the main NEXORA StoreHeader.
  ======================================================= */

  async function loadCartCount() {
    try {
      const response = await fetch("/api/cart", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        setCartCount(0);
        return;
      }

      const data = await response.json();

      if (data?.success && data?.cart) {
        setCartCount(data.cart.items?.length ?? 0);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error(
        "Wishlist cart count loading error:",
        error,
      );

      setCartCount(0);
    }
  }

  useEffect(() => {
    loadWishlist();
    loadCartCount();
  }, []);

  /* =======================================================
     REMOVE FROM WISHLIST
  ======================================================= */

  async function removeFromWishlist(productId: string) {
    try {
      setRemovingId(productId);
      setError("");

      const response = await fetch(
        `/api/wishlist?productId=${encodeURIComponent(productId)}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to remove product.",
        );
      }

      setItems((current) =>
        current.filter(
          (item) => item.productId !== productId,
        ),
      );
    } catch (err) {
      console.error("Wishlist removal error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove product.",
      );
    } finally {
      setRemovingId(null);
    }
  }

  /* =======================================================
     COUNTS / TEXT
  ======================================================= */

  const itemCount = items.length;

  const headingText = useMemo(() => {
    if (itemCount === 0) {
      return "Your saved products";
    }

    return `${itemCount} ${
      itemCount === 1 ? "product" : "products"
    } saved`;
  }, [itemCount]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#050506] text-white">
      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#050506]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-6 lg:px-10">

          {/* LOGO */}

          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label="Nexora home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-lg font-black shadow-[0_0_28px_rgba(124,58,237,0.28)] transition group-hover:scale-[1.03]">
              N
            </span>

            <span className="hidden text-[15px] font-bold tracking-[0.24em] text-white sm:block">
              NEXORA
            </span>
          </Link>

          {/* HEADER ACTIONS */}

          <div className="flex items-center gap-2">

            {/* BACK TO SHOP */}

            <Link
              href="/"
              className="group hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-2 text-xs font-medium text-white/55 transition hover:border-white/15 hover:bg-white/[0.05] hover:text-white sm:inline-flex"
            >
              <ArrowLeft
                size={15}
                className="transition-transform group-hover:-translate-x-0.5"
              />

              Back to shop
            </Link>

            {/* CART */}

            <Link
              href="/cart"
              aria-label={
                cartCount > 0
                  ? `Shopping cart, ${cartCount} ${
                      cartCount === 1 ? "item" : "items"
                    }`
                  : "Shopping cart"
              }
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] text-white/60 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white"
            >
              <ShoppingBagIcon size={19} />

              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-600 px-1 text-[9px] font-bold leading-none text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ===================================================
          PAGE
      =================================================== */}

      <section className="relative overflow-hidden">

        {/* SUBTLE PREMIUM BACKGROUND */}

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[12%] top-[-180px] h-[420px] w-[420px] rounded-full bg-violet-600/[0.07] blur-[120px]" />

          <div className="absolute right-[8%] top-[80px] h-[300px] w-[300px] rounded-full bg-purple-500/[0.05] blur-[110px]" />

          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-[1500px] px-6 pb-20 pt-14 lg:px-10 lg:pt-20">

          {/* =================================================
              BREADCRUMB
          ================================================= */}

          <div className="mb-8 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
            <Link
              href="/"
              className="transition hover:text-violet-300"
            >
              Nexora
            </Link>

            <span>/</span>

            <span className="text-violet-300">
              Wishlist
            </span>
          </div>

          {/* =================================================
              PAGE HEADING
          ================================================= */}

          <div className="mb-10 border-b border-white/[0.07] pb-9">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

              <div className="min-w-0">

                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                    <Heart
                      size={16}
                      fill="currentColor"
                    />
                  </span>

                  <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-300">
                    Your Collection
                  </span>
                </div>

                <h1 className="text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
                  Wishlist
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-white/40 sm:text-[15px]">
                  Keep the products you love in one place
                  and come back whenever you are ready to
                  shop.
                </p>
              </div>

              {!loading &&
                isAuthenticated &&
                itemCount > 0 && (
                  <div className="flex w-fit shrink-0 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-xs text-white/55">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.8)]" />

                    {headingText}
                  </div>
                )}
            </div>
          </div>

          {/* =================================================
              AUTHENTICATION STATE
          ================================================= */}

          {!loading && !isAuthenticated && (
            <div className="mx-auto max-w-2xl rounded-[28px] border border-white/[0.08] bg-white/[0.025] px-8 py-16 text-center shadow-2xl">

              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                <Heart size={28} />
              </div>

              <h2 className="text-2xl font-semibold">
                Sign in to view your wishlist
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/40">
                Your saved products are connected to your
                Nexora account. Sign in to access them.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">

                <Link
                  href="/login"
                  className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
                >
                  Sign in
                </Link>

                <Link
                  href="/products"
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
                >
                  Browse products
                </Link>
              </div>
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {!loading &&
            error &&
            isAuthenticated && (
              <div className="mb-8 rounded-2xl border border-red-400/15 bg-red-500/[0.05] px-5 py-4 text-sm text-red-300">
                {error}
              </div>
            )}

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-[24px] border border-white/[0.07] bg-white/[0.025]"
                  >
                    <div className="aspect-[4/5] animate-pulse bg-white/[0.04]" />

                    <div className="space-y-3 p-5">
                      <div className="h-3 w-20 animate-pulse rounded bg-white/[0.06]" />

                      <div className="h-5 w-3/4 animate-pulse rounded bg-white/[0.06]" />

                      <div className="h-4 w-24 animate-pulse rounded bg-white/[0.06]" />
                    </div>
                  </div>
                ),
              )}
            </div>
          )}

          {/* =================================================
              EMPTY WISHLIST
          ================================================= */}

          {!loading &&
            isAuthenticated &&
            itemCount === 0 && (
              <div className="mx-auto max-w-3xl rounded-[32px] border border-white/[0.08] bg-white/[0.025] px-8 py-20 text-center shadow-[0_30px_100px_rgba(0,0,0,0.25)]">

                <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl border border-violet-400/20 bg-violet-500/[0.08] text-violet-300">
                  <Heart size={34} />
                </div>

                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-violet-300">
                  Nothing saved yet
                </p>

                <h2 className="text-3xl font-semibold tracking-tight">
                  Your wishlist is empty
                </h2>

                <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/40">
                  Save products you love and they will
                  appear here, ready whenever you want to
                  shop.
                </p>

                <Link
                  href="/products"
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(124,58,237,0.22)] transition hover:-translate-y-0.5 hover:bg-violet-500"
                >
                  Explore products

                  <span>→</span>
                </Link>
              </div>
            )}

          {/* =================================================
              WISHLIST PRODUCTS
          ================================================= */}

          {!loading &&
            isAuthenticated &&
            itemCount > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                {items.map((item) => {
                  const product = item.product || {};

                  const name = getProductName(product);
                  const image = getProductImage(product);
                  const price = getProductPrice(product);
                  const category =
                    getProductCategory(product);

                  return (
                    <article
                      key={item.id}
                      className="group overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.025] transition duration-300 hover:-translate-y-1 hover:border-violet-400/20 hover:bg-white/[0.04] hover:shadow-[0_25px_70px_rgba(0,0,0,0.35)]"
                    >
                      {/* IMAGE */}

                      <div className="relative aspect-[4/5] overflow-hidden bg-[#0b0b0f]">

                        {image ? (
                          <img
                            src={image}
                            alt={name}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-950/30 via-black to-purple-950/20">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                              <Heart size={25} />
                            </div>
                          </div>
                        )}

                        {/* IMAGE OVERLAY */}

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />

                        {/* CATEGORY */}

                        {category && (
                          <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75 backdrop-blur-md">
                            {category}
                          </span>
                        )}

                        {/* REMOVE */}

                        <button
                          type="button"
                          onClick={() =>
                            removeFromWishlist(
                              item.productId,
                            )
                          }
                          disabled={
                            removingId ===
                            item.productId
                          }
                          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white/65 backdrop-blur-md transition hover:border-red-400/30 hover:bg-red-500/15 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Remove ${name} from wishlist`}
                        >
                          {removingId ===
                          item.productId ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>

                      {/* CONTENT */}

                      <div className="p-5">

                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-300/80">
                          Nexora Collection
                        </p>

                        <h2 className="line-clamp-2 min-h-[56px] text-lg font-semibold leading-7 text-white">
                          {name}
                        </h2>

                        <div className="mt-4 flex items-center justify-between gap-3">

                          {price ? (
                            <span className="text-base font-semibold text-white">
                              {price}
                            </span>
                          ) : (
                            <span className="text-sm text-white/40">
                              View product
                            </span>
                          )}

                          <Link
                            href={`/products/${item.productId}`}
                            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-semibold text-white/70 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
        </div>
      </section>
    </main>
  );
}