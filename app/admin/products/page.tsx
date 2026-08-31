"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ProductImage = {
  id: string;
  url: string;
  altText?: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

type ProductInventory = {
  quantity: number;
  reserved: number;
};

type ProductCategory = {
  id: string;
  name: string;
  slug: string;
};

type ProductBrand = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string | null;
  price: string | number;
  compareAtPrice?: string | number | null;
  status: string;
  rating?: string | number;
  reviewCount?: number;
  category?: ProductCategory | null;
  brand?: ProductBrand | null;
  images?: ProductImage[];
  inventory?: ProductInventory | null;
};

function formatPrice(value: string | number | null | undefined) {
  const amount = Number(value ?? 0);

  return `৳${amount.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getProductImage(product: Product) {
  const primary = product.images?.find((image) => image.isPrimary);

  return primary?.url || product.images?.[0]?.url || null;
}

function getStock(product: Product) {
  return product.inventory?.quantity ?? 0;
}

function getAvailableStock(product: Product) {
  const quantity = product.inventory?.quantity ?? 0;
  const reserved = product.inventory?.reserved ?? 0;

  return Math.max(quantity - reserved, 0);
}

function getStockStatus(quantity: number) {
  if (quantity <= 0) {
    return {
      label: "Out of stock",
      className:
        "border-red-500/20 bg-red-500/10 text-red-400",
      dotClassName: "bg-red-400",
    };
  }

  if (quantity <= 10) {
    return {
      label: "Low stock",
      className:
        "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
      dotClassName: "bg-yellow-400",
    };
  }

  return {
    label: "In stock",
    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    dotClassName: "bg-emerald-400",
  };
}

function Icon({
  name,
  size = 20,
}: {
  name:
    | "grid"
    | "orders"
    | "products"
    | "categories"
    | "users"
    | "sellers"
    | "payments"
    | "shipments"
    | "settings"
    | "profile"
    | "search"
    | "plus"
    | "chevron"
    | "box"
    | "package"
    | "warning"
    | "check"
    | "filter"
    | "edit"
    | "eye";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );

    case "orders":
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );

    case "products":
      return (
        <svg {...common}>
          <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
          <path d="m4.5 7.5 7.5 4 7.5-4M12 11.5V21" />
        </svg>
      );

    case "categories":
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h16" />
          <circle cx="8" cy="6" r="2" />
          <circle cx="15" cy="12" r="2" />
          <circle cx="10" cy="18" r="2" />
        </svg>
      );

    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6" />
          <path d="M16 5.5a3 3 0 0 1 0 5.5M17 14c2.5.5 3.8 2.3 4 5" />
        </svg>
      );

    case "sellers":
      return (
        <svg {...common}>
          <path d="M4 10h16l-1.5-5h-13L4 10Z" />
          <path d="M5 10v10h14V10M9 20v-5h6v5" />
        </svg>
      );

    case "payments":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 9h18M7 15h4" />
        </svg>
      );

    case "shipments":
      return (
        <svg {...common}>
          <path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" />
          <circle cx="7" cy="19" r="2" />
          <circle cx="18" cy="19" r="2" />
        </svg>
      );

    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.6-1H6v-2.6h.4A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2H15V5a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.6H21a1.7 1.7 0 0 0-1.6 1.4Z" />
        </svg>
      );

    case "profile":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3" />
          <path d="M5 21c.8-4.2 3.1-6 7-6s6.2 1.8 7 6" />
        </svg>
      );

    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      );

    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );

    case "chevron":
      return (
        <svg {...common}>
          <path d="m8 10 4 4 4-4" />
        </svg>
      );

    case "box":
      return (
        <svg {...common}>
          <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
          <path d="m4.5 7.5 7.5 4 7.5-4M12 11.5V21" />
        </svg>
      );

    case "package":
      return (
        <svg {...common}>
          <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
          <path d="M4 7.5 12 12l8-4.5M12 12v9" />
        </svg>
      );

    case "warning":
      return (
        <svg {...common}>
          <path d="M12 3 2.5 20h19L12 3Z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "filter":
      return (
        <svg {...common}>
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
      );

    case "edit":
      return (
        <svg {...common}>
          <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
          <path d="m13.5 6.5 4 4" />
        </svg>
      );

    case "eye":
      return (
        <svg {...common}>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
  }
}


function StatCard({
  icon,
  label,
  value,
  description,
  tone,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  value: string | number;
  description: string;
  tone: "violet" | "cyan" | "yellow" | "red";
}) {
  const tones = {
    violet: {
      icon: "bg-violet-500/10 text-violet-400",
      border: "hover:border-violet-500/20",
    },
    cyan: {
      icon: "bg-cyan-500/10 text-cyan-400",
      border: "hover:border-cyan-500/20",
    },
    yellow: {
      icon: "bg-yellow-500/10 text-yellow-400",
      border: "hover:border-yellow-500/20",
    },
    red: {
      icon: "bg-red-500/10 text-red-400",
      border: "hover:border-red-500/20",
    },
  };

  const currentTone = tones[tone];

  return (
    <div
      className={`rounded-2xl border border-white/[0.07] bg-[#0d1018] p-4 transition sm:p-5 ${currentTone.border}`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${currentTone.icon} sm:h-11 sm:w-11`}
        >
          <Icon name={icon} size={21} />
        </div>
      </div>

      <p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:mt-5 sm:text-[11px]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function ProductImage({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);
  const image = getProductImage(product);

  if (!image || failed) {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-slate-600 sm:h-14 sm:w-14">
        <Icon name="package" size={23} />
      </div>
    );
  }

  return (
    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.025] sm:h-14 sm:w-14">
      <img
        src={image}
        alt={product.images?.find((item) => item.isPrimary)?.altText || product.name}
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [categoryOptions, setCategoryOptions] = useState<ProductCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/products", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load products");
        }

        setProducts(data.products || []);
      } catch (err) {
        console.error("Admin products error:", err);
        setError("Unable to load products.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function loadCategories() {
      try {
        setCategoriesLoading(true);

        const response = await fetch("/api/categories", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load categories");
        }

        const options: ProductCategory[] = (data.categories || []).map(
          (item: {
            id: string;
            name: string;
            slug: string;
          }) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
          })
        );

        setCategoryOptions(
          options.sort((a, b) => a.name.localeCompare(b.name))
        );
      } catch (err) {
        console.error("Admin product categories error:", err);

        // Fallback: derive category options from the products already loaded.
        const map = new Map<string, ProductCategory>();

        products.forEach((product) => {
          if (product.category?.slug && product.category.name) {
            map.set(product.category.slug, product.category);
          }
        });

        setCategoryOptions(
          Array.from(map.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
          )
        );
      } finally {
        setCategoriesLoading(false);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    if (categoryOptions.length > 0 || products.length === 0) return;

    const map = new Map<string, ProductCategory>();
    products.forEach((product) => {
      if (product.category?.slug && product.category.name) {
        map.set(product.category.slug, product.category);
      }
    });

    if (map.size > 0) {
      setCategoryOptions(
        Array.from(map.values()).sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
    }
  }, [products, categoryOptions.length]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.brand?.name?.toLowerCase().includes(query);

      const matchesCategory =
        category === "all" ||
        product.category?.slug === category ||
        product.category?.id === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const stats = useMemo(() => {
    const lowStock = products.filter((product) => {
      const stock = getStock(product);
      return stock > 0 && stock <= 10;
    }).length;

    const outOfStock = products.filter(
      (product) => getStock(product) <= 0
    ).length;

    const totalInventory = products.reduce(
      (sum, product) => sum + getAvailableStock(product),
      0
    );

    return {
      total: products.length,
      active: products.filter((product) => product.status === "ACTIVE").length,
      lowStock,
      outOfStock,
      totalInventory,
    };
  }, [products]);

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 pb-28 pt-5 sm:px-8 sm:pb-10 sm:pt-7 lg:px-10 lg:py-9">
            {/* HEADER */}
            <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-400">
                  Nexora Admin
                </div>

                <h1 className="mt-2 text-[30px] font-semibold leading-tight tracking-tight text-white sm:text-4xl">
                  Products
                </h1>

                <p className="mt-2 text-sm text-slate-500 sm:text-[15px]">
                  Manage your product catalog, pricing and inventory.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-xl border border-white/[0.07] bg-[#0d1018] px-4 py-2.5 sm:block">
                  <div className="text-sm font-medium text-white">
                    NEXORA Admin
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Administrator
                  </div>
                </div>

                <Link
                  href="/admin/products/new"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(124,58,237,0.2)] transition active:scale-[0.99] hover:bg-violet-500 sm:w-auto"
                >
                  <Icon name="plus" size={18} />
                  Add Product
                </Link>
              </div>
            </header>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-violet-500/15 bg-violet-500/[0.045] px-4 py-3 lg:hidden">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/70">
                  Catalog
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {stats.total} products · {stats.totalInventory} available units
                </p>
              </div>

              <Link
                href="/admin/products/new"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-violet-600 px-3 text-[11px] font-semibold text-white active:scale-[0.98]"
              >
                <Icon name="plus" size={14} />
                Add
              </Link>
            </div>

            {/* STATS */}
            <section className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 xl:grid-cols-4">
              <StatCard
                icon="products"
                label="Total Products"
                value={stats.total}
                description="Products in catalog"
                tone="violet"
              />

              <StatCard
                icon="check"
                label="Active Products"
                value={stats.active}
                description="Currently available"
                tone="cyan"
              />

              <StatCard
                icon="warning"
                label="Low Stock"
                value={stats.lowStock}
                description="10 units or less"
                tone="yellow"
              />

              <StatCard
                icon="box"
                label="Out of Stock"
                value={stats.outOfStock}
                description={`${stats.totalInventory} available units`}
                tone="red"
              />
            </section>

            {/* TOOLBAR + TABLE */}
            <section className="mt-5 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d1018] sm:mt-6">
              <div className="border-b border-white/[0.07] px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-white sm:text-lg">
                      Product Catalog
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {filteredProducts.length}{" "}
                      {filteredProducts.length === 1 ? "product" : "products"}{" "}
                      shown
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-2.5 sm:flex-row">
                    {/* SEARCH */}
                    <div className="relative min-w-0 flex-1 sm:w-[300px] sm:flex-none">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">
                        <Icon name="search" size={18} />
                      </span>

                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search products..."
                        className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#090b10] pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/10"
                      />
                    </div>

                    {/* CATEGORY */}
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        disabled={categoriesLoading}
                        className="h-11 w-full min-w-0 appearance-none rounded-xl border border-white/[0.08] bg-[#090b10] pl-4 pr-10 text-sm text-slate-300 outline-none transition focus:border-violet-500/40 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[180px]"
                      >
                        <option value="all">
                          {categoriesLoading ? "Loading categories..." : "All categories"}
                        </option>

                        {categoryOptions.map((item) => (
                          <option key={item.id} value={item.slug}>
                            {item.name}
                          </option>
                        ))}
                      </select>

                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600">
                        <Icon name="chevron" size={17} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="mx-4 my-4 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300 sm:m-5">
                  {error}
                </div>
              )}

              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-left">
                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                        Product
                      </th>

                      <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                        Category
                      </th>

                      <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                        Price
                      </th>

                      <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                        Stock
                      </th>

                      <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr
                          key={index}
                          className="border-b border-white/[0.05]"
                        >
                          <td colSpan={6} className="px-6 py-5">
                            <div className="h-14 animate-pulse rounded-xl bg-white/[0.025]" />
                          </td>
                        </tr>
                      ))
                    ) : filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center">
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] text-slate-600">
                            <Icon name="products" size={24} />
                          </div>

                          <p className="mt-4 font-medium text-white">
                            No products found
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Try changing your search or category filter.
                          </p>

                          {(search || category !== "all") && (
                            <button
                              type="button"
                              onClick={() => {
                                setSearch("");
                                setCategory("all");
                              }}
                              className="mt-4 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                            >
                              Clear filters
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => {
                        const stock = getStock(product);
                        const stockStatus = getStockStatus(stock);

                        return (
                          <tr
                            key={product.id}
                            className="group border-b border-white/[0.05] transition hover:bg-white/[0.018]"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <ProductImage product={product} />

                                <div className="min-w-0">
                                  <Link
                                    href={`/products/${product.id}`}
                                    className="block max-w-[310px] truncate text-sm font-semibold text-white transition hover:text-violet-300"
                                  >
                                    {product.name}
                                  </Link>

                                  <div className="mt-1 flex items-center gap-2">
                                    <span className="text-xs text-slate-600">
                                      SKU
                                    </span>

                                    <span className="text-xs text-slate-500">
                                      {product.sku}
                                    </span>
                                  </div>

                                  {product.brand?.name && (
                                    <p className="mt-1 text-xs text-slate-600">
                                      {product.brand.name}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <span className="text-sm text-slate-400">
                                {product.category?.name || "Uncategorized"}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <div className="font-semibold text-white">
                                {formatPrice(product.price)}
                              </div>

                              {product.compareAtPrice &&
                                Number(product.compareAtPrice) >
                                  Number(product.price) && (
                                  <div className="mt-1 text-xs text-slate-600 line-through">
                                    {formatPrice(product.compareAtPrice)}
                                  </div>
                                )}
                            </td>

                            <td className="px-4 py-4">
                              <div className="font-medium text-white">
                                {stock}
                              </div>

                              {product.inventory?.reserved ? (
                                <div className="mt-1 text-xs text-slate-600">
                                  {product.inventory.reserved} reserved
                                </div>
                              ) : (
                                <div className="mt-1 text-xs text-slate-600">
                                  Available
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-4">
  <span
    className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
      product.status === "ACTIVE"
        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
        : product.status === "DRAFT"
          ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
          : product.status === "OUT_OF_STOCK"
            ? "border-red-500/20 bg-red-500/10 text-red-400"
            : "border-slate-500/20 bg-slate-500/10 text-slate-400"
    }`}
  >
    <span
      className={`h-1.5 w-1.5 rounded-full ${
        product.status === "ACTIVE"
          ? "bg-emerald-400"
          : product.status === "DRAFT"
            ? "bg-yellow-400"
            : product.status === "OUT_OF_STOCK"
              ? "bg-red-400"
              : "bg-slate-400"
      }`}
    />

    {product.status === "ACTIVE"
      ? "Active"
      : product.status === "DRAFT"
        ? "Draft"
        : product.status === "OUT_OF_STOCK"
          ? "Out of stock"
          : product.status === "ARCHIVED"
            ? "Archived"
            : product.status}
  </span>
</td>

                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2 opacity-70 transition group-hover:opacity-100">
                                <Link
                                  href={`/products/${product.id}`}
                                  title="View product"
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] text-slate-500 transition hover:border-cyan-500/20 hover:bg-cyan-500/10 hover:text-cyan-400"
                                >
                                  <Icon name="eye" size={16} />
                                </Link>

                                <Link
  href={`/admin/products/${product.id}/edit`}
  title="Edit product"
  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] text-slate-500 transition hover:border-violet-500/20 hover:bg-violet-500/10 hover:text-violet-400"
>
  <Icon name="edit" size={16} />
</Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="divide-y divide-white/[0.05] md:hidden">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="p-5">
                      <div className="h-24 animate-pulse rounded-xl bg-white/[0.025]" />
                    </div>
                  ))
                ) : filteredProducts.length === 0 ? (
                  <div className="px-5 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] text-slate-600">
                      <Icon name="products" size={24} />
                    </div>

                    <p className="mt-4 font-medium text-white">
                      No products found
                    </p>

                    {(search || category !== "all") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setCategory("all");
                        }}
                        className="mt-4 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                ) : (
                  filteredProducts.map((product) => {
                    const stock = getStock(product);
                    const stockStatus = getStockStatus(stock);

                    return (
                      <div key={product.id} className="p-4 sm:p-5">
                        <div className="flex gap-3.5 sm:gap-4">
                          <ProductImage product={product} />

                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/products/${product.id}`}
                              className="line-clamp-2 text-sm font-semibold text-white"
                            >
                              {product.name}
                            </Link>

                            <p className="mt-1 text-xs text-slate-600">
                              {product.sku}
                            </p>

                            <p className="mt-2.5 text-base font-semibold text-white sm:mt-3 sm:text-lg">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-end justify-between gap-3">
                          <div>
                            <p className="text-xs text-slate-600">
                              {product.category?.name || "Uncategorized"}
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                              {stock} units
                            </p>
                          </div>

                          <span
                            className={`shrink-0 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${stockStatus.className} sm:text-[11px]`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${stockStatus.dotClassName}`}
                            />
                            {stockStatus.label}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2.5">
                          <Link
                            href={`/products/${product.id}`}
                            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.07] text-xs font-medium text-slate-300 active:bg-white/[0.04] sm:text-sm"
                          >
                            <Icon name="eye" size={16} />
                            View
                          </Link>

                          <Link
  href={`/admin/products/${product.id}/edit`}
  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 text-xs font-medium text-violet-300 active:bg-violet-500/15 sm:text-sm"
>
  <Icon name="edit" size={16} />
  Edit
</Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <footer className="mt-8 flex flex-col gap-2 border-t border-white/[0.05] pt-5 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <span>NEXORA Admin · Product management</span>

              <Link
                href="/admin"
                className="transition hover:text-slate-400"
              >
                Back to dashboard →
              </Link>
            </footer>
    </div>
  );
}
