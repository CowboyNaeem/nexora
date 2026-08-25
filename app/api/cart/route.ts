import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

// =========================================================
// Get authenticated user ID
// =========================================================

async function getUserId() {
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

// =========================================================
// GET /api/cart
// =========================================================

export async function GET() {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: {
        userId,
      },
      include: {
        items: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            product: {
              include: {
                images: true,
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({
        success: true,
        cart: {
          id: null,
          items: [],
        },
      });
    }

    return NextResponse.json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("NEXORA cart GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load cart",
      },
      { status: 500 }
    );
  }
}

// =========================================================
// POST /api/cart
// Add product to cart
// =========================================================

export async function POST(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const productId =
      typeof body.productId === "string"
        ? body.productId.trim()
        : "";

    const quantity =
      Number.isInteger(body.quantity) && body.quantity > 0
        ? body.quantity
        : 1;

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required",
        },
        { status: 400 }
      );
    }

    // Find product
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        inventory: true,
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

    if (product.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message: "This product is not available",
        },
        { status: 400 }
      );
    }

    // Check stock
    if (product.inventory) {
      const availableStock =
        product.inventory.quantity -
        product.inventory.reserved;

      if (availableStock < quantity) {
        return NextResponse.json(
          {
            success: false,
            message: "Not enough stock available",
          },
          { status: 400 }
        );
      }
    }

    // Create cart if it doesn't exist
    const cart = await prisma.cart.upsert({
      where: {
        userId,
      },
      update: {},
      create: {
        userId,
      },
    });

    // Check whether product already exists
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: null,
      },
    });

    let cartItem;

    if (existingItem) {
      const newQuantity =
        existingItem.quantity + quantity;

      if (product.inventory) {
        const availableStock =
          product.inventory.quantity -
          product.inventory.reserved;

        if (newQuantity > availableStock) {
          return NextResponse.json(
            {
              success: false,
              message: "Not enough stock available",
            },
            { status: 400 }
          );
        }
      }

      cartItem = await prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: newQuantity,
        },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: {
        id: cart.id,
      },
      include: {
        items: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            product: {
              include: {
                images: true,
              },
            },
            variant: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: existingItem
        ? "Cart quantity updated"
        : "Product added to cart",
      item: cartItem,
      cart: updatedCart,
    });
  } catch (error) {
    console.error("NEXORA cart POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to add product to cart",
      },
      { status: 500 }
    );
  }
}

// =========================================================
// PATCH /api/cart
// Update cart item quantity
// =========================================================

export async function PATCH(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const itemId =
      typeof body.itemId === "string"
        ? body.itemId.trim()
        : "";

    const quantity =
      Number.isInteger(body.quantity) && body.quantity > 0
        ? body.quantity
        : 0;

    if (!itemId) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart item ID is required",
        },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity must be at least 1",
        },
        { status: 400 }
      );
    }

    // Make sure this cart item belongs to the logged-in user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId,
        },
      },
      include: {
        product: {
          include: {
            inventory: true,
          },
        },
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart item not found",
        },
        { status: 404 }
      );
    }

    // Check stock
    if (cartItem.product.inventory) {
      const availableStock =
        cartItem.product.inventory.quantity -
        cartItem.product.inventory.reserved;

      if (quantity > availableStock) {
        return NextResponse.json(
          {
            success: false,
            message: `Only ${availableStock} item${
              availableStock === 1 ? "" : "s"
            } available`,
          },
          { status: 400 }
        );
      }
    }

    // Update quantity
    const updatedItem = await prisma.cartItem.update({
      where: {
        id: itemId,
      },
      data: {
        quantity,
      },
      include: {
        product: {
          include: {
            images: true,
          },
        },
        variant: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cart updated",
      item: updatedItem,
    });
  } catch (error) {
    console.error("NEXORA cart PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update cart",
      },
      { status: 500 }
    );
  }
}

// =========================================================
// DELETE /api/cart
// Remove item from cart
// =========================================================

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const itemId =
      typeof body.itemId === "string"
        ? body.itemId.trim()
        : "";

    if (!itemId) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart item ID is required",
        },
        { status: 400 }
      );
    }

    // Make sure the item belongs to this user's cart
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId,
        },
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart item not found",
        },
        { status: 404 }
      );
    }

    await prisma.cartItem.delete({
      where: {
        id: itemId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("NEXORA cart DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to remove item",
      },
      { status: 500 }
    );
  }
}