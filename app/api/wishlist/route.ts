import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

/**
 * Get the currently authenticated user's ID.
 */
async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("nexora_session")?.value;

  if (!token) {
    return null;
  }

  const session = await verifySession(token);

  if (!session) {
    return null;
  }

  return session.userId;
}

/**
 * GET /api/wishlist
 *
 * Returns the current user's wishlist,
 * including the saved products and their images.
 */
export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 },
      );
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: {
        userId,
      },

      include: {
        items: {
          orderBy: {
            createdAt: "desc",
          },

          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });

    if (!wishlist) {
      return NextResponse.json({
        success: true,
        wishlist: null,
        items: [],
        count: 0,
      });
    }

    return NextResponse.json({
      success: true,

      wishlist: {
        id: wishlist.id,
        createdAt: wishlist.createdAt,
        updatedAt: wishlist.updatedAt,
      },

      items: wishlist.items,

      count: wishlist.items.length,
    });
  } catch (error) {
    console.error("Wishlist GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load wishlist",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/wishlist
 *
 * Add a product to the current user's wishlist.
 *
 * Body:
 * {
 *   "productId": "..."
 * }
 */
export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    const productId =
      typeof body?.productId === "string"
        ? body.productId.trim()
        : "";

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required",
        },
        { status: 400 },
      );
    }

    /**
     * Make sure the product exists.
     */
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    /**
     * Every user has only one wishlist.
     */
    const wishlist = await prisma.wishlist.upsert({
      where: {
        userId,
      },

      create: {
        userId,
      },

      update: {},
    });

    /**
     * Prevent duplicate wishlist items.
     */
    const item = await prisma.wishlistItem.upsert({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },

      create: {
        wishlistId: wishlist.id,
        productId,
      },

      update: {},

      include: {
        product: {
          include: {
            images: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product added to wishlist",
        item,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Wishlist POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to add product to wishlist",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/wishlist?productId=...
 *
 * Remove a product from the current user's wishlist.
 */
export async function DELETE(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 },
      );
    }

    const url = new URL(request.url);

    const productId = url.searchParams
      .get("productId")
      ?.trim();

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required",
        },
        { status: 400 },
      );
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: {
        userId,
      },

      select: {
        id: true,
      },
    });

    if (!wishlist) {
      return NextResponse.json(
        {
          success: false,
          message: "Wishlist not found",
        },
        { status: 404 },
      );
    }

    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },

      select: {
        id: true,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        {
          success: false,
          message: "Product is not in wishlist",
        },
        { status: 404 },
      );
    }

    await prisma.wishlistItem.delete({
      where: {
        id: existingItem.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product removed from wishlist",
      productId,
    });
  } catch (error) {
    console.error("Wishlist DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to remove product from wishlist",
      },
      { status: 500 },
    );
  }
}