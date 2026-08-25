"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProductActionsProps = {
  productId: string;
  productName: string;
  available: boolean;
};

export default function ProductActions({
  productId,
  productName,
  available,
}: ProductActionsProps) {
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleAddToCart() {
    if (!available || loading) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 401) {
          setError("Please login to add products to your cart.");
          return;
        }

        setError(data.message || "Unable to add product to cart.");
        return;
      }

      setMessage(`${productName} added to cart.`);

      // Refresh server-rendered data without a full browser refresh.
      router.refresh();

      // Clear success message after a short time.
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Add to cart error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setQuantity((current) => current + 1);
  }

  return (
    <div className="mt-7 space-y-3">
      {/* Quantity + Add to Cart */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Quantity selector */}
        <div className="flex h-[58px] items-center justify-between rounded-2xl border border-white/[0.1] bg-white/[0.025] px-2 sm:w-[150px]">
          <button
            type="button"
            onClick={decreaseQuantity}
            disabled={loading || quantity <= 1}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-xl text-white/60 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Decrease quantity"
          >
            −
          </button>

          <span className="min-w-[30px] text-center text-sm font-semibold text-white">
            {quantity}
          </span>

          <button
            type="button"
            onClick={increaseQuantity}
            disabled={loading}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-xl text-white/60 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Add to Cart */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!available || loading}
          className="flex h-[58px] flex-1 items-center justify-center rounded-2xl bg-violet-500 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-500/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-400 hover:shadow-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {loading ? "Adding..." : "Add to cart"}
        </button>
      </div>

      {/* Success message */}
      {message && (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3 text-sm text-emerald-400">
          ✓ {message}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Go to cart */}
      {message && (
        <button
          type="button"
          onClick={() => router.push("/cart")}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm font-medium text-white/60 transition hover:border-white/15 hover:bg-white/[0.05] hover:text-white"
        >
          View Cart
        </button>
      )}
    </div>
  );
}