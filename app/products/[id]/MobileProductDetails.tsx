"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  Home,
  Grid2X2,
  User,
  Minus,
  Plus,
  Share2,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";

type ProductImage = {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
};

type MobileProductDetailsProps = {
  product: {
    id: string;
    name: string;
    sku: string;
    description: string | null;
    price: number;
    compareAtPrice: number | null;
    rating: number;
    reviewCount: number;
    category: {
      name: string;
    };
    brand: {
      name: string;
    } | null;
    images: ProductImage[];
    isAvailable: boolean;
    discount: number | null;
  };
};

export default function MobileProductDetails({
  product,
}: MobileProductDetailsProps) {
  const router = useRouter();

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState("");

  const images = product.images.length
    ? product.images
    : [
        {
          id: "fallback",
          url: "",
          altText: product.name,
          isPrimary: true,
          sortOrder: 0,
        },
      ];

  const currentImage = images[activeImage];

  /*
   * ---------------------------------------------------------
   * LOAD CART + WISHLIST
   * ---------------------------------------------------------
   */

  useEffect(() => {
    async function loadCart() {
      try {
        const response = await fetch("/api/cart", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (data?.success && data?.cart) {
          setCartCount(data.cart.items?.length ?? 0);
        }
      } catch {
        // Guest users may not have a cart.
      }
    }

    async function loadWishlist() {
      try {
        const response = await fetch("/api/wishlist", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        const items = Array.isArray(data?.items) ? data.items : [];

        const exists = items.some(
          (item: { productId?: string }) =>
            item?.productId === product.id
        );

        setWishlisted(exists);
      } catch {
        // Guest users may not have a wishlist.
      }
    }

    loadCart();
    loadWishlist();
  }, [product.id]);

  /*
   * ---------------------------------------------------------
   * WISHLIST
   * ---------------------------------------------------------
   */

  async function toggleWishlist() {
    const previous = wishlisted;

    setWishlisted(!previous);

    try {
      const response = await fetch(
        previous
          ? `/api/wishlist?productId=${encodeURIComponent(product.id)}`
          : "/api/wishlist",
        {
          method: previous ? "DELETE" : "POST",
          headers: previous
            ? undefined
            : {
                "Content-Type": "application/json",
              },
          credentials: "include",
          body: previous
            ? undefined
            : JSON.stringify({
                productId: product.id,
              }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        setWishlisted(previous);
        router.push("/login");
        return;
      }

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to update wishlist."
        );
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      setWishlisted(previous);
    }
  }

  /*
   * ---------------------------------------------------------
   * ADD TO CART
   * ---------------------------------------------------------
   */

  async function addToCart(goToCart = false) {
    if (!product.isAvailable || addingToCart) return;

    try {
      setAddingToCart(true);
      setMessage("");

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Could not add product to cart."
        );
      }

      setCartCount(data.cart?.items?.length ?? cartCount + 1);

      setMessage(
        goToCart
          ? "Added to cart"
          : "Added to your cart"
      );

      if (goToCart) {
        router.push("/cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setAddingToCart(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * SHARE
   * ---------------------------------------------------------
   */

  async function shareProduct() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on NEXORA.`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setMessage("Product link copied");
      }
    } catch {
      // User cancelled share.
    }
  }

  /*
   * ---------------------------------------------------------
   * IMAGE NAVIGATION
   * ---------------------------------------------------------
   */

  function previousImage() {
    setActiveImage((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
  }

  function nextImage() {
    setActiveImage((current) =>
      current === images.length - 1 ? 0 : current + 1
    );
  }

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-[#070709] pb-28 text-white">
      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#070709]/90 px-4 backdrop-blur-xl">
        <div className="flex h-[62px] items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/[0.06] hover:text-white active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="text-[14px] font-black tracking-[0.22em]">
            NEXORA
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={shareProduct}
              aria-label="Share product"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/[0.06] hover:text-white active:scale-95"
            >
              <Share2 size={18} />
            </button>

            <button
              type="button"
              onClick={toggleWishlist}
              aria-label="Wishlist"
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition active:scale-95 ${
                wishlisted
                  ? "text-violet-400"
                  : "text-white/60 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Heart
                size={19}
                fill={wishlisted ? "currentColor" : "none"}
              />
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* ===================================================
            IMAGE GALLERY
        =================================================== */}

        <section className="px-4 pt-4">
          <div className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.025]">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/[0.09] blur-[80px]" />

            <div className="relative flex aspect-square items-center justify-center p-7">
              {currentImage.url ? (
                <img
                  src={currentImage.url}
                  alt={currentImage.altText ?? product.name}
                  className="relative z-10 max-h-full w-full object-contain"
                />
              ) : (
                <div className="text-sm text-white/25">
                  No image available
                </div>
              )}
            </div>

            {product.discount && (
              <div className="absolute left-4 top-4 z-20 rounded-full bg-violet-600 px-3 py-1.5 text-[10px] font-bold tracking-wide text-white shadow-lg shadow-violet-900/30">
                -{product.discount}%
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={previousImage}
                  className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.08] bg-black/50 text-white/70 backdrop-blur-md"
                >
                  <ChevronLeft size={17} />
                </button>

                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.08] bg-black/50 text-white/70 backdrop-blur-md"
                >
                  <ChevronRight size={17} />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/[0.07] bg-black/40 px-2.5 py-1.5 backdrop-blur-md">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    activeImage === index
                      ? "w-5 bg-violet-400"
                      : "w-1.5 bg-white/25"
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* thumbnails */}

          {images.length > 1 && (
            <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`h-[68px] w-[68px] shrink-0 overflow-hidden rounded-xl border bg-white/[0.025] transition ${
                    activeImage === index
                      ? "border-violet-500/70 ring-1 ring-violet-500/20"
                      : "border-white/[0.07]"
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.altText ?? product.name}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ===================================================
            PRODUCT INFORMATION
        =================================================== */}

        <section className="px-4 pt-6">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-violet-400">
              {product.category.name}
            </p>

            {product.isAvailable ? (
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                In stock
              </span>
            ) : (
              <span className="text-[10px] font-medium text-red-400">
                Unavailable
              </span>
            )}
          </div>

          <h1 className="mt-2.5 text-[28px] font-semibold leading-[1.05] tracking-[-0.045em] text-white">
            {product.name}
          </h1>

          {product.brand && (
            <p className="mt-2 text-xs text-white/35">
              by{" "}
              <span className="text-white/60">
                {product.brand.name}
              </span>
            </p>
          )}

          {/* rating */}

          <div className="mt-4 flex items-center gap-2">
            <span className="text-[14px] text-amber-300">
              ★
            </span>

            <span className="text-sm font-semibold text-white/80">
              {product.rating.toFixed(1)}
            </span>

            <span className="text-xs text-white/30">
              ({product.reviewCount} reviews)
            </span>
          </div>

          {/* price */}

          <div className="mt-5 flex items-center gap-3">
            <span className="text-[28px] font-semibold tracking-tight">
              ${product.price.toFixed(2)}
            </span>

            {product.compareAtPrice &&
              product.compareAtPrice > product.price && (
                <span className="text-sm text-white/25 line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}

            {product.discount && (
              <span className="rounded-full bg-violet-500/10 px-2 py-1 text-[9px] font-bold text-violet-300">
                SAVE {product.discount}%
              </span>
            )}
          </div>
        </section>

        {/* ===================================================
            DESCRIPTION
        =================================================== */}

        {product.description && (
          <section className="mx-4 mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">
              About this product
            </p>

            <p className="mt-3 text-[12px] leading-6 text-white/45">
              {product.description}
            </p>
          </section>
        )}

        {/* ===================================================
            PRODUCT INFO
        =================================================== */}

        <section className="mx-4 mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25">
              SKU
            </p>

            <p className="mt-2 truncate text-xs text-white/60">
              {product.sku}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25">
              Brand
            </p>

            <p className="mt-2 truncate text-xs text-white/60">
              {product.brand?.name ?? "NEXORA"}
            </p>
          </div>
        </section>

        {/* ===================================================
            TRUST
        =================================================== */}

        <section className="mx-4 mt-6 grid grid-cols-3 divide-x divide-white/[0.07] border-y border-white/[0.07] py-5">
          <div className="px-3 first:pl-0">
            <div className="flex items-center gap-1.5">
              <Check
                size={13}
                className="text-emerald-400"
              />
              <p className="text-[10px] font-medium text-white/65">
                Secure
              </p>
            </div>

            <p className="mt-1 text-[8px] text-white/25">
              Protected payment
            </p>
          </div>

          <div className="px-3">
            <div className="flex items-center gap-1.5">
              <Check
                size={13}
                className="text-emerald-400"
              />
              <p className="text-[10px] font-medium text-white/65">
                Fast delivery
              </p>
            </div>

            <p className="mt-1 text-[8px] text-white/25">
              Quick shipping
            </p>
          </div>

          <div className="px-3 last:pr-0">
            <div className="flex items-center gap-1.5">
              <Check
                size={13}
                className="text-emerald-400"
              />
              <p className="text-[10px] font-medium text-white/65">
                Easy returns
              </p>
            </div>

            <p className="mt-1 text-[8px] text-white/25">
              Hassle-free
            </p>
          </div>
        </section>
      </main>

      {/* =====================================================
          MOBILE FIXED ACTION BAR
      ===================================================== */}

      <div className="fixed bottom-[64px] left-0 right-0 z-40 border-t border-white/[0.07] bg-[#09090c]/95 px-4 py-3 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-xl items-center gap-2">
          {/* quantity */}

          <div className="flex h-12 items-center rounded-xl border border-white/[0.08] bg-white/[0.025]">
            <button
              type="button"
              onClick={() =>
                setQuantity((value) => Math.max(1, value - 1))
              }
              className="flex h-12 w-9 items-center justify-center text-white/50"
            >
              <Minus size={14} />
            </button>

            <span className="w-6 text-center text-xs font-semibold">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() =>
                setQuantity((value) => value + 1)
              }
              className="flex h-12 w-9 items-center justify-center text-white/50"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* cart */}

          <button
            type="button"
            disabled={!product.isAvailable || addingToCart}
            onClick={() => addToCart(false)}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 text-xs font-semibold text-violet-300 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingBag size={16} />

            {addingToCart
              ? "Adding..."
              : "Add to Cart"}
          </button>

          {/* buy */}

          <button
            type="button"
            disabled={!product.isAvailable || addingToCart}
            onClick={() => addToCart(true)}
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-violet-600 px-4 text-xs font-semibold text-white shadow-lg shadow-violet-900/25 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Buy Now
          </button>
        </div>

        {message && (
          <p className="mt-2 text-center text-[10px] text-emerald-400">
            {message}
          </p>
        )}
      </div>

      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
      ===================================================== */}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.07] bg-[#08080b]/95 px-2 pb-[calc(env(safe-area-inset-bottom)+7px)] pt-2 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-xl items-center justify-around">
          <MobileNavItem
            label="Home"
            active
            icon={<Home size={18} />}
            onClick={() => router.push("/")}
          />

          <MobileNavItem
            label="Shop"
            icon={<Grid2X2 size={18} />}
            onClick={() => router.push("/products")}
          />

          <MobileNavItem
            label="Wishlist"
            icon={<Heart size={18} />}
            onClick={() => router.push("/wishlist")}
          />

          <MobileNavItem
            label="Cart"
            icon={<ShoppingBag size={18} />}
            badge={cartCount}
            onClick={() => router.push("/cart")}
          />

          <MobileNavItem
            label="Account"
            icon={<User size={18} />}
            onClick={() => router.push("/login")}
          />
        </div>
      </nav>
    </div>
  );
}

/*
 * ===========================================================
 * MOBILE NAV ITEM
 * ===========================================================
 */

function MobileNavItem({
  label,
  icon,
  active,
  badge,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition ${
        active
          ? "text-violet-400"
          : "text-white/35 hover:text-white/70"
      }`}
    >
      <span className="relative">
        {icon}

        {badge && badge > 0 ? (
          <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[8px] font-bold text-white">
            {badge > 99 ? "99+" : badge}
          </span>
        ) : null}
      </span>

      <span className="text-[8px] font-medium">
        {label}
      </span>
    </button>
  );
}