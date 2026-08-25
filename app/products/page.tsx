import type { CSSProperties } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StoreHeader from "@/app/components/StoreHeader";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams: Promise<{
    category?: string;
    search?: string;
  }>;
};

function formatPrice(value: unknown) {
  return `৳${Number(value || 0).toFixed(2)}`;
}

function getCategoryDescription(
  name: string,
  description?: string | null
) {
  if (description?.trim()) return description;

  const normalized = name.toLowerCase();

  if (normalized.includes("electronic"))
    return "Smart devices, audio, gadgets and modern technology.";
  if (normalized.includes("fashion"))
    return "Modern clothing, footwear and fashion accessories.";
  if (normalized.includes("home"))
    return "Products designed to make your home better.";
  if (normalized.includes("beauty"))
    return "Beauty, personal care and lifestyle products.";
  if (normalized.includes("sport"))
    return "Fitness, sports and outdoor products.";
  if (normalized.includes("accessor"))
    return "Useful everyday accessories and essentials.";

  return `Explore ${name.toLowerCase()} products available at Nexora.`;
}

function getCategoryAccent(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes("electronic")) return "violet";
  if (normalized.includes("fashion")) return "rose";
  if (normalized.includes("home")) return "amber";
  if (normalized.includes("beauty")) return "fuchsia";
  if (normalized.includes("sport")) return "cyan";
  if (normalized.includes("accessor")) return "emerald";

  return "violet";
}

function CategoryAccent({ name }: { name: string }) {
  const accent = getCategoryAccent(name);

  const colors: Record<
    string,
    { glow: string; text: string; border: string; dot: string }
  > = {
    violet: {
      glow: "bg-violet-500/20",
      text: "text-violet-300",
      border: "border-violet-400/20",
      dot: "bg-violet-400",
    },
    rose: {
      glow: "bg-rose-500/20",
      text: "text-rose-300",
      border: "border-rose-400/20",
      dot: "bg-rose-400",
    },
    amber: {
      glow: "bg-amber-500/20",
      text: "text-amber-300",
      border: "border-amber-400/20",
      dot: "bg-amber-400",
    },
    fuchsia: {
      glow: "bg-fuchsia-500/20",
      text: "text-fuchsia-300",
      border: "border-fuchsia-400/20",
      dot: "bg-fuchsia-400",
    },
    cyan: {
      glow: "bg-cyan-500/20",
      text: "text-cyan-300",
      border: "border-cyan-400/20",
      dot: "bg-cyan-400",
    },
    emerald: {
      glow: "bg-emerald-500/20",
      text: "text-emerald-300",
      border: "border-emerald-400/20",
      dot: "bg-emerald-400",
    },
  };

  const current = colors[accent];

  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${current.border} ${current.glow}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
    </span>
  );
}

function ChevronDown() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const categorySlug =
    typeof params.category === "string"
      ? params.category.trim().toLowerCase()
      : "";

  const searchQuery =
    typeof params.search === "string" ? params.search.trim() : "";

  // Load categories once so customers can switch category without leaving
  // the shop page.
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",

      ...(categorySlug
        ? {
            category: {
              slug: categorySlug,
              isActive: true,
            },
          }
        : {}),

      ...(searchQuery
        ? {
            OR: [
              {
                name: {
                  contains: searchQuery,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: searchQuery,
                  mode: "insensitive",
                },
              },
              {
                brand: {
                  name: {
                    contains: searchQuery,
                    mode: "insensitive",
                  },
                },
              },
              {
                category: {
                  name: {
                    contains: searchQuery,
                    mode: "insensitive",
                  },
                },
              },
            ],
          }
        : {}),
    },

    include: {
      images: {
        orderBy: {
          sortOrder: "asc",
        },
        take: 1,
      },
      brand: true,
      category: true,
      store: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  let selectedCategory = null;

  if (categorySlug) {
    selectedCategory = await prisma.category.findFirst({
      where: {
        slug: categorySlug,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
      },
    });
  }

  const pageTitle = selectedCategory
    ? selectedCategory.name
    : searchQuery
      ? "Search results"
      : "Discover Products";

  const pageDescription = selectedCategory
    ? getCategoryDescription(
        selectedCategory.name,
        selectedCategory.description
      )
    : searchQuery
      ? `Products matching "${searchQuery}".`
      : "Explore our carefully selected collection of products, designed to bring quality, style, and value to your everyday life.";

  const pageEyebrow = selectedCategory
    ? "NEXORA COLLECTION"
    : searchQuery
      ? "SEARCH RESULTS"
      : "NEXORA OFFICIAL STORE";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050507] text-white">
      <StoreHeader />

      <main>
        <style>{`
          @keyframes nexoraCategoryShowcase {
            0%, 9% {
              opacity: 0;
              transform: translateY(7px) scale(0.985);
              filter: blur(3px);
            }
            13%, 24% {
              opacity: 1;
              transform: translateY(0) scale(1);
              filter: blur(0);
            }
            28%, 100% {
              opacity: 0;
              transform: translateY(-7px) scale(0.985);
              filter: blur(3px);
            }
          }

          .category-showcase-item {
            opacity: 0;
            animation: nexoraCategoryShowcase var(--category-cycle) ease-in-out infinite;
            will-change: opacity, transform, filter;
          }

          @media (prefers-reduced-motion: reduce) {
            .category-showcase-item {
              animation: none;
              opacity: 0;
            }

            .category-showcase-item:first-child {
              opacity: 1;
              transform: none;
              filter: none;
            }
          }
        `}</style>

        {/* =========================================================
            COMPACT PREMIUM HERO
        ========================================================= */}
        <section className="relative overflow-hidden border-b border-white/[0.06]">
          {/* Minimal premium atmosphere — intentionally compact.
              No large product image, orbit, or solar-system graphic. */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-40 -top-48 h-[360px] w-[360px] rounded-full bg-violet-600/[0.075] blur-[120px]" />
            <div className="absolute right-[8%] top-[-170px] h-[300px] w-[300px] rounded-full bg-indigo-600/[0.045] blur-[115px]" />
            <div className="absolute bottom-[-180px] left-1/2 h-[260px] w-[620px] -translate-x-1/2 rounded-full bg-violet-500/[0.03] blur-[110px]" />
            <div
              className="absolute inset-0 opacity-[0.010]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                backgroundSize: "72px 72px",
              }}
            />
          </div>

          <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
            <div className="relative grid min-h-[245px] items-center gap-7 py-7 sm:min-h-[265px] sm:py-8 lg:grid-cols-[minmax(0,1fr)_270px] lg:gap-10 lg:py-9">
              <div className="relative z-10">
                {/* Breadcrumb */}
                <div className="mb-4 flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-[0.20em] text-white/25">
                  <Link
                    href="/"
                    className="transition-colors hover:text-white/60"
                  >
                    NEXORA
                  </Link>

                  <span className="text-white/10">/</span>

                  <Link
                    href="/products"
                    className="transition-colors hover:text-white/60"
                  >
                    SHOP
                  </Link>

                  {selectedCategory && (
                    <>
                      <span className="text-white/10">/</span>
                      <span className="text-violet-300/80">
                        {selectedCategory.name.toUpperCase()}
                      </span>
                    </>
                  )}
                </div>

                {/* Eyebrow */}
                <div className="mb-3 flex items-center gap-3">
                  {selectedCategory ? (
                    <CategoryAccent name={selectedCategory.name} />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_14px_rgba(167,139,250,0.9)]" />
                  )}

                  <p className="text-[10px] font-semibold uppercase tracking-[0.30em] text-violet-300/80">
                    {pageEyebrow}
                  </p>
                </div>

                <h1 className="max-w-[720px] text-[38px] font-semibold leading-[1] tracking-[-0.055em] text-white sm:text-5xl lg:text-[54px]">
                  {pageTitle}
                </h1>

                <p className="mt-3 max-w-[610px] text-sm leading-6 text-white/40 sm:text-[15px]">
                  {pageDescription}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.025] px-4 py-2.5 backdrop-blur-xl">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.8)]" />
                    <span className="text-xs font-medium text-white/55">
                      {products.length}{" "}
                      {products.length === 1 ? "product" : "products"} available
                    </span>
                  </div>

                  {selectedCategory && (
                    <Link
                      href="/products"
                      className="group inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-xs font-medium text-white/45 transition-all duration-300 hover:border-violet-400/20 hover:bg-violet-500/[0.06] hover:text-violet-200"
                    >
                      View all products
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Animated category showcase — categories rotate one-by-one.
                  It is data-driven, so new categories appear automatically. */}
              <div className="relative hidden h-[178px] lg:block">
                <div className="absolute inset-0 rounded-[24px] border border-white/[0.08] bg-white/[0.018] shadow-2xl shadow-black/30 backdrop-blur-sm" />

                <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[24px] p-5">
                  <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-violet-500/[0.08] blur-3xl" />
                  <div className="absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-indigo-500/[0.06] blur-3xl" />

                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-violet-300/65">
                        Explore categories
                      </p>
                      <p className="mt-1.5 text-xs text-white/30">
                        Curated for you
                      </p>
                    </div>

                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/[0.07] text-xs font-semibold text-violet-200">
                      N
                    </span>
                  </div>

                  <div className="relative z-10 h-9">
                    {categories.length > 0 ? (
                      <div
                        className="relative h-full"
                        style={{
                          "--category-cycle": `${Math.max(
                            categories.length * 2.2,
                            4.4
                          )}s`,
                        } as CSSProperties}
                      >
                        {categories.map((category, index) => (
                          <Link
                            key={category.id}
                            href={`/products?category=${encodeURIComponent(
                              category.slug
                            )}`}
                            className="category-showcase-item absolute inset-0 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.025] px-3.5 text-sm text-white/75 transition-colors hover:border-violet-400/20 hover:bg-violet-500/[0.06] hover:text-white"
                            style={{
                              animationDelay: `-${index * 2.2}s`,
                            }}
                          >
                            <span className="flex items-center gap-2.5">
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  getCategoryAccent(category.name) === "rose"
                                    ? "bg-rose-400"
                                    : getCategoryAccent(category.name) === "amber"
                                      ? "bg-amber-400"
                                      : getCategoryAccent(category.name) === "fuchsia"
                                        ? "bg-fuchsia-400"
                                        : getCategoryAccent(category.name) === "cyan"
                                          ? "bg-cyan-400"
                                          : getCategoryAccent(category.name) === "emerald"
                                            ? "bg-emerald-400"
                                            : "bg-violet-400"
                                }`}
                              />
                              <span>{category.name}</span>
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.16em] text-white/25">
                              Explore →
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-9 items-center rounded-xl border border-white/[0.06] bg-white/[0.025] px-3.5 text-sm text-white/45">
                        Browse the Nexora collection
                      </div>
                    )}
                  </div>

                  <div className="relative z-10 flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-white/20">
                    <span className="h-px flex-1 bg-white/[0.07]" />
                    <span>{categories.length} categories</span>
                    <span className="h-px w-8 bg-white/[0.07]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            PRODUCT SECTION
        ========================================================= */}
        <section
          id="products"
          className="mx-auto max-w-[1440px] scroll-mt-24 px-5 py-7 sm:px-8 sm:py-8 lg:px-12 lg:py-9"
        >
          <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-violet-400">
                {selectedCategory
                  ? "CATEGORY COLLECTION"
                  : searchQuery
                    ? "SEARCH COLLECTION"
                    : "CURATED COLLECTION"}
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
                {selectedCategory
                  ? selectedCategory.name
                  : searchQuery
                    ? `Results for "${searchQuery}"`
                    : "All Products"}
              </h2>

              <p className="mt-1.5 text-sm text-white/30">
                {selectedCategory
                  ? `Browse ${selectedCategory.name.toLowerCase()} products available at Nexora.`
                  : searchQuery
                    ? `${products.length} matching ${
                        products.length === 1 ? "product" : "products"
                      } found.`
                    : "Browse our latest collection."}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <details
                key={categorySlug || "all"}
                className="group relative z-40 w-[220px] sm:w-[250px]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-white/70 shadow-lg shadow-black/20 outline-none transition hover:border-violet-400/25 hover:bg-violet-500/[0.04] [&::-webkit-details-marker]:hidden">
                  <span className="truncate">
                    {selectedCategory?.name ?? "All categories"}
                  </span>
                  <span className="ml-3 shrink-0 text-white/30 transition-transform duration-200 group-open:rotate-180">
                    <ChevronDown />
                  </span>
                </summary>

                <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 max-h-[280px] overflow-y-auto rounded-2xl border border-white/[0.09] bg-[#0b0b0f]/98 p-1.5 shadow-2xl shadow-black/60 backdrop-blur-xl">
                  <Link
                    href="/products"
                    className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-sm transition ${
                      !selectedCategory
                        ? "bg-violet-500/[0.10] text-violet-200"
                        : "text-white/55 hover:bg-white/[0.045] hover:text-white"
                    }`}
                  >
                    <span>All products</span>
                    {!selectedCategory && (
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                    )}
                  </Link>

                  {categories.map((category) => {
                    const active = category.slug === categorySlug;

                    return (
                      <Link
                        key={category.id}
                        href={`/products?category=${encodeURIComponent(category.slug)}`}
                        className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-sm transition ${
                          active
                            ? "bg-violet-500/[0.10] text-violet-200"
                            : "text-white/55 hover:bg-white/[0.045] hover:text-white"
                        }`}
                      >
                        <span>{category.name}</span>
                        {active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </details>

              <div className="hidden rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-xs font-medium text-white/35 sm:block">
                {products.length} {products.length === 1 ? "item" : "items"}
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.018] px-6 py-20 text-center">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.05] blur-3xl" />

              <div className="relative mx-auto max-w-md">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/[0.06] text-violet-300">
                  <svg
                    width="27"
                    height="27"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 2h12l4 5v15H2V7l4-5Z" />
                    <path d="M2 7h20" />
                    <path d="M9 12h6" />
                  </svg>
                </div>

                <h3 className="mt-6 text-lg font-semibold text-white">
                  No products found
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/30">
                  {selectedCategory
                    ? `There are currently no active products in ${selectedCategory.name}.`
                    : searchQuery
                      ? `We couldn't find anything matching "${searchQuery}".`
                      : "There are currently no active products in the Nexora store."}
                </p>

                <Link
                  href="/products"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90"
                >
                  Browse all products
                  <span>→</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product, index) => {
                const primaryImage = product.images[0]?.url ?? null;

                const hasDiscount =
                  product.compareAtPrice &&
                  Number(product.compareAtPrice) > Number(product.price);

                const discountPercentage = hasDiscount
                  ? Math.round(
                      ((Number(product.compareAtPrice) -
                        Number(product.price)) /
                        Number(product.compareAtPrice)) *
                        100
                    )
                  : 0;

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group block"
                  >
                    <article className="h-full overflow-hidden rounded-[22px] border border-white/[0.08] bg-white/[0.018] transition-all duration-500 hover:-translate-y-1.5 hover:border-violet-400/25 hover:bg-white/[0.035] hover:shadow-[0_25px_70px_rgba(0,0,0,0.45)]">
                      <div className="relative aspect-square overflow-hidden bg-white/[0.025]">
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={
                              product.images[0]?.altText ?? product.name
                            }
                            loading={index < 4 ? "eager" : "lazy"}
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center text-white/20">
                            <svg
                              width="40"
                              height="40"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.3"
                            >
                              <rect
                                x="3"
                                y="3"
                                width="18"
                                height="18"
                                rx="2"
                              />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <path d="m21 15-5-5L5 21" />
                            </svg>
                            <span className="mt-3 text-xs text-white/20">
                              No image available
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                        <div className="absolute left-4 top-4">
                          <span className="rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md">
                            {product.category.name}
                          </span>
                        </div>

                        {hasDiscount && discountPercentage > 0 && (
                          <div className="absolute right-4 top-4">
                            <span className="rounded-full bg-violet-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-lg shadow-violet-950/40">
                              -{discountPercentage}%
                            </span>
                          </div>
                        )}

                        <div className="absolute bottom-4 left-1/2 w-[calc(100%-2rem)] -translate-x-1/2 translate-y-3 rounded-xl border border-white/10 bg-black/75 px-4 py-3 text-center text-xs font-semibold text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          View product
                        </div>
                      </div>

                      <div className="flex flex-col p-5">
                        <p className="text-[9px] font-bold uppercase tracking-[0.20em] text-violet-400">
                          {product.brand?.name ?? "NEXORA"}
                        </p>

                        <h3 className="mt-2 min-h-[3.5rem] line-clamp-2 text-lg font-semibold leading-7 tracking-[-0.02em] text-white transition-colors duration-300 group-hover:text-violet-200">
                          {product.name}
                        </h3>

                        {product.store?.name && (
                          <p className="mt-2 text-xs text-white/25">
                            Sold by{" "}
                            <span className="text-white/40">
                              {product.store.name}
                            </span>
                          </p>
                        )}

                        <div className="mt-5 flex items-end gap-3">
                          <span className="text-xl font-semibold text-white">
                            {formatPrice(product.price)}
                          </span>

                          {hasDiscount && (
                            <span className="mb-0.5 text-sm text-white/25 line-through">
                              {formatPrice(product.compareAtPrice)}
                            </span>
                          )}
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
                          <span className="text-xs font-medium text-white/30 transition-colors duration-300 group-hover:text-white/60">
                            View details
                          </span>

                          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-white/30 transition-all duration-300 group-hover:border-violet-400/30 group-hover:bg-violet-500/[0.08] group-hover:text-violet-300">
                            <ArrowRight />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Compact bottom CTA */}
        <section className="border-t border-white/[0.05] bg-white/[0.012]">
          <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12">
            <div className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-gradient-to-br from-violet-500/[0.07] via-white/[0.018] to-indigo-500/[0.04] px-6 py-8 sm:px-10">
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/[0.08] blur-3xl" />

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-violet-400">
                    NEXORA
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
                    Keep discovering.
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/30">
                    Explore the full Nexora collection and discover something
                    worth bringing home.
                  </p>
                </div>

                <Link
                  href="/products"
                  className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-xs font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90"
                >
                  Explore all products
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-8 text-xs text-white/20 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <div>
            <p className="font-semibold tracking-[0.20em] text-white/50">
              NEXORA
            </p>
            <p className="mt-1 text-[10px] text-white/20">
              Official Store
            </p>
          </div>

          <p className="text-[10px]">
            © {new Date().getFullYear()} NEXORA. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
