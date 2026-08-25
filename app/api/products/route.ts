import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlug(name: string) {
  const baseSlug = createSlug(name) || `product-${Date.now()}`;

  let slug = baseSlug;
  let counter = 1;

  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/* =========================================================
   GET /api/products
   Fetch active products
========================================================= */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";

    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",

        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  brand: {
                    name: {
                      contains: search,
                      mode: "insensitive",
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
      },

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

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("GET /api/products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   POST /api/products
   Create a new product
========================================================= */

export async function POST(request: Request) {
  try {
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
      status,
      stockQuantity,
      images,
    } = body;

    /* -----------------------------------------------------
       Basic validation
    ----------------------------------------------------- */

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Product name is required",
        },
        { status: 400 }
      );
    }

    if (!sku || typeof sku !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "SKU is required",
        },
        { status: 400 }
      );
    }

    if (!categoryId || typeof categoryId !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Category is required",
        },
        { status: 400 }
      );
    }

    if (!storeId || typeof storeId !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Store is required",
        },
        { status: 400 }
      );
    }

    if (price === undefined || price === null || price === "") {
      return NextResponse.json(
        {
          success: false,
          message: "Price is required",
        },
        { status: 400 }
      );
    }

    /* -----------------------------------------------------
       Normalize values
    ----------------------------------------------------- */

    const productName = name.trim();
    const productSku = sku.trim().toUpperCase();

    const productDescription =
      typeof description === "string" && description.trim()
        ? description.trim()
        : null;

    const productPrice = Number(price);

    const productCompareAtPrice =
      compareAtPrice !== undefined &&
      compareAtPrice !== null &&
      compareAtPrice !== "" &&
      Number(compareAtPrice) > 0
        ? Number(compareAtPrice)
        : null;

    const productStock =
      stockQuantity !== undefined &&
      stockQuantity !== null &&
      stockQuantity !== ""
        ? Math.max(0, Number(stockQuantity))
        : 0;

    const productStatus =
      status === "ACTIVE" ||
      status === "OUT_OF_STOCK" ||
      status === "ARCHIVED"
        ? status
        : "DRAFT";

    /* -----------------------------------------------------
       Validate numbers
    ----------------------------------------------------- */

    if (!Number.isFinite(productPrice) || productPrice < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product price",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(productStock) || productStock < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid stock quantity",
        },
        { status: 400 }
      );
    }

    if (
      productCompareAtPrice !== null &&
      (!Number.isFinite(productCompareAtPrice) ||
        productCompareAtPrice < 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid compare-at price",
        },
        { status: 400 }
      );
    }

    /* -----------------------------------------------------
       Check SKU
    ----------------------------------------------------- */

    const existingSku = await prisma.product.findUnique({
      where: {
        sku: productSku,
      },
    });

    if (existingSku) {
      return NextResponse.json(
        {
          success: false,
          message: `A product with SKU "${productSku}" already exists`,
        },
        { status: 409 }
      );
    }

    /* -----------------------------------------------------
       Check related records
    ----------------------------------------------------- */

    const categoryExists = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!categoryExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected category does not exist",
        },
        { status: 400 }
      );
    }

    const storeExists = await prisma.store.findUnique({
      where: {
        id: storeId,
      },
    });

    if (!storeExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected store does not exist",
        },
        { status: 400 }
      );
    }

    if (brandId) {
      const brandExists = await prisma.brand.findUnique({
        where: {
          id: brandId,
        },
      });

      if (!brandExists) {
        return NextResponse.json(
          {
            success: false,
            message: "Selected brand does not exist",
          },
          { status: 400 }
        );
      }
    }

    /* -----------------------------------------------------
       Generate unique slug
    ----------------------------------------------------- */

    const slug = await generateUniqueSlug(productName);

    /* -----------------------------------------------------
       Prepare images
    ----------------------------------------------------- */

    const productImages = Array.isArray(images)
      ? images
          .filter(
            (image: unknown) =>
              image &&
              typeof image === "object" &&
              "url" in image &&
              typeof (image as { url?: unknown }).url === "string"
          )
          .map(
            (
              image: {
                url: string;
                altText?: string;
                sortOrder?: number;
                isPrimary?: boolean;
              },
              index: number
            ) => ({
              url: image.url,
              altText:
                typeof image.altText === "string"
                  ? image.altText
                  : productName,
              sortOrder:
                typeof image.sortOrder === "number"
                  ? image.sortOrder
                  : index,
              isPrimary:
                typeof image.isPrimary === "boolean"
                  ? image.isPrimary
                  : index === 0,
            })
          )
      : [];

    /* -----------------------------------------------------
       Create product + inventory + images
       inside one transaction
    ----------------------------------------------------- */

    const createdProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: productName,
          slug,
          description: productDescription,
          sku: productSku,

          price: productPrice,
          compareAtPrice: productCompareAtPrice,

          status: productStatus,

          store: {
            connect: {
              id: storeId,
            },
          },

          category: {
            connect: {
              id: categoryId,
            },
          },

          ...(brandId
            ? {
                brand: {
                  connect: {
                    id: brandId,
                  },
                },
              }
            : {}),
        },

        include: {
          category: true,
          brand: true,
          store: true,
        },
      });

      await tx.inventory.create({
        data: {
          productId: product.id,
          quantity: productStock,
          reserved: 0,
        },
      });

      if (productImages.length > 0) {
        await tx.productImage.createMany({
          data: productImages.map((image) => ({
            productId: product.id,
            url: image.url,
            altText: image.altText,
            sortOrder: image.sortOrder,
            isPrimary: image.isPrimary,
          })),
        });
      }

      return product;
    });

    /* -----------------------------------------------------
       Fetch complete created product
    ----------------------------------------------------- */

    const completeProduct = await prisma.product.findUnique({
      where: {
        id: createdProduct.id,
      },

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
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product: completeProduct,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("POST /api/products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create product",
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}