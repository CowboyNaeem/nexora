import { NextResponse } from "next/server";

import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

import { verifySession } from "@/lib/auth";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get(
      "nexora_session"
    )?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: {
        id,
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

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/products/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load product",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    /* ----------------------------------------------------------
       AUTHENTICATION
    ---------------------------------------------------------- */

    const cookieStore = await cookies();

    const token = cookieStore.get(
      "nexora_session"
    )?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      );
    }

    /* ----------------------------------------------------------
       PRODUCT ID
    ---------------------------------------------------------- */

    const { id } = await context.params;

    /* ----------------------------------------------------------
       REQUEST BODY
    ---------------------------------------------------------- */

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
      images,
    } = body;

    /* ----------------------------------------------------------
       VALIDATION
    ---------------------------------------------------------- */

    if (
      !name ||
      typeof name !== "string" ||
      !name.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Product name is required",
        },
        { status: 400 }
      );
    }

    if (
      !sku ||
      typeof sku !== "string" ||
      !sku.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "SKU is required",
        },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          message: "Category is required",
        },
        { status: 400 }
      );
    }

    if (!storeId) {
      return NextResponse.json(
        {
          success: false,
          message: "Store is required",
        },
        { status: 400 }
      );
    }

    if (
      price === undefined ||
      price === null ||
      price === ""
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Price is required",
        },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Price must be a valid non-negative number",
        },
        { status: 400 }
      );
    }

    const numericStock = Number(
      stockQuantity ?? 0
    );

    if (
      !Number.isInteger(numericStock) ||
      numericStock < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Stock quantity must be a non-negative whole number",
        },
        { status: 400 }
      );
    }

    let numericCompareAtPrice:
      | number
      | null = null;

    if (
      compareAtPrice !== undefined &&
      compareAtPrice !== null &&
      compareAtPrice !== ""
    ) {
      numericCompareAtPrice =
        Number(compareAtPrice);

      if (
        !Number.isFinite(
          numericCompareAtPrice
        ) ||
        numericCompareAtPrice < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Compare-at price must be a valid non-negative number",
          },
          { status: 400 }
        );
      }
    }

    const allowedStatuses = [
      "DRAFT",
      "ACTIVE",
      "OUT_OF_STOCK",
      "ARCHIVED",
    ] as const;

    if (
      typeof status !== "string" ||
      !allowedStatuses.includes(
        status as (typeof allowedStatuses)[number]
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product status",
        },
        { status: 400 }
      );
    }

    const productStatus =
      status as (typeof allowedStatuses)[number];

    const productImages: string[] = Array.isArray(images)
      ? images.filter(
          (url: unknown): url is string =>
            typeof url === "string" && url.trim().length > 0
        )
      : [];

    if (productImages.length > 12) {
      return NextResponse.json(
        {
          success: false,
          message: "A product can have a maximum of 12 images",
        },
        { status: 400 }
      );
    }

    /* ----------------------------------------------------------
       CHECK PRODUCT
    ----------------------------------------------------------

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          sku: true,
        },
      });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    /* ----------------------------------------------------------
       CHECK SKU
    ---------------------------------------------------------- */

    const existingSku =
      await prisma.product.findFirst({
        where: {
          sku: sku.trim(),
          NOT: {
            id,
          },
        },
        select: {
          id: true,
        },
      });

    if (existingSku) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A product with this SKU already exists",
        },
        { status: 409 }
      );
    }

    /* ----------------------------------------------------------
       VALIDATE RELATED RECORDS
    ---------------------------------------------------------- */

    const [
      category,
      store,
      brand,
    ] = await Promise.all([
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
          message:
            "Selected category was not found or is inactive",
        },
        { status: 400 }
      );
    }

    if (!store) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected store was not found or is inactive",
        },
        { status: 400 }
      );
    }

    if (brandId && !brand) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected brand was not found or is inactive",
        },
        { status: 400 }
      );
    }

    /* ----------------------------------------------------------
       UPDATE PRODUCT + INVENTORY
    ---------------------------------------------------------- */

    const updatedProduct =
      await prisma.$transaction(
        async (tx) => {
          await tx.product.update({
            where: {
              id,
            },
            data: {
              name: name.trim(),

              description:
                typeof description === "string" &&
                description.trim()
                  ? description.trim()
                  : null,

              sku: sku.trim(),

              price: numericPrice,

              compareAtPrice:
                numericCompareAtPrice,

              status: productStatus,

              storeId,

              categoryId,

              brandId: brandId || null,
            },
          });

          const inventory =
            await tx.inventory.findFirst({
              where: {
                productId: id,
              },
              select: {
                productId: true,
              },
            });

          if (inventory) {
            await tx.inventory.updateMany({
              where: {
                productId: id,
              },
              data: {
                quantity: numericStock,
              },
            });
          } else {
            await tx.inventory.create({
              data: {
                productId: id,
                quantity: numericStock,
                reserved: 0,
              },
            });
          }

          await tx.productImage.deleteMany({
            where: {
              productId: id,
            },
          });

          if (productImages.length > 0) {
            await tx.productImage.createMany({
              data: productImages.map((url, index) => ({
                productId: id,
                url: url.trim(),
                altText: name.trim(),
                sortOrder: index,
                isPrimary: index === 0,
              })),
            });
          }

          return tx.product.findUnique({
            where: {
              id,
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
        }
      );

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error: unknown) {
    console.error(
      "PATCH /api/admin/products/[id] error:",
      error
    );

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A product with the same unique value already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update product",
      },
      { status: 500 }
    );
  }
}