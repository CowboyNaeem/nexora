import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

// ============================================================
// GET - Admin Product List
// ============================================================

export async function GET(request: Request) {
  try {
    // ------------------------------------------------------------
    // Authentication
    // ------------------------------------------------------------

    const cookieStore = await cookies();
    const token = cookieStore.get("nexora_session")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 },
      );
    }

    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 },
      );
    }

    // Admin-only access
    if (session.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 },
      );
    }

    // ------------------------------------------------------------
    // Read search parameters
    // ------------------------------------------------------------

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";

    // ------------------------------------------------------------
    // Build filters
    // ------------------------------------------------------------

    const where = {
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                sku: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                description: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                brand: {
                  name: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
            ],
          }
        : {}),

      ...(category
        ? {
            category: {
              slug: category,
            },
          }
        : {}),
    };

    // ------------------------------------------------------------
    // Fetch ALL products for admin
    // ------------------------------------------------------------
    // IMPORTANT:
    // Unlike /api/products, this endpoint does NOT restrict
    // products to ACTIVE status.
    //
    // Therefore DRAFT, ACTIVE, OUT_OF_STOCK and ARCHIVED
    // products can all appear in the admin panel.
    // ------------------------------------------------------------

    const products = await prisma.product.findMany({
      where,

      include: {
        category: true,
        brand: true,
        store: true,

        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },

        inventory: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    // ------------------------------------------------------------
    // Return products
    // ------------------------------------------------------------

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("GET /api/admin/products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch admin products",
      },
      { status: 500 },
    );
  }
}

// ============================================================
// POST - Create New Product
// ============================================================

export async function POST(request: Request) {
  try {
    // ------------------------------------------------------------
    // Authentication
    // ------------------------------------------------------------

    const cookieStore = await cookies();
    const token = cookieStore.get("nexora_session")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 },
      );
    }

    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 },
      );
    }

    // Admin-only access
    if (session.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 },
      );
    }

    // ------------------------------------------------------------
    // Read request body
    // ------------------------------------------------------------

    const body = await request.json();

    const {
      name,
      sku,
      description,
      categoryId,
      brandId,
      storeId,
      price,
      compareAtPrice,
      stockQuantity,
      status,
    } = body;

    // ------------------------------------------------------------
    // Basic validation
    // ------------------------------------------------------------

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Product name is required",
        },
        { status: 400 },
      );
    }

    if (!sku || typeof sku !== "string" || !sku.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "SKU is required",
        },
        { status: 400 },
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          message: "Category is required",
        },
        { status: 400 },
      );
    }

    if (!storeId) {
      return NextResponse.json(
        {
          success: false,
          message: "Store is required",
        },
        { status: 400 },
      );
    }

    if (price === undefined || price === null || price === "") {
      return NextResponse.json(
        {
          success: false,
          message: "Price is required",
        },
        { status: 400 },
      );
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Price must be a valid non-negative number",
        },
        { status: 400 },
      );
    }

    const numericStock = Number(stockQuantity ?? 0);

    if (!Number.isInteger(numericStock) || numericStock < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Stock quantity must be a non-negative whole number",
        },
        { status: 400 },
      );
    }

    let numericCompareAtPrice: number | null = null;

    if (
      compareAtPrice !== undefined &&
      compareAtPrice !== null &&
      compareAtPrice !== ""
    ) {
      numericCompareAtPrice = Number(compareAtPrice);

      if (
        !Number.isFinite(numericCompareAtPrice) ||
        numericCompareAtPrice < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Compare-at price must be a valid non-negative number",
          },
          { status: 400 },
        );
      }
    }

    const allowedStatuses = [
      "DRAFT",
      "ACTIVE",
      "OUT_OF_STOCK",
      "ARCHIVED",
    ] as const;

    const productStatus = allowedStatuses.includes(status)
      ? status
      : "DRAFT";

    // ------------------------------------------------------------
    // Validate related records
    // ------------------------------------------------------------

    const [category, store, brand] = await Promise.all([
      prisma.category.findFirst({
        where: {
          id: categoryId,
          isActive: true,
        },
        select: {
          id: true,
        },
      }),

      prisma.store.findFirst({
        where: {
          id: storeId,
          status: "ACTIVE",
        },
        select: {
          id: true,
        },
      }),

      brandId
        ? prisma.brand.findFirst({
            where: {
              id: brandId,
              isActive: true,
            },
            select: {
              id: true,
            },
          })
        : null,
    ]);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected category was not found or is inactive",
        },
        { status: 400 },
      );
    }

    if (!store) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected store was not found or is inactive",
        },
        { status: 400 },
      );
    }

    if (brandId && !brand) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected brand was not found or is inactive",
        },
        { status: 400 },
      );
    }

    // ------------------------------------------------------------
    // Check SKU
    // ------------------------------------------------------------

    const existingSku = await prisma.product.findUnique({
      where: {
        sku: sku.trim(),
      },
      select: {
        id: true,
      },
    });

    if (existingSku) {
      return NextResponse.json(
        {
          success: false,
          message: "A product with this SKU already exists",
        },
        { status: 409 },
      );
    }

    // ------------------------------------------------------------
    // Generate unique slug
    // ------------------------------------------------------------

    const baseSlug =
      name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "product";

    let slug = baseSlug;
    let slugCounter = 1;

    while (
      await prisma.product.findUnique({
        where: {
          slug,
        },
        select: {
          id: true,
        },
      })
    ) {
      slugCounter += 1;
      slug = `${baseSlug}-${slugCounter}`;
    }

    // ------------------------------------------------------------
    // Create Product + Inventory atomically
    // ------------------------------------------------------------

    const product = await prisma.$transaction(async (tx) => {
      const createdProduct = await tx.product.create({
        data: {
          name: name.trim(),
          slug,

          description:
            typeof description === "string" && description.trim()
              ? description.trim()
              : null,

          sku: sku.trim(),
          price: numericPrice,
          compareAtPrice: numericCompareAtPrice,

          status: productStatus,

          storeId,
          categoryId,
          brandId: brandId || null,
        },
      });

      await tx.inventory.create({
        data: {
          productId: createdProduct.id,
          quantity: numericStock,
          reserved: 0,
        },
      });

      return createdProduct;
    });

    // ------------------------------------------------------------
    // Return created product
    // ------------------------------------------------------------

    const result = await prisma.product.findUnique({
      where: {
        id: product.id,
      },

      include: {
        category: true,
        brand: true,
        store: true,
        inventory: true,

        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product: result,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("POST /api/admin/products error:", error);

    // Prisma unique constraint
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A product with the same unique value already exists",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create product",
      },
      { status: 500 },
    );
  }
}