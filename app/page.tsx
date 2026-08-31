"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ProductGridSkeleton from "@/components/loading/ProductGridSkeleton";

/* =========================================================
   TYPES
========================================================= */

type Product = {
  id: string;
  name: string;
  category: string;
  brand?: string;
  description?: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  badge?: string;
  badgeType?: "sale" | "new" | "hot";
  icon: string;
  accent: string;
  image?: string | null;
};

type User = {
  id?: string;
  name: string;
  email: string;
  role?: string;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

type ApiProduct = {
  id: string;
  name: string;
  slug?: string;
  price: string | number;
  compareAtPrice?: string | number | null;
  rating?: string | number | null;
  reviewCount?: number | null;
  status?: string;
  description?: string | null;
  brand?: {
    name?: string | null;
  } | null;
  category?: {
    name?: string | null;
  } | null;
  images?: Array<{
    url?: string | null;
    isPrimary?: boolean;
    sortOrder?: number;
  }>;
};

function getProductPresentation(product: ApiProduct) {
  const category = product.category?.name ?? "Other";
  const normalized = category.toLowerCase();

  if (normalized.includes("electronic")) {
    return { icon: "headphones", accent: "violet" };
  }
  if (normalized.includes("fashion")) {
    return { icon: "shirt", accent: "rose" };
  }
  if (normalized.includes("home")) {
    return { icon: "ceramic", accent: "amber" };
  }
  if (normalized.includes("beauty")) {
    return { icon: "lamp", accent: "rose" };
  }
  if (normalized.includes("sport")) {
    return { icon: "shoe", accent: "indigo" };
  }
  if (normalized.includes("accessor")) {
    return { icon: "watch", accent: "indigo" };
  }

  return { icon: "bag", accent: "violet" };
}

function mapApiProduct(product: ApiProduct): Product {
  const category = product.category?.name ?? "Other";
  const price = Number(product.price);
  const oldPrice =
    product.compareAtPrice !== null && product.compareAtPrice !== undefined
      ? Number(product.compareAtPrice)
      : undefined;

  const presentation = getProductPresentation(product);
  const primaryImage =
    product.images?.find((image) => image.isPrimary)?.url ??
    product.images?.[0]?.url ??
    null;

  let badge: string | undefined;
  let badgeType: Product["badgeType"];

  if (oldPrice && oldPrice > price) {
    badge = "SALE";
    badgeType = "sale";
  } else if (product.status === "ACTIVE") {
    badge = "NEW";
    badgeType = "new";
  }

  return {
    id: product.id,
    name: product.name,
    category,
    brand: product.brand?.name ?? undefined,
    description: product.description ?? undefined,
    price,
    oldPrice,
    rating: Number(product.rating ?? 0),
    reviews: Number(product.reviewCount ?? 0),
    badge,
    badgeType,
    icon: presentation.icon,
    accent: presentation.accent,
    image: primaryImage,
  };
}

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  productCount: number;
};

const CATEGORY_PRESENTATION: Record<
  string,
  {
    icon: string;
    gradient: string;
  }
> = {
  electronics: {
    icon: "electronics",
    gradient: "from-violet-500/20 to-indigo-500/5",
  },

  fashion: {
    icon: "fashion",
    gradient: "from-pink-500/20 to-rose-500/5",
  },

  "home-living": {
    icon: "home",
    gradient: "from-amber-500/20 to-orange-500/5",
  },

  beauty: {
    icon: "beauty",
    gradient: "from-fuchsia-500/20 to-pink-500/5",
  },

  sports: {
    icon: "sports",
    gradient: "from-cyan-500/20 to-blue-500/5",
  },

  accessories: {
    icon: "accessories",
    gradient: "from-emerald-500/20 to-teal-500/5",
  },
};

function SearchSuggestionDropdown({
  query,
  suggestions,
  selectedIndex,
  onSelect,
  onViewAll,
}: {
  query: string;
  suggestions: Product[];
  selectedIndex: number;
  onSelect: (product: Product) => void;
  onViewAll: () => void;
  compact?: boolean;
}) {
  return (
    <div
      role="listbox"
      aria-label="Search suggestions"
      onMouseDown={(event) => event.preventDefault()}
      className="absolute left-0 right-0 z-[80] mt-2 overflow-hidden rounded-2xl border border-white/[0.10] bg-[#111116]/95 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
    >
      <div className="border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
            {suggestions.length ? "Suggestions" : "Search"}
          </span>
          <span className="text-[10px] text-white/25">
            {query.trim().length === 1
              ? "Keep typing for better matches"
              : "Enter to view all"}
          </span>
        </div>
      </div>

      {suggestions.length > 0 ? (
        <div className="p-1.5">
          {suggestions.map((product, index) => (
            <button
              key={product.id}
              type="button"
              role="option"
              aria-selected={selectedIndex === index}
              onClick={() => onSelect(product)}
              className={`group flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition ${
                selectedIndex === index
                  ? "bg-violet-500/[0.12]"
                  : "hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.035]">
                {product.image ? (
                  <img
                    src={product.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-violet-300/80">
                    <ProductIcon type={product.icon} />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white/90">
                  {product.name}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-white/35">
                  {product.category}
                  {product.brand ? ` · ${product.brand}` : ""}
                </p>
              </div>

              <span className="shrink-0 text-xs font-semibold text-white/70">
                {formatMoney(product.price)}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="px-4 py-5">
          <p className="text-xs font-medium text-white/65">
            No matching products yet
          </p>
          <p className="mt-1 text-[10px] leading-5 text-white/30">
            Try a product name, category, or brand.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onViewAll}
        className="flex w-full items-center justify-between border-t border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left transition hover:bg-violet-500/[0.07]"
      >
        <span className="text-[11px] font-medium text-white/65">
          View all results for{" "}
          <span className="text-white/90">"{query.trim()}"</span>
        </span>
        <span className="text-xs text-violet-300">→</span>
      </button>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function HomePage() {
  const router = useRouter();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLElement>(null);

  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const [products, setProducts] = useState<Product[]>([]);
const [productsLoading, setProductsLoading] = useState(true);
const [productsError, setProductsError] = useState("");
const [categories, setCategories] = useState<Category[]>([]);
const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  /* =======================================================
     MOUNT
  ======================================================= */

  useEffect(() => {
    setMounted(true);

    async function loadWishlist() {
      try {
        const response = await fetch("/api/wishlist", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        if (response.status === 401) {
          setWishlist([]);
          return;
        }
        const data = await response.json();
        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Unable to load wishlist.");
        }
        const ids = Array.isArray(data.items)
          ? data.items
              .map((item: { productId?: string }) => item?.productId)
              .filter((id: unknown): id is string => typeof id === "string")
          : [];
        setWishlist(ids);
      } catch (error) {
        console.error("Wishlist loading error:", error);
        setWishlist([]);
      }
    }

    // Load current cart count when homepage opens
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
      console.error("Cart count loading error:", error);
    }
  }
    loadCartCount();
    loadWishlist();
  }, []);

  useEffect(() => {
  async function loadCategories() {
    setCategoriesLoading(true);

    try {
      const response = await fetch("/api/categories", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to load categories."
        );
      }

      const apiCategories: Category[] = Array.isArray(
        data.categories
      )
        ? data.categories
        : [];

      setCategories(apiCategories);
    } catch (error) {
      console.error(
        "NEXORA category loading error:",
        error
      );

      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }

  loadCategories();
}, []);

  

  useEffect(() => {
    fetch("/api/auth/me", {
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => {
        if (data?.success && data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        // Guest users can still use the homepage.
      });

    async function loadProducts() {
      setProductsLoading(true);
      setProductsError("");

      try {
        const response = await fetch("/api/products", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Unable to load products.");
        }

        const apiProducts: ApiProduct[] = Array.isArray(data.products)
          ? data.products
          : [];

        setProducts(apiProducts.map(mapApiProduct));
      } catch (error) {
        console.error("NEXORA product loading error:", error);
        setProducts([]);
        setProductsError(
          error instanceof Error
            ? error.message
            : "Unable to load products right now."
        );
      } finally {
        setProductsLoading(false);
      }
    }

    loadProducts();
  }, []);

  /* =======================================================
     SEARCH

     Search is intentionally submit-based, like a real storefront:
     typing does not move the page; submitting the search updates
     the results and smoothly brings the user to them.
  ======================================================= */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get("search")?.trim() ?? "";

    if (initialSearch) {
      setSearch(initialSearch);
      setActiveSearch(initialSearch);
    }
  }, []);

  /* =======================================================
     SEARCH RESULT SCROLL
  ======================================================= */

  useEffect(() => {
    if (!activeSearch) return;

    const timer = window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [activeSearch]);

  /* =======================================================
     LIVE SEARCH SUGGESTIONS

     Suggestions update while the user types. Strong matches
     are ranked first, with product name matches prioritized.
  ======================================================= */

  const searchSuggestions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return [];

    const terms = query.split(/\s+/).filter(Boolean);

    return products
      .map((product) => {
        const name = product.name.toLowerCase();
        const category = product.category.toLowerCase();
        const brand = (product.brand ?? "").toLowerCase();

        // Suggestions should match the beginning of product/category/brand words.
        // Do NOT search the description here: a query like "wi" must not match
        // every product whose description happens to contain the word "with".
        const searchableWords = [
          ...name.split(/\s+/),
          ...category.split(/\s+/),
          ...brand.split(/\s+/),
        ].filter(Boolean);

        const matches = terms.every((term) =>
          searchableWords.some((word) => word.startsWith(term)),
        );

        if (!matches) return null;

        let score = 0;
        const nameWords = name.split(/\s+/);
        const categoryWords = category.split(/\s+/);
        const brandWords = brand.split(/\s+/);

        if (name === query) score += 300;
        if (name.startsWith(query)) score += 220;
        if (nameWords.some((word) => word.startsWith(query))) score += 180;
        if (brandWords.some((word) => word.startsWith(query))) score += 100;
        if (categoryWords.some((word) => word.startsWith(query))) score += 90;

        return { product, score };
      })
      .filter(
        (item): item is { product: Product; score: number } => item !== null,
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((item) => item.product);
  }, [products, search]);

  useEffect(() => {
    setSuggestionIndex(-1);
  }, [search]);

  /* =======================================================
     FILTER + RANK PRODUCTS

     Search checks:
       • product name
       • category
       • brand
       • description

     Exact/stronger matches are ranked first.
  ======================================================= */

  const filteredProducts = useMemo(() => {
    if (!activeSearch) {
      return products.slice(0, 12);
    }

    const query = activeSearch.toLowerCase().trim();
    const terms = query.split(/\\s+/).filter(Boolean);

    const ranked = products
      .map((product) => {
        const name = product.name.toLowerCase();
        const category = product.category.toLowerCase();
        const brand = (product.brand ?? "").toLowerCase();
        const description = (product.description ?? "").toLowerCase();

        // Add lightweight ecommerce synonyms so common searches behave naturally.
        const searchableText = [
          name,
          category,
          brand,
          description,
          product.icon,
          product.icon === "headphones" ? "headphone headphones audio earbuds earphones" : "",
          product.icon === "watch" ? "watch smartwatch wearable timepiece" : "",
          product.icon === "shirt" ? "clothing clothes apparel hoodie" : "",
          product.icon === "shoe" ? "shoes sneakers footwear" : "",
          product.icon === "ceramic" ? "home tableware kitchen dining" : "",
          product.icon === "lamp" ? "lamp lighting skincare beauty" : "",
          product.icon === "bag" ? "bag backpack accessories" : "",
        ]
          .join(" ")
          .toLowerCase();

        const allTermsMatch = terms.every((term) =>
          searchableText.includes(term),
        );

        if (!allTermsMatch) {
          return null;
        }

        let score = 0;

        if (name === query) score += 100;
        if (name.startsWith(query)) score += 70;
        if (name.includes(query)) score += 50;
        if (brand.includes(query)) score += 35;
        if (category.includes(query)) score += 30;
        if (description.includes(query)) score += 20;

        for (const term of terms) {
          if (name.includes(term)) score += 12;
          if (brand.includes(term)) score += 8;
          if (category.includes(term)) score += 7;
          if (description.includes(term)) score += 4;
        }

        return { product, score };
      })
      .filter(
        (item): item is { product: Product; score: number } =>
          item !== null,
      )
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product);

    return ranked;
  }, [activeSearch, products]);

  /* =======================================================
     REAL FEATURED / HOT PRODUCTS
  ======================================================= */

  const featuredProducts = useMemo(() => {
    const ranked = products
      .map((product) => {
        let score = 0;
        if (product.badgeType === "hot") score += 50;
        if (product.badgeType === "sale") score += 30;
        if (product.badgeType === "new") score += 15;
        score += Math.min(product.rating || 0, 5) * 10;
        score += Math.min(product.reviews || 0, 500) / 25;
        if (product.oldPrice && product.oldPrice > product.price) score += 12;
        if (product.image) score += 5;
        return { product, score };
      })
      .sort((a, b) => b.score - a.score)
      .map(({ product }) => product);

    return ranked.slice(0, 5);
  }, [products]);

  /* =======================================================
     REAL NEW ARRIVALS / DEALS
  ======================================================= */

  const newArrivalProducts = useMemo(() => {
  // /api/products already returns ACTIVE products
  // ordered by createdAt descending, so the first products
  // are the newest products added to the store.
  return products.slice(0, 8);
}, [products]);

  const dealProducts = useMemo(() => {
    const saleProducts = products
      .filter((product) => product.oldPrice && product.oldPrice > product.price)
      .sort((a, b) => {
        const discountA = a.oldPrice ? (a.oldPrice - a.price) / a.oldPrice : 0;
        const discountB = b.oldPrice ? (b.oldPrice - b.price) / b.oldPrice : 0;
        return discountB - discountA;
      });

    return (saleProducts.length ? saleProducts : products).slice(0, 6);
  }, [products]);

  useEffect(() => {
    if (featuredProducts.length < 2) return;

    const timer = window.setInterval(() => {
      setFeaturedIndex((current) => (current + 1) % featuredProducts.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [featuredProducts.length]);

  useEffect(() => {
    if (featuredIndex >= featuredProducts.length) {
      setFeaturedIndex(0);
    }
  }, [featuredIndex, featuredProducts.length]);

  /* =======================================================
     SEARCH SUBMIT
  ======================================================= */

  function submitSearch(event?: React.FormEvent) {
    event?.preventDefault();

    const trimmed = search.trim();

    if (!trimmed) {
      clearSearch();
      return;
    }

    setActiveSearch(trimmed);
    setSearchFocused(false);
    setSuggestionIndex(-1);

    const url = new URL(window.location.href);
    url.searchParams.set("search", trimmed);
    window.history.replaceState({}, "", url.toString());
  }

  function selectSearchSuggestion(product: Product) {
    setSearch(product.name);
    setActiveSearch(product.name);
    setSearchFocused(false);
    setSuggestionIndex(-1);

    const url = new URL(window.location.href);
    url.searchParams.set("search", product.name);
    window.history.replaceState({}, "", url.toString());
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!search.trim() || searchSuggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSuggestionIndex((current) =>
        current >= searchSuggestions.length - 1 ? 0 : current + 1,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSuggestionIndex((current) =>
        current <= 0 ? searchSuggestions.length - 1 : current - 1,
      );
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setSearchFocused(false);
      setSuggestionIndex(-1);
      return;
    }

    if (event.key === "Enter" && suggestionIndex >= 0) {
      event.preventDefault();
      selectSearchSuggestion(searchSuggestions[suggestionIndex]);
    }
  }

  /* =======================================================
     CLEAR SEARCH
  ======================================================= */

  function clearSearch() {
    setSearch("");
    setActiveSearch("");
    setSearchFocused(false);
    setSuggestionIndex(-1);

    const url = new URL(window.location.href);
    url.searchParams.delete("search");
    window.history.replaceState({}, "", url.toString());

    window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }

  /* =======================================================
     WISHLIST
  ======================================================= */

  async function toggleWishlist(id: string) {
    const currentlyWishlisted = wishlist.includes(id);
    const previousWishlist = wishlist;
    setWishlist(currentlyWishlisted
      ? wishlist.filter((item) => item !== id)
      : [...wishlist, id]
    );

    try {
      const response = await fetch(
        currentlyWishlisted
          ? `/api/wishlist?productId=${encodeURIComponent(id)}`
          : "/api/wishlist",
        {
          method: currentlyWishlisted ? "DELETE" : "POST",
          headers: currentlyWishlisted ? undefined : { "Content-Type": "application/json" },
          credentials: "include",
          body: currentlyWishlisted ? undefined : JSON.stringify({ productId: id }),
        },
      );
      const data = await response.json();
      if (response.status === 401) {
        setWishlist(previousWishlist);
        alert("Please sign in to use your wishlist.");
        return;
      }
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to update wishlist.");
      }
    } catch (error) {
      console.error("Wishlist update error:", error);
      setWishlist(previousWishlist);
      alert(error instanceof Error ? error.message : "Unable to update your wishlist.");
    }
  }

  /* =======================================================
     CART
  ======================================================= */

  async function addToCart(productId: string): Promise<boolean> {
  try {
    const response = await fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        productId,
        quantity: 1,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      alert(data.message || "Could not add product to cart");
      return false;
    }

    setCartCount(data.cart?.items?.length ?? 0);

    console.log("Added to cart:", data);
    return true;
  } catch (error) {
    console.error("Add to cart error:", error);
    alert("Something went wrong while adding to cart");
    return false;
  }
}

  /* =======================================================
     TRACK ORDER
  ======================================================= */

  function openTrackOrder() {
    setMenuOpen(false);
    setMobileSearchOpen(false);
    setAccountOpen(false);
    router.push("/track-order");
  }

  /* =======================================================
     LOGOUT
  ======================================================= */

  async function logout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setUser(null);
        setAccountOpen(false);
        router.refresh();
      }
    } catch {
      // Ignore logout errors for now.
    } finally {
      setLoggingOut(false);
    }
  }

  /* =======================================================
     ACCOUNT INITIAL
  ======================================================= */

  const accountInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : "N";

  return (
    <main className="min-h-screen bg-[#070709] pb-20 text-white selection:bg-violet-500/30 lg:pb-0">
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="home-orb home-orb-one" />
        <div className="home-orb home-orb-two" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.07),transparent_38%)]" />

        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#070709]/92 backdrop-blur-2xl">
        {/* =====================================================
            MOBILE HEADER — desktop header remains unchanged
        ===================================================== */}
        <div className="lg:hidden">
          <div className="mx-auto max-w-md px-4 pb-3 pt-3">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/70 transition active:scale-95"
              >
                {menuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="mx-auto flex items-center gap-2"
                aria-label="NEXORA home"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-black shadow-lg shadow-violet-500/20">
                  N
                </span>
                <span className="text-[14px] font-semibold tracking-[0.24em] text-white">
                  NEXORA
                </span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => router.push("/wishlist")}
                  aria-label="Wishlist"
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/70 transition active:scale-95"
                >
                  <HeartIcon />
                  {wishlist.length > 0 && <Badge>{wishlist.length}</Badge>}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/cart")}
                  aria-label="Shopping cart"
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/70 transition active:scale-95"
                >
                  <CartIcon />
                  {cartCount > 0 && <Badge>{cartCount}</Badge>}
                </button>
              </div>
            </div>

            <form
              onSubmit={submitSearch}
              onBlur={() => {
                window.setTimeout(() => setSearchFocused(false), 140);
              }}
              className="relative mt-3"
            >
              <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-white/35">
                <SearchIcon />
              </span>

              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setSearchFocused(true);
                }}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search products..."
                aria-label="Search products"
                aria-expanded={searchFocused && Boolean(search.trim())}
                aria-autocomplete="list"
                autoComplete="off"
                className="h-11 w-full rounded-xl border border-white/[0.09] bg-white/[0.035] pl-10 pr-10 text-xs text-white outline-none transition focus:border-violet-400/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-violet-500/[0.05] placeholder:text-white/25"
              />

              {search && (
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 z-20 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-white/35 transition hover:bg-white/10 hover:text-white"
                >
                  <CloseIcon />
                </button>
              )}

              {searchFocused && search.trim() && (
                <SearchSuggestionDropdown
                  query={search}
                  suggestions={searchSuggestions}
                  selectedIndex={suggestionIndex}
                  onSelect={selectSearchSuggestion}
                  onViewAll={() => submitSearch()}
                  compact
                />
              )}
            </form>

            {menuOpen && (
              <div className="mt-3 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101014]/95 p-2 shadow-2xl backdrop-blur-2xl">
                <MobileNav label="Shop" onClick={() => { setMenuOpen(false); router.push("/products"); }} />
                <MobileNav
                  label="Categories"
                  onClick={() => {
                    setMenuOpen(false);
                    window.setTimeout(() => {
                      document.getElementById("categories")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }, 0);
                  }}
                />
                <MobileNav
                  label="Deals"
                  onClick={() => {
                    setMenuOpen(false);
                    window.setTimeout(() => {
                      document.getElementById("deals")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }, 0);
                  }}
                />
                <MobileNav
                  label="New arrivals"
                  onClick={() => {
                    setMenuOpen(false);
                    window.setTimeout(() => {
                      document.getElementById("new-arrivals")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }, 0);
                  }}
                />
                <MobileNav
                  label="Track order"
                  onClick={openTrackOrder}
                />
                <MobileNav
                  label="Account"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push(user ? "/account" : "/login");
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            DESKTOP HEADER — intentionally preserved
        ===================================================== */}
        <div className="hidden lg:block">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="flex min-h-[70px] items-center gap-4">
            {/* LOGO */}

            <button
              onClick={() => router.push("/")}
              className="group flex shrink-0 items-center gap-3"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-black shadow-lg shadow-violet-500/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-violet-500/30">
                N
              </span>

              <span className="hidden text-[15px] font-bold tracking-[0.24em] sm:block">
                NEXORA
              </span>
            </button>

            {/* DESKTOP NAVIGATION */}

            <nav className="ml-4 hidden shrink-0 items-center gap-5 lg:flex">
              <button type="button" onClick={() => router.push("/products")} className="shrink-0 whitespace-nowrap text-xs font-medium text-white transition-colors hover:text-violet-300">Shop</button>
              <button type="button" onClick={() => document.getElementById("categories")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="group flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs text-white/45 transition-colors hover:text-white">Categories <ChevronDown /></button>
              <button type="button" onClick={() => document.getElementById("deals")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="shrink-0 whitespace-nowrap text-xs text-white/40 transition-colors hover:text-white">Deals</button>
              <button type="button" onClick={() => document.getElementById("new-arrivals")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="shrink-0 whitespace-nowrap text-xs text-white/40 transition-colors hover:text-white">New arrivals</button>
            </nav>

            {/* SEARCH */}

            <form
              onSubmit={submitSearch}
              onBlur={() => {
                window.setTimeout(() => setSearchFocused(false), 140);
              }}
              className="relative ml-auto hidden w-full max-w-[360px] md:block lg:ml-auto"
            >
              <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-white/35">
                <SearchIcon />
              </span>

              <input
                ref={searchInputRef}
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setSearchFocused(true);
                }}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search products..."
                aria-label="Search products"
                aria-expanded={searchFocused && Boolean(search.trim())}
                aria-autocomplete="list"
                autoComplete="off"
                className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] pl-10 pr-10 text-xs text-white outline-none transition-all duration-300 placeholder:text-white/25 hover:border-white/[0.13] focus:border-violet-400/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-violet-500/[0.05]"
              />

              {search && (
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 z-20 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-white/30 transition hover:bg-white/10 hover:text-white"
                >
                  <CloseIcon />
                </button>
              )}

              {searchFocused && search.trim() && (
                <SearchSuggestionDropdown
                  query={search}
                  suggestions={searchSuggestions}
                  selectedIndex={suggestionIndex}
                  onSelect={selectSearchSuggestion}
                  onViewAll={() => submitSearch()}
                />
              )}
            </form>

            {/* ACTIONS */}

            <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-3">
              {/* MOBILE SEARCH */}

              <button
                onClick={() => {
                  setMobileSearchOpen((value) => !value);
                  setMenuOpen(false);

                  window.setTimeout(() => {
                    searchInputRef.current?.focus();
                  }, 100);
                }}
                aria-label="Open search"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/50 transition hover:border-white/15 hover:text-white md:hidden"
              >
                <SearchIcon />
              </button>

              {/* WISHLIST */}

              <button
                onClick={() => router.push("/wishlist")}
                aria-label="Wishlist"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/50 transition hover:border-white/15 hover:text-white"
              >
                <HeartIcon />

                {wishlist.length > 0 && (
                  <Badge>{wishlist.length}</Badge>
                )}
              </button>

              {/* CART */}

              <button
                onClick={() => router.push("/cart")}
                aria-label="Shopping cart"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/50 transition hover:border-white/15 hover:text-white"
              >
                <CartIcon />

                {cartCount > 0 && <Badge>{cartCount}</Badge>}
              </button>

              {/* TRACK ORDER */}

              <button
                type="button"
                onClick={openTrackOrder}
                aria-label="Track order"
                className="hidden h-9 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 text-white/50 transition hover:border-violet-500/20 hover:bg-violet-500/[0.06] hover:text-white lg:flex xl:px-3.5"
              >
                <OrdersIcon />
                <span className="hidden text-[10px] font-medium xl:inline">
                  Track order
                </span>
              </button>

              {/* =================================================
                  ACCOUNT
              ================================================= */}

              {user ? (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() =>
                      setAccountOpen((value) => !value)
                    }
                    className="ml-1 flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.025] px-2.5 py-1.5 transition-all hover:border-white/15 hover:bg-white/[0.05]"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/90 to-indigo-500/90 text-[10px] font-bold shadow-lg shadow-violet-500/10">
                      {accountInitial}
                    </span>

                    <span className="max-w-[100px] truncate text-[10px] font-medium text-white/60">
                      {user.name}
                    </span>

                    <ChevronDown />
                  </button>

                  {accountOpen && (
                    <div className="account-dropdown absolute right-0 top-[calc(100%+10px)] w-60 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#101014]/95 p-2 shadow-2xl backdrop-blur-2xl">
                      <div className="border-b border-white/[0.06] px-3 py-3">
                        <p className="truncate text-xs font-semibold text-white/80">
                          {user.name}
                        </p>

                        <p className="mt-1 truncate text-[10px] text-white/25">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <AccountMenuItem
                          label="My account"
                          icon={<UserIcon />}
                          onClick={() => router.push("/account")}
                        />

                        <AccountMenuItem
                          label="My orders"
                          icon={<OrdersIcon />}
                          onClick={() => router.push("/orders")}
                        />

                        <AccountMenuItem
                          label="Track an order"
                          icon={<OrdersIcon />}
                          onClick={openTrackOrder}
                        />

                        <AccountMenuItem
                          label="Wishlist"
                          icon={<HeartIcon />}
                          onClick={() => router.push("/wishlist")}
                        />

                        <AccountMenuItem
                          label="Settings"
                          icon={<SettingsIcon />}
                          onClick={() => router.push("/settings")}
                        />
                      </div>

                      <div className="border-t border-white/[0.06] pt-1">
                        <AccountMenuItem
                          label={loggingOut ? "Signing out..." : "Sign out"}
                          icon={<LogoutIcon />}
                          danger
                          onClick={logout}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden items-center gap-2 sm:flex">
                  <button
                    onClick={() => router.push("/login")}
                    className="rounded-xl px-3 py-2 text-xs font-medium text-white/55 transition hover:text-white"
                  >
                    Sign in
                  </button>

                  <button
                    onClick={() => router.push("/register")}
                    className="rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90"
                  >
                    Create account
                  </button>
                </div>
              )}

              {/* MOBILE MENU */}

              <button
                onClick={() => {
                  setMenuOpen((value) => !value);
                  setMobileSearchOpen(false);
                }}
                aria-label="Menu"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/50 transition hover:border-white/15 hover:text-white lg:hidden"
              >
                {menuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>

          {/* MOBILE SEARCH */}

          {mobileSearchOpen && (
            <div className="border-t border-white/[0.06] py-3 md:hidden">
              <form
                onSubmit={submitSearch}
                onBlur={() => {
                  window.setTimeout(() => setSearchFocused(false), 140);
                }}
                className="relative"
              >
                <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-white/35">
                  <SearchIcon />
                </span>

                <input
                  autoFocus
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setSearchFocused(true);
                  }}
                  onFocus={() => setSearchFocused(true)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search products..."
                  aria-label="Search products"
                  aria-expanded={searchFocused && Boolean(search.trim())}
                  aria-autocomplete="list"
                  autoComplete="off"
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] pl-10 pr-10 text-xs text-white outline-none placeholder:text-white/25 focus:border-violet-400/40"
                />

                {search && (
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 z-20 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-white/30 hover:text-white"
                  >
                    <CloseIcon />
                  </button>
                )}

                {searchFocused && search.trim() && (
                  <SearchSuggestionDropdown
                    query={search}
                    suggestions={searchSuggestions}
                    selectedIndex={suggestionIndex}
                    onSelect={selectSearchSuggestion}
                    onViewAll={() => submitSearch()}
                    compact
                  />
                )}
              </form>
            </div>
          )}

          {/* MOBILE MENU */}

          {menuOpen && (
            <div className="border-t border-white/[0.06] py-4 lg:hidden">
              <div className="flex flex-col gap-1">
                <MobileNav label="Shop" onClick={() => { setMenuOpen(false); router.push("/products"); }} />
                <MobileNav
                  label="Categories"
                  onClick={() => {
                    setMenuOpen(false);
                    window.setTimeout(() => {
                      document.getElementById("categories")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }, 0);
                  }}
                />
                <MobileNav label="Deals" onClick={() => { setMenuOpen(false); document.getElementById("deals")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} />
                <MobileNav label="New arrivals" onClick={() => { setMenuOpen(false); document.getElementById("new-arrivals")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} />
                <MobileNav label="Track order" onClick={openTrackOrder} />

                {user ? (
                  <>
                    <button
                      onClick={() => router.push("/account")}
                      className="mt-2 rounded-xl bg-white/[0.04] px-4 py-3 text-left text-xs text-white/55"
                    >
                      My account · {user.name}
                    </button>

                    <button
                      onClick={logout}
                      className="rounded-xl px-4 py-3 text-left text-xs text-red-300/70"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => router.push("/login")}
                      className="rounded-xl border border-white/[0.08] px-4 py-3 text-xs text-white/60"
                    >
                      Sign in
                    </button>

                    <button
                      onClick={() => router.push("/register")}
                      className="rounded-xl bg-white px-4 py-3 text-xs font-semibold text-black"
                    >
                      Create account
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div
            className={`relative grid items-center gap-7 py-8 transition-all duration-1000 lg:min-h-[570px] lg:gap-10 lg:grid-cols-[1fr_0.85fr] lg:py-20 ${
              mounted
                ? "translate-y-0 opacity-100"
                : "translate-y-5 opacity-0"
            }`}
          >
            {/* MOBILE HERO VISUAL — REAL HOT PRODUCT CAROUSEL */}
            <div className="relative order-first lg:hidden">
              {featuredProducts.length > 0 ? (
                (() => {
                  const featured = featuredProducts[featuredIndex] ?? featuredProducts[0];
                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => router.push(`/products/${featured.id}`)}
                        className="group relative block w-full text-left"
                        aria-label={`View ${featured.name}`}
                      >
                        <div className="absolute inset-0 rounded-[28px] bg-violet-600/[0.10] blur-3xl" />
                        <div
                          key={featured.id}
                          className="mobile-featured-slide relative h-[235px] overflow-hidden rounded-[24px] border border-violet-400/[0.16] bg-[#0d0d12] shadow-[0_25px_70px_rgba(0,0,0,0.42)]"
                        >
                          {featured.image ? (
                            <img
                              src={featured.image}
                              alt={featured.name}
                              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-active:scale-[1.02]"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-500/15 via-[#111116] to-indigo-500/10 text-violet-200/70">
                              <div className="scale-[2.2]">
                                <ProductIcon type={featured.icon} />
                              </div>
                            </div>
                          )}

                          {/* Full-bleed image with a cinematic readability layer. */}
                          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/5" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/25" />
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_36%,rgba(139,92,246,0.12),transparent_40%)]" />

                          <div className="absolute left-4 top-4 rounded-full border border-white/[0.12] bg-black/35 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-white/75 backdrop-blur-xl">
                            {featured.badge || "HOT NOW"}
                          </div>

                          <div className="absolute bottom-5 left-5 max-w-[67%]">
                            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-violet-200/75">
                              Featured
                            </p>
                            <p className="mt-1 line-clamp-2 text-[15px] font-semibold leading-5 text-white drop-shadow-lg">
                              {featured.name}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-[9px] text-white/70">
                              <span className="text-amber-300">★ {featured.rating.toFixed(1)}</span>
                              <span className="text-white/35">({featured.reviews} reviews)</span>
                            </div>
                          </div>

                          <div className="absolute bottom-5 right-5 text-right drop-shadow-lg">
                            <p className="text-sm font-semibold text-white">{formatMoney(featured.price)}</p>
                            {featured.oldPrice ? (
                              <p className="text-[8px] text-white/45 line-through">
                                {formatMoney(featured.oldPrice)}
                              </p>
                            ) : (
                              <p className="text-[8px] text-white/55">Free shipping</p>
                            )}
                          </div>
                        </div>
                      </button>

                      <div className="mt-3 flex justify-center gap-1.5" aria-label="Featured products">
                        {featuredProducts.map((product, index) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => setFeaturedIndex(index)}
                            aria-label={`Show ${product.name}`}
                            className={`h-1.5 rounded-full transition-all ${
                              index === featuredIndex
                                ? "w-5 bg-violet-400"
                                : "w-1.5 bg-white/20"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  );
                })()
              ) : (
                <div className="h-[235px] animate-pulse rounded-[24px] border border-white/[0.08] bg-white/[0.025]" />
              )}
            </div>

            {/* HERO COPY */}

            <div className="relative z-10 max-w-2xl lg:max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full lg:mb-6 border border-white/10 bg-white/[0.035] px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-white/45 backdrop-blur-xl">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.9)]" />

                The next generation marketplace
              </div>

              <h1 className="text-[42px] font-semibold leading-[0.96] tracking-[-0.055em] sm:text-6xl lg:text-7xl xl:text-[84px]">
                Discover
                <br />

                <span className="hero-gradient-text">
                  what's next.
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-[13px] leading-6 text-white/40 sm:text-[15px] lg:mt-7 lg:leading-7">
                Exceptional products. Independent sellers. A shopping
                experience designed around the things worth discovering.
              </p>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row lg:mt-8 lg:gap-3">
                <button
                  onClick={() =>
                    resultsRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3.5 text-xs font-semibold shadow-xl shadow-violet-600/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-violet-600/25"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  <span className="relative">
                    Explore products
                    <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </button>

                <button
                  onClick={() =>
                    document
                      .getElementById("categories")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      })
                  }
                  className="rounded-xl border border-white/[0.09] bg-white/[0.025] px-6 py-3.5 text-xs font-medium text-white/55 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.05] hover:text-white"
                >
                  Browse categories
                </button>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3 text-[9px] text-white/30 lg:mt-10 lg:gap-6 lg:text-[10px]">
                <TrustItem icon="✓" label="Verified sellers" />
                <TrustItem icon="✓" label="Secure checkout" />
                <TrustItem icon="✓" label="Fast delivery" />
              </div>
            </div>

            {/* HERO VISUAL */}

            <div className="relative hidden h-[450px] lg:block">
              <div className="absolute left-1/2 top-1/2 h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/[0.08] blur-[90px]" />

              <div className="hero-product-card absolute left-[12%] top-[10%] h-[350px] w-[72%] overflow-hidden rounded-[30px] border border-white/[0.11] bg-gradient-to-br from-white/[0.07] to-white/[0.015] shadow-[0_40px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(139,92,246,0.20),transparent_42%)]" />

                <div className="absolute left-7 top-7 text-[9px] font-semibold tracking-[0.2em] text-white/25">
                  NEXORA / FEATURED
                </div>

                <div className="absolute left-1/2 top-[48%] flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-violet-300/10 bg-violet-400/[0.035] shadow-[0_0_80px_rgba(139,92,246,0.15)]">
                  <div className="text-violet-200/60">
                    <HeadphoneLarge />
                  </div>
                </div>

                <div className="absolute bottom-6 left-7">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-white/25">
                    Featured
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    Aero Wireless
                  </p>
                </div>

                <div className="absolute bottom-6 right-7 text-right">
                  <p className="text-sm font-semibold">$129</p>

                  <p className="text-[9px] text-white/25">
                    Free shipping
                  </p>
                </div>
              </div>

              <div className="absolute bottom-[8%] left-[0%] w-40 rounded-2xl border border-white/[0.09] bg-[#111116]/90 p-4 shadow-2xl backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-wider text-white/25">
                    Trending
                  </span>

                  <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[8px] text-emerald-300">
                    +28%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-400/10 text-violet-300">
                    <ChartIcon />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold">
                      This week
                    </p>

                    <p className="text-[9px] text-white/25">
                      Popular products
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute right-[0%] top-[8%] rounded-2xl border border-white/[0.09] bg-[#111116]/90 px-4 py-3 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-amber-300">
                    ★
                  </span>

                  <div>
                    <p className="text-xs font-semibold">
                      4.9 / 5
                    </p>

                    <p className="text-[8px] text-white/25">
                      Customer rating
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
    CATEGORIES
===================================================== */}

<section
  id="categories"
  className="scroll-mt-24 border-y border-white/[0.05] bg-white/[0.012]"
>
  <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12">
    <SectionHeading
      eyebrow="EXPLORE"
      title="Shop by category"
      description="Find something worth bringing home."
      action="View all"
      onAction={() => router.push("/products")}
    />

    <div className="mt-6 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] lg:mt-8 lg:grid lg:grid-cols-6 lg:overflow-visible lg:pb-0">
      {categoriesLoading ? (
  Array.from({ length: 6 }).map((_, index) => (
    <div
      key={index}
      aria-hidden="true"
      className="relative h-[150px] overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]"
    >
      <div className="absolute inset-0 -translate-x-full animate-skeleton-shimmer bg-gradient-to-r from-transparent via-white/[0.055] to-transparent" />
    </div>
  ))
) : categories.length > 0 ? (
        categories.map((category, index) => {
          const presentation =
            CATEGORY_PRESENTATION[category.slug] ?? {
              icon: "accessories",
              gradient:
                "from-violet-500/20 to-indigo-500/5",
            };

          return (
            <button
              key={category.id}
              type="button"
              onClick={() =>
                router.push(
                  `/products?category=${encodeURIComponent(
                    category.slug
                  )}`
                )
              }
              className={`group relative min-w-[116px] shrink-0 overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br ${presentation.gradient} p-4 text-left transition-all duration-500 hover:-translate-y-1 hover:border-white/[0.14] hover:bg-white/[0.045] lg:min-w-0 lg:shrink lg:p-5`}
              style={{
                animationDelay: `${index * 70}ms`,
              }}
            >
              <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-white/50 transition-all duration-300 group-hover:scale-105 group-hover:text-white">
                <CategoryIcon type={presentation.icon} />
              </div>

              <p className="text-xs font-semibold">
                {category.name}
              </p>

              <p className="mt-1 text-[9px] text-white/25">
                {category.productCount}{" "}
                {category.productCount === 1
                  ? "product"
                  : "products"}
              </p>

              <span className="absolute bottom-5 right-5 text-white/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white/60">
                →
              </span>
            </button>
          );
        })
      ) : (
        <div className="col-span-full rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 py-10 text-center">
          <p className="text-xs text-white/35">
            No categories available right now.
          </p>
        </div>
      )}
    </div>
  </div>
</section>
      {/* =====================================================
          PRODUCTS / SEARCH RESULTS
      ===================================================== */}

      <section
        ref={resultsRef}
        id="trending-products"
        className="scroll-mt-24 mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12"
      >
        {activeSearch ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-semibold tracking-[0.2em] text-violet-400">
                SEARCH RESULTS
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
                Results for{" "}
                <span className="text-violet-300">
                  "{activeSearch}"
                </span>
              </h2>

              <p className="mt-2 text-xs text-white/30">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? "product"
                  : "products"}{" "}
                found
              </p>
            </div>

            <button
              onClick={clearSearch}
              className="self-start rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-2.5 text-[10px] font-medium text-white/45 transition hover:border-white/15 hover:text-white sm:self-auto"
            >
              Clear search
            </button>
          </div>
        ) : (
          <SectionHeading
            eyebrow="TRENDING NOW"
            title="Products people love"
            description="A curated selection of what's getting attention right now."
            action="View all products"
            onAction={() => router.push("/products")}
          />
        )}

        {/* SEARCH RESULT INFO */}

        {activeSearch && filteredProducts.length > 0 && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-violet-400/10 bg-violet-400/[0.035] px-4 py-3 text-xs text-white/40">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-400/10 text-violet-300">
              <SearchIcon />
            </span>

            Showing the best matches from your NEXORA catalog.
          </div>
        )}

        {/* PRODUCTS */}

        {productsLoading && (
  <ProductGridSkeleton count={6} className="mt-8" />
)}

        {!productsLoading && productsError && (
          <div className="mt-8 rounded-2xl border border-red-400/10 bg-red-400/[0.035] px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-400/[0.06] text-red-300/70">
              !
            </div>
            <h3 className="mt-4 text-sm font-semibold">
              We couldn't load the products
            </h3>
            <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-white/25">
              {productsError}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-white px-4 py-2.5 text-[10px] font-semibold text-black transition hover:bg-white/90"
            >
              Try again
            </button>
          </div>
        )}

        {!productsLoading && !productsError && filteredProducts.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                isWishlisted={wishlist.includes(product.id)}
                onWishlist={() => toggleWishlist(product.id)}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}

        {/* EMPTY SEARCH */}

        {!productsLoading && !productsError && filteredProducts.length === 0 && activeSearch && (
          <div className="mt-8 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-white/30">
              <SearchIcon />
            </div>

            <h3 className="mt-5 text-sm font-semibold">
              No products found
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-white/25">
              We couldn't find anything matching "
              {activeSearch}". Try a different product, brand, category, or keyword.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {["Headphones", "Fashion", "Watch", "Home"].map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setSearch(suggestion);
                      setActiveSearch(suggestion);
                    }}
                    className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-[9px] text-white/40 transition hover:border-violet-400/20 hover:text-white"
                  >
                    {suggestion}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </section>

      {/* =====================================================
          NEW ARRIVALS
      ===================================================== */}
      <section
        id="new-arrivals"
        className="scroll-mt-24 border-y border-white/[0.05] bg-white/[0.012]"
      >
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12">
          <SectionHeading
            eyebrow="JUST IN"
            title="New arrivals"
            description="Fresh picks worth discovering right now."
            action="View all products"
            onAction={() => router.push("/products")}
          />
          {productsLoading && (
  <ProductGridSkeleton count={4} className="mt-8" />
)}

          {!productsLoading && !productsError && newArrivalProducts.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {newArrivalProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  isWishlisted={wishlist.includes(product.id)}
                  onWishlist={() => toggleWishlist(product.id)}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}

          {!productsLoading && !productsError && newArrivalProducts.length === 0 && (
            <div className="mt-8 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 py-14 text-center">
              <p className="text-xs text-white/35">
                No new arrivals are available right now.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          FLASH DEALS
      ===================================================== */}

      <section id="deals" className="relative scroll-mt-24 overflow-hidden border-y border-white/[0.05] bg-[#0b0a0f]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(124,58,237,0.13),transparent_35%),radial-gradient(circle_at_80%_50%,rgba(79,70,229,0.09),transparent_35%)]" />

        <div className="relative mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12">
          <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-400/[0.06] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-violet-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />

                Limited time
              </div>

              <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                Up to{" "}
                <span className="text-violet-300">
                  40% off.
                </span>
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-white/35">
                Exceptional finds at exceptional prices. Discover this
                week's limited-time offers before they're gone.
              </p>

              <button type="button" onClick={() => document.getElementById("deals")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="mt-6 rounded-xl bg-white px-5 py-3 text-xs font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90">
                Shop the deals →
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {dealProducts.slice(0, 3).map((product) => (
                <MiniDealCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SELLER SECTION
      ===================================================== */}

      <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12">
        <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-white/[0.045] to-white/[0.015] p-7 sm:p-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/[0.08] blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-violet-400">
                FOR SELLERS
              </p>

              <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                Build your brand on NEXORA.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/35">
                Reach customers who value great products. Create your
                storefront, manage inventory, and grow your business
                with NEXORA.
              </p>

              <button
                onClick={() => router.push("/seller")}
                className="mt-6 rounded-xl border border-white/[0.1] bg-white/[0.045] px-5 py-3 text-xs font-medium text-white/65 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                Become a seller →
              </button>
            </div>

            <div className="hidden sm:block">
              <div className="grid h-40 w-40 place-items-center rounded-[30px] border border-white/[0.08] bg-white/[0.025] shadow-2xl">
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-lg font-black shadow-lg shadow-violet-500/20">
                    N
                  </div>

                  <p className="mt-3 text-[9px] uppercase tracking-[0.18em] text-white/20">
                    Your store
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MORE TO DISCOVER
      ===================================================== */}

      <section className="border-t border-white/[0.05] bg-white/[0.012]">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12">
          <SectionHeading
            eyebrow="KEEP EXPLORING"
            title="More to discover"
            description="A few more things we think you'll like."
            action="Explore all"
            onAction={() => router.push("/products")}
          />

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {products.slice(4, 8).map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                isWishlisted={wishlist.includes(product.id)}
                onWishlist={() => toggleWishlist(product.id)}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          NEWSLETTER
      ===================================================== */}

      <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12">
        <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-violet-500/[0.08] via-white/[0.025] to-indigo-500/[0.06] p-8 text-center sm:p-12">
          <div className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative mx-auto max-w-xl">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-violet-300">
              NEXORA INSIDER
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
              Stay in the loop.
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/35">
              New arrivals, exclusive offers, and things worth
              discovering — delivered occasionally.
            </p>

            <form
              onSubmit={(event) => event.preventDefault()}
              className="mx-auto mt-6 flex max-w-md gap-2"
            >
              <input
                type="email"
                placeholder="Your email address"
                className="h-11 min-w-0 flex-1 rounded-xl border border-white/[0.09] bg-black/20 px-4 text-xs text-white outline-none placeholder:text-white/20 focus:border-violet-400/40"
              />

              <button
                type="submit"
                className="shrink-0 rounded-xl bg-white px-4 text-xs font-semibold text-black transition hover:bg-white/90"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
      ===================================================== */}
      <MobileBottomNav
        cartCount={cartCount}
        wishlistCount={wishlist.length}
      />

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-black">
                  N
                </span>

                <span className="text-[15px] font-bold tracking-[0.24em]">
                  NEXORA
                </span>
              </button>

              <p className="mt-4 max-w-xs text-xs leading-6 text-white/25">
                A modern marketplace for discovering exceptional
                products from trusted independent sellers.
              </p>

              <p className="mt-6 text-[9px] uppercase tracking-[0.18em] text-white/15">
                Shopping, reimagined.
              </p>
            </div>

            <FooterColumn
              title="Shop"
              links={[
                "All products",
                "New arrivals",
                "Trending",
                "Deals",
              ]}
            />

            <FooterColumn
              title="Company"
              links={[
                "About NEXORA",
                "Become a seller",
                "Careers",
                "Contact",
              ]}
            />

            <FooterColumn
              title="Support"
              links={[
                "Help center",
                "Shipping",
                "Returns",
                "Privacy",
              ]}
            />
          </div>

          <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/[0.05] pt-6 text-[9px] text-white/20 sm:flex-row">
            <span>© 2026 NEXORA. All rights reserved.</span>

            <div className="flex gap-5">
              <span>Terms</span>
              <span>Privacy</span>
              <span>Cookies</span>
            </div>
          </div>
        </div>
      </footer>

      {/* =====================================================
          GLOBAL ANIMATION CSS
      ===================================================== */}

      <style jsx global>{`
        @keyframes homeFloatOne {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(30px, -20px, 0) scale(1.05);
          }
        }

        @keyframes homeFloatTwo {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(-25px, 25px, 0) scale(0.96);
          }
        }

        @keyframes heroGradient {
          0%,
          100% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes mobileFeaturedSlideIn {
          0% {
            opacity: 0;
            transform: translate3d(100%, 0, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        .mobile-featured-slide {
          animation: mobileFeaturedSlideIn 620ms cubic-bezier(0.16, 1, 0.3, 1) both;
          will-change: transform, opacity;
        }

        @media (prefers-reduced-motion: reduce) {
          .mobile-featured-slide {
            animation: none;
          }
        }

        @keyframes productFloat {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }

          50% {
            transform: translateY(-8px) rotate(0.5deg);
          }
        }

        .home-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(100px);
        }

        .home-orb-one {
          left: -140px;
          top: 15%;
          width: 400px;
          height: 400px;
          background: rgba(124, 58, 237, 0.08);
          animation: homeFloatOne 14s ease-in-out infinite;
        }

        .home-orb-two {
          right: -120px;
          top: 30%;
          width: 350px;
          height: 350px;
          background: rgba(79, 70, 229, 0.07);
          animation: homeFloatTwo 17s ease-in-out infinite;
        }

        .hero-gradient-text {
          background: linear-gradient(
            90deg,
            #c4b5fd,
            #e9d5ff,
            #a5b4fc,
            #c4b5fd
          );

          background-size: 250% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          animation: heroGradient 8s ease-in-out infinite;
        }

        .hero-product-card {
          animation: productFloat 7s ease-in-out infinite;
        }

        .account-dropdown {
          animation: accountDropdown 180ms ease-out;
          transform-origin: top right;
        }

        @keyframes accountDropdown {
          from {
            opacity: 0;
            transform: translateY(-5px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .home-orb,
          .hero-gradient-text,
          .hero-product-card {
            animation: none !important;
          }

          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   NAVIGATION
========================================================= */

function NavItem({ label, active = false, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return <button type="button" onClick={onClick} className={`text-xs transition-colors ${active ? "font-medium text-white" : "text-white/40 hover:text-white"}`}>{label}</button>;
}

function MobileNav({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="rounded-xl px-4 py-3 text-left text-xs text-white/50 transition hover:bg-white/[0.035] hover:text-white">{label}</button>;
}

/* =========================================================
   ACCOUNT MENU ITEM
========================================================= */

function AccountMenuItem({
  label,
  icon,
  danger = false,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[10px] transition ${
        danger
          ? "text-red-300/60 hover:bg-red-400/[0.06] hover:text-red-300"
          : "text-white/45 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.035]">
        {icon}
      </span>

      {label}
    </button>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  onAction,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-end justify-between gap-5">
      <div>
        <p className="text-[9px] font-semibold tracking-[0.2em] text-violet-400">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
          {title}
        </h2>

        <p className="mt-2 text-xs text-white/30">
          {description}
        </p>
      </div>

      <button type="button" onClick={onAction} className="hidden shrink-0 text-[10px] font-medium text-white/35 transition hover:text-white sm:block">
        {action} →
      </button>
    </div>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  index,
  isWishlisted,
  onWishlist,
  onAddToCart,
}: {
  product: Product;
  index: number;
  isWishlisted: boolean;
  onWishlist: () => void;
  onAddToCart: (productId: string) => Promise<boolean>;
}) {
  const router = useRouter();
  const [quickAdded, setQuickAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  return (
    <article
      onClick={() => router.push(`/products/${product.id}`)}
      className="group relative min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.018] transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12]"
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-white/[0.04] to-white/[0.01]">
        <div
          className={`absolute inset-0 opacity-40 ${
            product.accent === "violet"
              ? "bg-[radial-gradient(circle_at_50%_45%,rgba(139,92,246,0.20),transparent_48%)]"
              : product.accent === "amber"
                ? "bg-[radial-gradient(circle_at_50%_45%,rgba(245,158,11,0.14),transparent_48%)]"
                : product.accent === "indigo"
                  ? "bg-[radial-gradient(circle_at_50%_45%,rgba(99,102,241,0.17),transparent_48%)]"
                  : product.accent === "rose"
                    ? "bg-[radial-gradient(circle_at_50%_45%,rgba(244,63,94,0.14),transparent_48%)]"
                    : "bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.08),transparent_48%)]"
          }`}
        />

        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/35 transition-all duration-500 group-hover:scale-105 group-hover:text-white/55">
            <ProductIcon type={product.icon} />
          </div>
        )}

        {product.badge && (
          <span
            className={`absolute left-3 top-3 rounded-full px-2 py-1 text-[8px] font-semibold ${
              product.badgeType === "sale"
                ? "bg-violet-500/90 text-white"
                : product.badgeType === "new"
                  ? "bg-white/90 text-black"
                  : "bg-amber-400/90 text-black"
            }`}
          >
            {product.badge}
          </span>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onWishlist();
          }}
          aria-label="Add to wishlist"
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-xl transition-all duration-300 ${
            isWishlisted
              ? "border-violet-400/30 bg-violet-500/20 text-violet-300"
              : "border-white/10 bg-black/20 text-white/45 opacity-100 hover:border-white/20 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
          }`}
        >
          <HeartIcon filled={isWishlisted} />
        </button>

        <button
          type="button"
          onClick={async (e) => {
            e.stopPropagation();
            if (adding) return;
            if (quickAdded) return;

            setAdding(true);
            const success = await onAddToCart(product.id);
            setAdding(false);
            if (success) {
              setQuickAdded(true);
            }
          }}
          aria-label={quickAdded ? `${product.name} added to cart` : `Quick add ${product.name} to cart`}
          title={quickAdded ? "Added to cart" : "Quick add to cart"}
          className={`absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-xl transition-all duration-300 sm:h-9 sm:w-9 ${
            quickAdded
              ? "border-violet-400/40 bg-violet-500/25 text-violet-200"
              : "border-white/10 bg-black/70 text-white/80 hover:border-violet-400/40 hover:bg-violet-500/20 hover:text-white"
          }`}
        >
          {adding ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : quickAdded ? (
            <span className="text-sm font-bold">✓</span>
          ) : (
            <span className="text-lg font-light leading-none">+</span>
          )}
        </button>
      </div>

      <div className="p-3.5">
        <p className="text-[9px] text-white/25">
          {product.category}
        </p>

        <h3 className="mt-1 line-clamp-1 text-xs font-medium text-white/80">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center gap-1">
          <span className="text-[10px] text-amber-300">
            ★
          </span>

          <span className="text-[9px] text-white/40">
            {product.rating}
          </span>

          <span className="text-[9px] text-white/20">
            ({product.reviews})
          </span>
        </div>

        <div className="mt-3 flex items-end gap-2">
          <span className="text-sm font-semibold">
            ${product.price}
          </span>

          {product.oldPrice && (
            <span className="text-[10px] text-white/20 line-through">
              ${product.oldPrice}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   MINI DEAL CARD
========================================================= */

function MiniDealCard({ product }: { product: Product }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.13]">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-white/[0.025] text-white/35 transition group-hover:text-white/55">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <ProductIcon type={product.icon} />
        )}
      </div>

      <p className="mt-3 line-clamp-1 text-[10px] font-medium text-white/65">
        {product.name}
      </p>

      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs font-semibold">
          ${product.price}
        </span>

        <span className="text-[9px] text-violet-300">
          Save{" "}
          {product.oldPrice
            ? `$${product.oldPrice - product.price}`
            : ""}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   MOBILE BOTTOM NAVIGATION
========================================================= */

function MobileBottomNav({
  cartCount,
  wishlistCount,
}: {
  cartCount: number;
  wishlistCount: number;
}) {
  const router = useRouter();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[70] border-t border-white/[0.08] bg-[#070709]/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-2xl lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        <MobileBottomItem
          label="Home"
          icon={<HomeIcon />}
          active
          onClick={() => router.push("/")}
        />
        <MobileBottomItem
          label="Shop"
          icon={<CartIcon />}
          onClick={() => router.push("/products")}
        />
        <MobileBottomItem
          label="Wishlist"
          icon={<HeartIcon />}
          badge={wishlistCount}
          onClick={() => router.push("/wishlist")}
        />
        <MobileBottomItem
          label="Cart"
          icon={<CartIcon />}
          badge={cartCount}
          onClick={() => router.push("/cart")}
        />
        <MobileBottomItem
          label="Account"
          icon={<UserIcon />}
          onClick={() => router.push("/account")}
        />
      </div>
    </nav>
  );
}

function MobileBottomItem({
  label,
  icon,
  active = false,
  badge = 0,
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
      className={`relative flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-xl transition active:scale-95 ${
        active ? "text-violet-300" : "text-white/40 hover:text-white"
      }`}
    >
      <span className="relative">
        {icon}
        {badge > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-500 px-1 text-[8px] font-bold text-white shadow-lg shadow-violet-500/30">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </span>
      <span className="text-[9px] font-medium">{label}</span>
    </button>
  );
}

/* =========================================================
   HOME ICON
========================================================= */

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-4 w-4"
    >
      <path d="m3.5 10.5 8.5-7 8.5 7" />
      <path d="M5.5 9.5V20h13V9.5M9.5 20v-6h5v6" />
    </svg>
  );
}

/* =========================================================
   FOOTER COLUMN
========================================================= */

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: string[];
}) {
  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/50">
        {title}
      </h3>

      <div className="mt-4 flex flex-col gap-3">
        {links.map((link) => (
          <button
            key={link}
            className="text-left text-xs text-white/25 transition hover:text-white/65"
          >
            {link}
          </button>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   BADGE
========================================================= */

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-500 px-1 text-[8px] font-bold text-white shadow-lg shadow-violet-500/30">
      {children}
    </span>
  );
}

/* =========================================================
   TRUST ITEM
========================================================= */

function TrustItem({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-violet-400/20 bg-violet-400/[0.06] text-[8px] text-violet-300">
        {icon}
      </span>

      {label}
    </div>
  );
}

/* =========================================================
   SEARCH ICON
========================================================= */

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

/* =========================================================
   HEART
========================================================= */

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-4 w-4"
    >
      <path d="M20.8 8.7c0 5.4-8.8 10.1-8.8 10.1S3.2 14.1 3.2 8.7A4.5 4.5 0 0 1 12 6.2a4.5 4.5 0 0 1 8.8 2.5Z" />
    </svg>
  );
}

/* =========================================================
   CART
========================================================= */

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-4 w-4"
    >
      <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

/* =========================================================
   USER
========================================================= */

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-3.5 w-3.5"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.3 3.2-5 7-5s6.2 1.7 7 5" />
    </svg>
  );
}

/* =========================================================
   ORDERS
========================================================= */

function OrdersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-3.5 w-3.5"
    >
      <path d="M6 3h12v18H6z" />
      <path d="M9 7h6M9 11h6M9 15h4" />
    </svg>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-3.5 w-3.5"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.2-1.6l2-1.5-2-3.4-2.4 1a7 7 0 0 0-2.7-1.6L13.4 2h-4l-.3 2.9a7 7 0 0 0-2.7 1.6L4 5.5 2 8.9l2 1.5A7 7 0 0 0 4 12c0 .6.1 1.1.2 1.6l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 2.7 1.6l.3 2.9h4l.3-2.9a7 7 0 0 0 2.7-1.6l2.4 1 2-3.4-2-1.5c.1-.5.2-1 .2-1.6Z" />
    </svg>
  );
}

/* =========================================================
   LOGOUT
========================================================= */

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-3.5 w-3.5"
    >
      <path d="M10 5H5v14h5" />
      <path d="M14 8l4 4-4 4M8 12h10" />
    </svg>
  );
}

/* =========================================================
   CHEVRON
========================================================= */

function ChevronDown() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-3 w-3"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/* =========================================================
   MENU
========================================================= */

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

/* =========================================================
   CLOSE
========================================================= */

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

/* =========================================================
   CHART
========================================================= */

function ChartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-4 w-4"
    >
      <path d="M4 19V5M4 19h16" />
      <path d="m7 15 3-4 3 2 5-7" />
    </svg>
  );
}

/* =========================================================
   LARGE HEADPHONES
========================================================= */

function HeadphoneLarge() {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-24 w-24"
    >
      <path d="M18 44V35a22 22 0 0 1 44 0v9" />
      <rect x="12" y="39" width="14" height="23" rx="6" />
      <rect x="54" y="39" width="14" height="23" rx="6" />
      <path d="M26 58c4 8 10 11 18 11" />
    </svg>
  );
}

/* =========================================================
   CATEGORY ICON
========================================================= */

function CategoryIcon({ type }: { type: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    className: "h-5 w-5",
  };

  if (type === "electronics") {
    return (
      <svg {...common}>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 7h6M9 11h6M10 17h4" />
      </svg>
    );
  }

  if (type === "fashion") {
    return (
      <svg {...common}>
        <path d="m9 4 3 2 3-2 5 4-3 4-2-2v10H9V10l-2 2-3-4 5-4Z" />
      </svg>
    );
  }

  if (type === "home") {
    return (
      <svg {...common}>
        <path d="m3 11 9-7 9 7" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </svg>
    );
  }

  if (type === "beauty") {
    return (
      <svg {...common}>
        <path d="M8 3h8M9 3v5l-4 6a4 4 0 0 0 3.4 6h7.2A4 4 0 0 0 19 14l-4-6V3" />
        <path d="M7 14h10" />
      </svg>
    );
  }

  if (type === "sports") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M4 9h16M7 5l3 5M17 5l-3 5M7 19l3-6M17 19l-3-6" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M7 8h10l2 12H5L7 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  );
}

/* =========================================================
   PRODUCT ICON
========================================================= */

function ProductIcon({ type }: { type: string }) {
  const common = {
    viewBox: "0 0 80 80",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    className: "h-20 w-20",
  };

  switch (type) {
    case "headphones":
      return (
        <svg {...common}>
          <path d="M18 45V35a22 22 0 0 1 44 0v10" />
          <rect x="12" y="39" width="14" height="23" rx="6" />
          <rect x="54" y="39" width="14" height="23" rx="6" />
          <path d="M26 58c4 8 10 11 18 11" />
        </svg>
      );

    case "bag":
      return (
        <svg {...common}>
          <path d="M19 27h42l-4 38H23l-4-38Z" />
          <path d="M29 27a11 11 0 0 1 22 0" />
          <path d="M31 39c3 3 15 3 18 0" />
        </svg>
      );

    case "watch":
      return (
        <svg {...common}>
          <path d="M30 17h20l3 10H27l3-10ZM30 63h20l3-10H27l3 10Z" />
          <rect x="25" y="27" width="30" height="26" rx="7" />
          <circle cx="40" cy="40" r="7" />
          <path d="M40 36v5l3 2" />
        </svg>
      );

    case "ceramic":
      return (
        <svg {...common}>
          <path d="M22 27h36l-3 30a8 8 0 0 1-8 7H33a8 8 0 0 1-8-7l-3-30Z" />
          <path d="M28 27c0-7 4-11 12-11s12 4 12 11" />
          <path d="M29 42h22" />
        </svg>
      );

    case "shirt":
      return (
        <svg {...common}>
          <path d="m27 17 13 7 13-7 12 11-8 9-5-5v31H28V32l-5 5-8-9 12-11Z" />
        </svg>
      );

    case "lamp":
      return (
        <svg {...common}>
          <path d="M25 35h30l-7-18H32l-7 18Z" />
          <path d="M40 35v27M31 62h18" />
          <path d="M22 35h36" />
        </svg>
      );

    case "shoe":
      return (
        <svg {...common}>
          <path d="M17 51c8 0 14-9 17-18l9 11c4 4 10 6 18 7v10H17c-5 0-7-7 0-10Z" />
          <path d="M34 34c2 4 6 7 9 9M29 39l8 3" />
        </svg>
      );

    default:
      return (
        <svg {...common}>
          <path d="M29 20h22l5 12v29H24V32l5-12Z" />
          <path d="M34 20v12h12V20M29 39h22" />
        </svg>
      );
  }
}
