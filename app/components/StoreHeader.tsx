"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function ArrowLeftIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.8 8.6c0 5.5-8.8 10.4-8.8 10.4S3.2 14.1 3.2 8.6A4.6 4.6 0 0 1 12 6.1a4.6 4.6 0 0 1 8.8 2.5Z" />
    </svg>
  );
}

function ShoppingBagIcon() {
  return (
    <svg
      width="18"
      height="18"
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

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

export default function StoreHeader() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadCartCount() {
      try {
        const response = await fetch("/api/cart", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          if (!cancelled) {
            setCartCount(0);
          }
          return;
        }

        const data = await response.json();

        if (!cancelled && data?.success && data?.cart) {
          setCartCount(data.cart.items?.length ?? 0);
        }
      } catch (error) {
        console.error("Cart count loading error:", error);

        if (!cancelled) {
          setCartCount(0);
        }
      }
    }

    loadCartCount();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-violet-500/[0.08] bg-[#070709]/95 backdrop-blur-xl">
      {/* Subtle Nexora purple glow */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-500/35 to-transparent" />

      <div className="relative mx-auto flex h-[64px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Left side */}
        <div className="flex items-center gap-5">
          {/* Back to homepage */}
          <Link
            href="/"
            className="group flex items-center gap-2 text-xs font-medium text-white/45 transition-colors duration-200 hover:text-white"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
              <ArrowLeftIcon />
            </span>

            <span className="hidden sm:inline">
              Back to NEXORA
            </span>

            <span className="sm:hidden">
              Back
            </span>
          </Link>

          {/* Divider */}
          <div className="hidden h-5 w-px bg-white/[0.08] sm:block" />

          {/* Compact brand */}
          <Link
            href="/"
            className="group flex items-center gap-2.5"
            aria-label="NEXORA homepage"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 text-xs font-black text-white shadow-[0_6px_20px_rgba(139,92,246,0.22)] transition-all duration-300 group-hover:shadow-[0_6px_25px_rgba(139,92,246,0.35)]">
              N
            </span>

            <span className="hidden text-[13px] font-bold tracking-[0.22em] text-white/90 sm:block">
              NEXORA
            </span>
          </Link>

          {/* Page context */}
          <div className="hidden items-center gap-2 md:flex">
            <span className="h-1 w-1 rounded-full bg-violet-500/60" />

            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-violet-400/70">
              Shop
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Wishlist */}
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-white/45 transition-all duration-200 hover:border-violet-500/20 hover:bg-violet-500/[0.06] hover:text-white"
          >
            <HeartIcon />
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label="Shopping cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-white/45 transition-all duration-200 hover:border-violet-500/20 hover:bg-violet-500/[0.06] hover:text-white"
          >
            <ShoppingBagIcon />

            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-1 text-[8px] font-bold text-white shadow-[0_0_10px_rgba(124,58,237,0.4)]">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* Account */}
          <Link
            href="/login"
            aria-label="Account"
            className="flex h-9 items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 text-white/45 transition-all duration-200 hover:border-violet-500/20 hover:bg-violet-500/[0.06] hover:text-white"
          >
            <UserIcon />

            <span className="hidden text-[10px] font-medium sm:block">
              Account
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}