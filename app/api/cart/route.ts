import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

const GUEST_CART_COOKIE = "nexora_guest_id";

type CartOwner =
  | { type: "user"; userId: string }
  | { type: "guest"; guestId: string };

async function getCartOwner(): Promise<{
  owner: CartOwner;
  shouldSetGuestCookie: boolean;
}> {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get("nexora_session")?.value;

  if (sessionToken) {
    const session = await verifySession(sessionToken);

    if (session) {
      return {
        owner: {
          type: "user",
          userId: session.userId,
        },
        shouldSetGuestCookie: false,
      };
    }
  }

  let guestId = cookieStore.get(GUEST_CART_COOKIE)?.value;

  if (!guestId) {
    guestId = randomUUID();

    return {
      owner: {
        type: "guest",
        guestId,
      },
      shouldSetGuestCookie: true,
    };
  }

  return {
    owner: {
      type: "guest",
      guestId,
    },
    shouldSetGuestCookie: false,
  };
}

function applyGuestCookie(
  response: NextResponse,
  guestId: string,
) {
  response.cookies.set({
    name: GUEST_CART_COOKIE,
    value: guestId,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

function cartWhere(owner: CartOwner) {
  if (owner.type === "user") {
    return {
      userId: owner.userId,
    };
  }

  return {
    guestId: owner.guestId,
  };
}

function cartCreateData(owner: CartOwner) {
  if (owner.type === "user") {
    return {
      userId: owner.userId,
    };
  }

  return {
    guestId: owner.guestId,
  };
}

async function getCartByOwner(owner: CartOwner) {
  return prisma.cart.findUnique({
    where: cartWhere(owner),
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
}

// =========================================================
// GET /api/cart
// Load the current user's or guest's cart
// =========================================================

export async function GET() {
  try {
    const { owner, shouldSetGuestCookie } =
      await getCartOwner();

    const cart = await getCartByOwner(owner);

    const response = NextResponse.json({
      success: true,
      cart: cart ?? {
        id: null,
        items: [],
      },
    });

    if (
      shouldSetGuestCookie &&
      owner.type === "guest"
    ) {
      applyGuestCookie(response, owner.guestId);
    }

    return response;
  } catch (error) {
    console.error("NEXORA cart GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load cart",
      },
      { status: 500 },
    );
  }
}

// =========================================================
// POST /api/cart
// Add product to cart
// =========================================================

export async function POST(request: Request) {
  try {
    const { owner, shouldSetGuestCookie } =
      await getCartOwner();

    const body = await request.json();

    const productId =
      typeof body.productId === "string"
        ? body.productId.trim()
        : "";

    const quantity =
      Number.isInteger(body.quantity) &&
      body.quantity > 0
        ? body.quantity
        : 1;

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required",
        },
        { status: 400 },
      );
    }

    // -------------------------------------------------------
    // Find product
    // -------------------------------------------------------

    const product =
      await prisma.product.findUnique({
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
        { status: 404 },
      );
    }

    // -------------------------------------------------------
    // Product must be active
    // -------------------------------------------------------

    if (product.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message: "This product is not available",
        },
        { status: 400 },
      );
    }

    // -------------------------------------------------------
    // Check stock
    // -------------------------------------------------------

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
          { status: 400 },
        );
      }
    }

    // -------------------------------------------------------
    // Find or create cart
    // -------------------------------------------------------

    let cart = await getCartByOwner(owner);

    if (!cart) {
      cart = await prisma.cart.create({
        data: cartCreateData(owner),
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
    }

    // -------------------------------------------------------
    // Check whether product already exists
    // -------------------------------------------------------

    const existingItem =
      await prisma.cartItem.findFirst({
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
              message:
                "Not enough stock available",
            },
            { status: 400 },
          );
        }
      }

      cartItem =
        await prisma.cartItem.update({
          where: {
            id: existingItem.id,
          },
          data: {
            quantity: newQuantity,
          },
        });
    } else {
      cartItem =
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
          },
        });
    }

    // -------------------------------------------------------
    // Return updated cart
    // -------------------------------------------------------

    const updatedCart =
      await getCartByOwner(owner);

    const response = NextResponse.json({
      success: true,
      message: existingItem
        ? "Cart quantity updated"
        : "Product added to cart",
      item: cartItem,
      cart: updatedCart,
    });

    if (
      shouldSetGuestCookie &&
      owner.type === "guest"
    ) {
      applyGuestCookie(
        response,
        owner.guestId,
      );
    }

    return response;
  } catch (error) {
    console.error("NEXORA cart POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to add product to cart",
      },
      { status: 500 },
    );
  }
}

// =========================================================
// PATCH /api/cart
// Update cart item quantity
// =========================================================

export async function PATCH(request: Request) {
  try {
    const { owner, shouldSetGuestCookie } =
      await getCartOwner();

    const body = await request.json();

    const itemId =
      typeof body.itemId === "string"
        ? body.itemId.trim()
        : "";

    const quantity =
      Number.isInteger(body.quantity) &&
      body.quantity > 0
        ? body.quantity
        : 0;

    if (!itemId) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart item ID is required",
        },
        { status: 400 },
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity must be at least 1",
        },
        { status: 400 },
      );
    }

    // -------------------------------------------------------
    // Make sure the item belongs to this cart
    // -------------------------------------------------------

    const cartItem =
      await prisma.cartItem.findFirst({
        where: {
          id: itemId,
          cart: cartWhere(owner),
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
        { status: 404 },
      );
    }

    // -------------------------------------------------------
    // Check stock
    // -------------------------------------------------------

    if (cartItem.product.inventory) {
      const availableStock =
        cartItem.product.inventory.quantity -
        cartItem.product.inventory.reserved;

      if (quantity > availableStock) {
        return NextResponse.json(
          {
            success: false,
            message: `Only ${availableStock} item${
              availableStock === 1
                ? ""
                : "s"
            } available`,
          },
          { status: 400 },
        );
      }
    }

    // -------------------------------------------------------
    // Update quantity
    // -------------------------------------------------------

    const updatedItem =
      await prisma.cartItem.update({
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

    const response = NextResponse.json({
      success: true,
      message: "Cart updated",
      item: updatedItem,
    });

    if (
      shouldSetGuestCookie &&
      owner.type === "guest"
    ) {
      applyGuestCookie(
        response,
        owner.guestId,
      );
    }

    return response;
  } catch (error) {
    console.error("NEXORA cart PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update cart",
      },
      { status: 500 },
    );
  }
}

// =========================================================
// DELETE /api/cart
// Remove item from cart
// =========================================================

export async function DELETE(
  request: Request,
) {
  try {
    const { owner, shouldSetGuestCookie } =
      await getCartOwner();

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
        { status: 400 },
      );
    }

    // -------------------------------------------------------
    // Make sure the item belongs to this cart
    // -------------------------------------------------------

    const cartItem =
      await prisma.cartItem.findFirst({
        where: {
          id: itemId,
          cart: cartWhere(owner),
        },
        select: {
          id: true,
        },
      });

    if (!cartItem) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart item not found",
        },
        { status: 404 },
      );
    }

    await prisma.cartItem.delete({
      where: {
        id: itemId,
      },
    });

    const response = NextResponse.json({
      success: true,
      message: "Item removed from cart",
    });

    if (
      shouldSetGuestCookie &&
      owner.type === "guest"
    ) {
      applyGuestCookie(
        response,
        owner.guestId,
      );
    }

    return response;
  } catch (error) {
    console.error(
      "NEXORA cart DELETE error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to remove item",
      },
      { status: 500 },
    );
  }
}