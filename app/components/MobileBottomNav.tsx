"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Home,
  ShoppingBag,
  UserRound,
  Store,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type CartResponse = {
  success?: boolean;
  cart?: {
    items?: unknown[];
  };
};

type WishlistResponse = {
  success?: boolean;
  items?: unknown[];
};

type NavType =
  | "home"
  | "shop"
  | "wishlist"
  | "cart"
  | "account";

function NavIcon({
  type,
  active,
}: {
  type: NavType;
  active: boolean;
}) {
  const common = {
    size: 17,
    strokeWidth: active ? 2 : 1.6,
    "aria-hidden": true as const,
  };

  switch (type) {
    case "home":
      return <Home {...common} />;

    case "shop":
      return <Store {...common} />;

    case "wishlist":
      return (
        <Heart
          {...common}
          fill={active ? "currentColor" : "none"}
        />
      );

    case "cart":
      return <ShoppingBag {...common} />;

    case "account":
      return <UserRound {...common} />;
  }
}

function MobileNavItem({
  href,
  label,
  type,
  active,
  badge,
}: {
  href: string;
  label: string;
  type: NavType;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 ${
        active
          ? "text-violet-400"
          : "text-white/35"
      }`}
    >
      <span className="relative flex h-5 items-center justify-center">
        <NavIcon
          type={type}
          active={active}
        />

        {typeof badge === "number" &&
          badge > 0 && (
            <span className="absolute -right-3 -top-2 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-violet-500 px-1 text-[7px] font-bold leading-none text-white shadow-[0_0_12px_rgba(139,92,246,0.35)]">
              {badge > 99 ? "99+" : badge}
            </span>
          )}
      </span>

      <span
        className={`text-[8px] leading-none ${
          active
            ? "font-semibold"
            : "font-medium"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

export default function MobileBottomNav() {
  const pathname = usePathname();

  const [cartCount, setCartCount] =
    useState(0);

  const [wishlistCount, setWishlistCount] =
    useState(0);

  /*
   * Prevent multiple simultaneous count requests.
   *
   * The navigation is shared across several mobile pages.
   * We therefore do NOT want every pathname change to
   * immediately create another pair of database requests.
   */
  const requestInFlight = useRef(false);

  /*
   * Keep the most recently loaded counts for a short period.
   * This prevents rapid navigation between pages from
   * repeatedly hitting the Cart and Wishlist APIs.
   */
  const lastLoadedAt = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function loadCounts() {
      const now = Date.now();

      /*
       * If the counts were loaded recently, reuse them.
       * This is particularly important when moving between
       * Home → Products → Wishlist → Cart quickly.
       */
      if (
        now - lastLoadedAt.current <
        3000
      ) {
        return;
      }

      /*
       * Don't start another request while the previous
       * request is still running.
       */
      if (requestInFlight.current) {
        return;
      }

      requestInFlight.current = true;

      try {
        const [
          cartResponse,
          wishlistResponse,
        ] = await Promise.all([
          fetch("/api/cart", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }),
          fetch("/api/wishlist", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }),
        ]);

        if (cancelled) {
          return;
        }

        if (cartResponse.ok) {
          const cartData: CartResponse =
            await cartResponse.json();

          if (
            cartData.success &&
            cartData.cart
          ) {
            setCartCount(
              cartData.cart.items
                ?.length ?? 0,
            );
          }
        }

        if (wishlistResponse.ok) {
          const wishlistData: WishlistResponse =
            await wishlistResponse.json();

          if (
            wishlistData.success
          ) {
            setWishlistCount(
              wishlistData.items
                ?.length ?? 0,
            );
          }
        }

        /*
         * Only mark the request as recently loaded
         * after the request has completed.
         */
        lastLoadedAt.current =
          Date.now();
      } catch {
        /*
         * Do not aggressively reset the existing badge
         * counts if a temporary API request fails.
         *
         * This prevents a transient database/API problem
         * from visually destroying the navigation state.
         */
      } finally {
        requestInFlight.current = false;
      }
    }

    loadCounts();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const isHome =
    pathname === "/";

  const isShop =
    pathname === "/products" ||
    pathname.startsWith(
      "/products/",
    );

  const isWishlist =
    pathname === "/wishlist" ||
    pathname.startsWith(
      "/wishlist/",
    );

  const isCart =
    pathname === "/cart" ||
    pathname.startsWith("/cart/");

  const isAccount =
    pathname === "/account" ||
    pathname.startsWith(
      "/account/",
    );

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-white/[0.07] bg-[#08080b]/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto flex h-[68px] max-w-md items-center justify-between">
        <MobileNavItem
          href="/"
          label="Home"
          type="home"
          active={isHome}
        />

        <MobileNavItem
          href="/products"
          label="Shop"
          type="shop"
          active={isShop}
        />

        <MobileNavItem
          href="/wishlist"
          label="Wishlist"
          type="wishlist"
          active={isWishlist}
          badge={wishlistCount}
        />

        <MobileNavItem
          href="/cart"
          label="Cart"
          type="cart"
          active={isCart}
          badge={cartCount}
        />

        <MobileNavItem
          href="/account"
          label="Account"
          type="account"
          active={isAccount}
        />
      </div>
    </nav>
  );
}