import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

import ProductActions from "./ProductActions";
import MobileProductDetails from "./MobileProductDetails";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
      brand: true,
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const price = Number(product.price);

  const compareAtPrice = product.compareAtPrice
    ? Number(product.compareAtPrice)
    : null;

  const primaryImage =
    product.images.find((image) => image.isPrimary)?.url ??
    product.images[0]?.url ??
    null;

  const discount =
    compareAtPrice && compareAtPrice > price
      ? Math.round(
          ((compareAtPrice - price) / compareAtPrice) * 100
        )
      : null;

  const isAvailable = product.status === "ACTIVE";

  return (
    <>
      {/* =====================================================
          MOBILE — NEW DESIGN
          Visible only below lg breakpoint
      ===================================================== */}

      <div className="lg:hidden">
        <MobileProductDetails
          product={{
            id: product.id,
            name: product.name,
            sku: product.sku,
            description: product.description,
            price,
            compareAtPrice,
            rating: Number(product.rating),
            reviewCount: product.reviewCount,
            category: {
              name: product.category.name,
            },
            brand: product.brand
              ? {
                  name: product.brand.name,
                }
              : null,
            images: product.images.map((image) => ({
              id: image.id,
              url: image.url,
              altText: image.altText,
              isPrimary: image.isPrimary,
              sortOrder: image.sortOrder,
            })),
            isAvailable,
            discount,
          }}
        />
      </div>

      {/* =====================================================
          DESKTOP — EXISTING DESIGN
          Visible only on lg screens and above
      ===================================================== */}

      <main className="hidden min-h-screen bg-black text-white lg:block">
        <div className="mx-auto max-w-[1400px] px-5 pb-20 pt-8 sm:px-8 lg:px-12">

          {/* =====================================================
              BREADCRUMB
          ===================================================== */}

          <div className="mb-8 flex flex-wrap items-center gap-2 text-xs text-white/30">
            <span className="transition hover:text-white/60">
              Home
            </span>

            <span>/</span>

            <span className="transition hover:text-white/60">
              {product.category.name}
            </span>

            <span>/</span>

            <span className="text-white/55">
              {product.name}
            </span>
          </div>

          {/* =====================================================
              PRODUCT SECTION
          ===================================================== */}

          <section className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)] lg:gap-16">

            {/* =================================================
                LEFT — IMAGE
            ================================================= */}

            <div>
              <div className="group relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.025]">

                {/* subtle glow */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.06] blur-3xl" />

                {primaryImage ? (
                  <div className="relative flex aspect-[4/3] items-center justify-center p-6 sm:p-10 lg:p-12">
                    <img
                      src={primaryImage}
                      alt={product.name}
                      className="relative z-10 max-h-[560px] w-full object-contain transition-transform duration-700 group-hover:scale-[1.025]"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center text-sm text-white/25">
                    No image available
                  </div>
                )}

                {/* Sale badge */}
                {discount && (
                  <div className="absolute left-5 top-5 z-20 rounded-full bg-violet-500 px-3 py-1.5 text-[10px] font-semibold text-white shadow-lg shadow-violet-500/20">
                    SAVE {discount}%
                  </div>
                )}
              </div>

              {/* =================================================
                  IMAGE THUMBNAILS
              ================================================= */}

              {product.images.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto">
                  {product.images.map((image) => (
                    <div
                      key={image.id}
                      className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.025]"
                    >
                      <img
                        src={image.url}
                        alt={image.altText ?? product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* =================================================
                RIGHT — PRODUCT INFORMATION
            ================================================= */}

            <div className="flex flex-col justify-center">

              {/* Category */}
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-400">
                {product.category.name}
              </p>

              {/* Name */}
              <h1 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl lg:text-[46px] lg:leading-[1.08]">
                {product.name}
              </h1>

              {/* Brand */}
              {product.brand && (
                <p className="mt-3 text-sm text-white/35">
                  by{" "}
                  <span className="text-white/60">
                    {product.brand.name}
                  </span>
                </p>
              )}

              {/* Rating */}
              <div className="mt-6 flex items-center gap-2">
                <span className="text-sm text-amber-300">
                  ★
                </span>

                <span className="text-sm font-medium text-white/75">
                  {Number(product.rating).toFixed(1)}
                </span>

                <span className="text-sm text-white/25">
                  ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Divider */}
              <div className="my-7 h-px bg-white/[0.07]" />

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-3xl font-semibold tracking-tight">
                  ${price.toFixed(2)}
                </span>

                {compareAtPrice && compareAtPrice > price && (
                  <span className="text-base text-white/25 line-through">
                    ${compareAtPrice.toFixed(2)}
                  </span>
                )}

                {discount && (
                  <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold text-violet-300">
                    -{discount}%
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="mt-6 max-w-xl text-sm leading-7 text-white/40">
                  {product.description}
                </p>
              )}

              {/* Product info */}
              <div className="mt-7 grid grid-cols-2 gap-3">

                {/* Availability */}
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                  <p className="text-[10px] uppercase tracking-wider text-white/25">
                    Availability
                  </p>

                  <p
                    className={`mt-1.5 text-sm font-medium ${
                      isAvailable
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {isAvailable
                      ? "In stock"
                      : "Unavailable"}
                  </p>
                </div>

                {/* SKU */}
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                  <p className="text-[10px] uppercase tracking-wider text-white/25">
                    SKU
                  </p>

                  <p className="mt-1.5 truncate text-sm text-white/60">
                    {product.sku}
                  </p>
                </div>
              </div>

              {/* =================================================
                  CART ACTIONS
              ================================================= */}

              <ProductActions
                productId={product.id}
                productName={product.name}
                available={isAvailable}
              />

              {/* Trust information */}
              <div className="mt-8 grid grid-cols-3 border-t border-white/[0.07] pt-6">

                <div>
                  <p className="text-xs font-medium text-white/65">
                    Secure payment
                  </p>

                  <p className="mt-1 text-[10px] text-white/25">
                    Protected checkout
                  </p>
                </div>

                <div className="border-l border-white/[0.07] pl-4">
                  <p className="text-xs font-medium text-white/65">
                    Fast delivery
                  </p>

                  <p className="mt-1 text-[10px] text-white/25">
                    Quick shipping
                  </p>
                </div>

                <div className="border-l border-white/[0.07] pl-4">
                  <p className="text-xs font-medium text-white/65">
                    Easy returns
                  </p>

                  <p className="mt-1 text-[10px] text-white/25">
                    Hassle-free
                  </p>
                </div>

              </div>
            </div>
          </section>

          {/* =====================================================
              PRODUCT DETAILS
          ===================================================== */}

          <section className="mt-20 border-t border-white/[0.07] pt-12">

            <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                  PRODUCT DETAILS
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                  Everything you need to know
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3">

                {/* Category */}
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <p className="text-[10px] uppercase tracking-wider text-white/25">
                    Category
                  </p>

                  <p className="mt-2 text-sm text-white/65">
                    {product.category.name}
                  </p>
                </div>

                {/* Brand */}
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <p className="text-[10px] uppercase tracking-wider text-white/25">
                    Brand
                  </p>

                  <p className="mt-2 text-sm text-white/65">
                    {product.brand?.name ?? "NEXORA"}
                  </p>
                </div>

              </div>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}