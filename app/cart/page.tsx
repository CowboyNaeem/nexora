"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

type CartResponse = {
  success: boolean;
  message?: string;
  cart?: {
    id: string | null;
    items: CartItem[];
  };
};

type PendingQuantity = {
  quantity: number;
  timer: ReturnType<typeof setTimeout>;
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Tracks quantity requests that haven't been sent yet.
  const pendingQuantities = useRef<
    Map<string, PendingQuantity>
  >(new Map());

  // Tracks quantities currently being saved.
  const savingItems = useRef<Set<string>>(new Set());

  // =========================================================
  // Load cart
  // =========================================================

  async function loadCart() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/cart", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data: CartResponse = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Could not load cart");
        return;
      }

      setItems(data.cart?.items || []);
    } catch (error) {
      console.error("Load cart error:", error);
      setError("Something went wrong while loading your cart");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();

    // Clean up any pending timers when leaving the page.
    return () => {
      pendingQuantities.current.forEach(
        ({ timer }) => clearTimeout(timer)
      );

      pendingQuantities.current.clear();
    };
  }, []);

  // =========================================================
  // Helpers
  // =========================================================

  function getPrice(price: number | string) {
    return Number(price);
  }

  const totalQuantity = useMemo(() => {
    return items.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total +
        getPrice(item.product.price) * item.quantity,
      0
    );
  }, [items]);

  // =========================================================
  // Send quantity to server
  // =========================================================

  async function saveQuantity(
    itemId: string,
    quantity: number
  ) {
    savingItems.current.add(itemId);

    try {
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          itemId,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message || "Could not update quantity"
        );

        // Reload only when the server rejects our
        // optimistic update.
        await loadCart();

        return;
      }

      // Make sure the UI matches the server's final value.
      if (data.item) {
        setItems((currentItems) =>
          currentItems.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  quantity: data.item.quantity,
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Save quantity error:", error);

      setError("Could not update cart");

      // Restore server state if request fails.
      await loadCart();
    } finally {
      savingItems.current.delete(itemId);
    }
  }

  // =========================================================
  // Optimistic quantity update
  // =========================================================

  function updateQuantity(
    itemId: string,
    newQuantity: number
  ) {
    if (newQuantity < 1) {
      return;
    }

    setError("");
    setNotice("");

    // Update the screen immediately.
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQuantity,
            }
          : item
      )
    );

    // Cancel previous timer for this item.
    const existing =
      pendingQuantities.current.get(itemId);

    if (existing) {
      clearTimeout(existing.timer);
    }

    // Wait until the user stops clicking.
    const timer = setTimeout(async () => {
      const pending =
        pendingQuantities.current.get(itemId);

      if (!pending) {
        return;
      }

      pendingQuantities.current.delete(itemId);

      await saveQuantity(
        itemId,
        pending.quantity
      );
    }, 300);

    pendingQuantities.current.set(itemId, {
      quantity: newQuantity,
      timer,
    });
  }

  // =========================================================
  // Remove item
  // =========================================================

  async function removeItem(itemId: string) {
    // Cancel any pending quantity update first.
    const pending =
      pendingQuantities.current.get(itemId);

    if (pending) {
      clearTimeout(pending.timer);
      pendingQuantities.current.delete(itemId);
    }

    const previousItems = items;

    // Remove immediately from UI.
    setItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== itemId
      )
    );

    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          itemId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Restore if server rejects removal.
        setItems(previousItems);

        setError(
          data.message || "Could not remove item"
        );

        return;
      }

      setNotice("Item removed from cart");

      // Automatically hide notice.
      setTimeout(() => {
        setNotice("");
      }, 2000);
    } catch (error) {
      console.error("Remove item error:", error);

      // Restore item if request failed.
      setItems(previousItems);

      setError("Could not remove item");
    }
  }

  // =========================================================
  // Loading
  // =========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse">
            <div className="h-4 w-20 rounded bg-white/10" />

            <div className="mt-4 h-12 w-64 rounded bg-white/10" />

            <div className="mt-4 h-5 w-40 rounded bg-white/5" />

            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
              <section className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-36 rounded-2xl bg-white/5"
                  />
                ))}
              </section>

              <div className="h-72 rounded-2xl bg-white/5" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =========================================================
  // Error state
  // =========================================================

  if (error && items.length === 0) {
    return (
      <main className="min-h-screen bg-black px-6 py-24 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-500/20 bg-red-500/5 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
            Nexora
          </p>

          <h1 className="mt-3 text-3xl font-semibold">
            Unable to load cart
          </h1>

          <p className="mt-3 text-sm text-white/50">
            {error}
          </p>

          <button
            onClick={() => {
              setError("");
              loadCart();
            }}
            className="mt-6 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  // =========================================================
  // Main cart
  // =========================================================

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-10">
          <a
  href="/"
  className="text-xs font-semibold uppercase tracking-[0.25em] transition-opacity hover:opacity-70"
>
  NEXORA
</a>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Your Cart
          </h1>

          <p className="mt-3 text-sm text-white/40">
            {totalQuantity === 0
              ? "Your cart is currently empty."
              : `${totalQuantity} item${
                  totalQuantity === 1 ? "" : "s"
                } in your cart`}
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-sm text-red-300">
              {error}
            </p>

            <button
              onClick={() => setError("")}
              className="text-sm text-white/40 transition hover:text-white"
              aria-label="Close error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Success notification */}
        {notice && (
          <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
            <p className="text-sm text-emerald-300">
              ✓ {notice}
            </p>
          </div>
        )}

        {/* Empty cart */}
        {items.length === 0 ? (
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] px-6 py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-3xl">
              🛒
            </div>

            <h2 className="mt-6 text-2xl font-semibold">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/40">
              Looks like you haven't added anything to
              your cart yet. Explore our products and find
              something you love.
            </p>

            <a
              href="/"
              className="mt-8 inline-flex rounded-xl bg-violet-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
            >
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

            {/* Cart items */}
            <section className="space-y-4">
              {items.map((item) => {
                const price = getPrice(
                  item.product.price
                );

                const image =
                  item.product.images &&
                  item.product.images.length > 0
                    ? item.product.images[0].url
                    : null;

                const pending =
                  pendingQuantities.current.get(
                    item.id
                  );

                const isSaving =
                  savingItems.current.has(item.id);

                return (
                  <article
                    key={item.id}
                    className="group relative flex gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition-all duration-300 hover:border-white/[0.15]"
                  >
                    {/* Product image */}
                    <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-white/[0.04] sm:h-32 sm:w-32">
                      {image ? (
                        <img
                          src={image}
                          alt={item.product.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl text-white/20">
                          ◇
                        </div>
                      )}
                    </div>

                    {/* Product information */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between">

                      <div className="pr-8">
                        <h2 className="truncate text-base font-medium text-white sm:text-lg">
                          {item.product.name}
                        </h2>

                        <p className="mt-1 text-sm text-white/40">
                          ${price.toFixed(2)} each
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">

                        {/* Quantity */}
                        <div>
                          <p className="mb-2 text-xs uppercase tracking-wider text-white/30">
                            Quantity
                          </p>

                          <div className="flex h-10 items-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">

                            {/* Minus */}
                            <button
                              disabled={
                                item.quantity <= 1
                              }
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.quantity - 1
                                )
                              }
                              className="flex h-full w-10 items-center justify-center text-lg text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>

                            {/* Number */}
                            <div className="flex h-full min-w-10 items-center justify-center border-x border-white/10 px-3 text-sm font-semibold">
                              {item.quantity}
                            </div>

                            {/* Plus */}
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.quantity + 1
                                )
                              }
                              className="flex h-full w-10 items-center justify-center text-lg text-white/60 transition hover:bg-white/10 hover:text-white"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          {/* Tiny saving indicator */}
                          {(pending || isSaving) && (
                            <p className="mt-1 text-[10px] text-white/25">
                              Saving...
                            </p>
                          )}
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-sm text-white/40">
                            ${price.toFixed(2)} ×{" "}
                            {item.quantity}
                          </p>

                          <p className="mt-1 text-lg font-semibold">
                            $
                            {(
                              price * item.quantity
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() =>
                        removeItem(item.id)
                      }
                      className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-red-500/10 hover:text-red-400"
                      aria-label="Remove item"
                      title="Remove item"
                    >
                      ×
                    </button>
                  </article>
                );
              })}
            </section>

            {/* Summary */}
            <aside className="h-fit rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 lg:sticky lg:top-8">

              <h2 className="text-xl font-semibold">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4">

                <div className="flex justify-between text-sm">
                  <span className="text-white/40">
                    Items
                  </span>

                  <span>
                    {totalQuantity}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-white/40">
                    Subtotal
                  </span>

                  <span>
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

                <div className="border-t border-white/[0.08] pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      Total
                    </span>

                    <span className="text-2xl font-semibold">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <a
  href="/checkout"
  className="mt-7 block w-full rounded-xl bg-violet-500 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-violet-400"
>
  Proceed to Checkout
</a>

              <a
                href="/"
                className="mt-4 block text-center text-sm text-white/40 transition hover:text-white"
              >
                Continue Shopping
              </a>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}