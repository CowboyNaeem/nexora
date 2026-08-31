import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

import {
  verifySession,
  verifyOrderTrackingToken,
} from "@/lib/auth";

const GUEST_CART_COOKIE = "nexora_guest_id";
const ORDER_TRACKING_COOKIE = "nexora_order_tracking";

type OrderOwner =
  | {
      type: "user";
      userId: string;
    }
  | {
      type: "guest";
      guestId: string;
    };

// ============================================================
// Get current normal order owner
// ============================================================
//
// Logged-in customer:
//   nexora_session → userId
//
// Guest browser:
//   nexora_guest_id → guestId
//
// The order-tracking cookie is intentionally handled
// separately because it can authorize a recently verified
// order using Email + Phone.
// ============================================================

async function getOrderOwner(): Promise<OrderOwner | null> {
  const cookieStore = await cookies();

  // ----------------------------------------------------------
  // Logged-in customer
  // ----------------------------------------------------------

  const sessionToken =
    cookieStore.get("nexora_session")?.value;

  if (sessionToken) {
    const session =
      await verifySession(sessionToken);

    if (session) {
      return {
        type: "user",
        userId: session.userId,
      };
    }
  }

  // ----------------------------------------------------------
  // Guest customer
  // ----------------------------------------------------------

  const guestId =
    cookieStore.get(
      GUEST_CART_COOKIE,
    )?.value;

  if (guestId) {
    return {
      type: "guest",
      guestId,
    };
  }

  return null;
}

// ============================================================
// Get verified order-tracking authorization
// ============================================================
//
// The tracking endpoint creates this signed token only after
// successfully matching Email + Phone.
//
// The token contains verified order IDs and is protected by
// AUTH_SECRET.
// ============================================================

async function getOrderTrackingAccess() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(
      ORDER_TRACKING_COOKIE,
    )?.value;

  if (!token) {
    return null;
  }

  return await verifyOrderTrackingToken(
    token,
  );
}

// ============================================================
// Build secure order access conditions
// ============================================================
//
// Access is allowed when at least one of these is true:
//
// 1. Logged-in customer owns the order.
// 2. Guest browser owns the order.
// 3. Email + Phone tracking token was recently verified and
//    contains this order ID.
// ============================================================

async function getOrderAccessConditions(
  id: string,
) {
  const owner =
    await getOrderOwner();

  const trackingAccess =
    await getOrderTrackingAccess();

  const ownershipConditions: Array<
    | { userId: string }
    | { guestId: string }
    | { id: string }
  > = [];

  // ----------------------------------------------------------
  // Logged-in customer ownership
  // ----------------------------------------------------------

  if (owner?.type === "user") {
    ownershipConditions.push({
      userId: owner.userId,
    });
  }

  // ----------------------------------------------------------
  // Guest ownership
  // ----------------------------------------------------------

  if (owner?.type === "guest") {
    ownershipConditions.push({
      guestId: owner.guestId,
    });
  }

  // ----------------------------------------------------------
  // Verified order tracking access
  // ----------------------------------------------------------

  if (
    trackingAccess?.orderIds.includes(id)
  ) {
    ownershipConditions.push({
      id,
    });
  }

  return {
    owner,
    trackingAccess,
    ownershipConditions,
  };
}

// ============================================================
// GET /api/orders/[id]
// ============================================================
//
// Allows:
//
// 1. Logged-in customer → own order
// 2. Guest browser → own guest order
// 3. Recently verified Email + Phone → tracked order
//
// IMPORTANT:
// Order items include their related Product, Product Images,
// and Variant so both desktop and mobile order details pages
// can render complete product information.
// ============================================================

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    // --------------------------------------------------------
    // Get order ID
    // --------------------------------------------------------

    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order ID is required",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------------
    // Build secure access conditions
    // --------------------------------------------------------

    const {
      ownershipConditions,
    } =
      await getOrderAccessConditions(id);

    // --------------------------------------------------------
    // No valid access
    // --------------------------------------------------------

    if (
      ownershipConditions.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 },
      );
    }

    // --------------------------------------------------------
    // Find order
    // --------------------------------------------------------

    const order =
      await prisma.order.findFirst({
        where: {
          id,
          OR: ownershipConditions,
        },

        include: {
          // --------------------------------------------------
          // Order items
          //
          // Product + images are included here so the frontend
          // can display the real product image.
          // --------------------------------------------------

          items: {
            orderBy: {
              createdAt: "asc",
            },

            include: {
              product: {
                include: {
                  images: {
                    orderBy: {
                      sortOrder: "asc",
                    },
                  },
                },
              },

              variant: true,
            },
          },

          // --------------------------------------------------
          // Payment information
          // --------------------------------------------------

          payment: true,

          // --------------------------------------------------
          // Shipment information
          // --------------------------------------------------

          shipment: true,
        },
      });

    // --------------------------------------------------------
    // Order not found
    // --------------------------------------------------------

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order not found",
        },
        { status: 404 },
      );
    }

    // --------------------------------------------------------
    // Success
    // --------------------------------------------------------

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      "NEXORA order details error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load order",
      },
      { status: 500 },
    );
  }
}

// ============================================================
// PATCH /api/orders/[id]
// ============================================================
//
// Used for order cancellation.
//
// Cancellation authorization:
//
// 1. Logged-in customer who owns the order
// 2. Guest browser that owns the order
// 3. Customer/guest who recently verified the order using
//    Email + Phone tracking
//
// Cancellation rules:
//
// - PENDING       → allowed
// - CONFIRMED     → allowed
// - PROCESSING    → allowed
//
// - SHIPPED       → blocked
// - DELIVERED     → blocked
// - CANCELLED     → blocked
//
// Payment safety:
//
// - PENDING payment → payment becomes CANCELLED
// - PAID payment    → cancellation is blocked because NEXORA
//                    does not currently have a refund workflow.
// ============================================================

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    // --------------------------------------------------------
    // Get order ID
    // --------------------------------------------------------

    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order ID is required",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------------
    // Build secure access conditions
    // --------------------------------------------------------

    const {
      ownershipConditions,
    } =
      await getOrderAccessConditions(id);

    // --------------------------------------------------------
    // No valid cancellation authorization
    // --------------------------------------------------------

    if (
      ownershipConditions.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are not authorized to cancel this order.",
        },
        { status: 401 },
      );
    }

    // --------------------------------------------------------
    // Find the order
    // --------------------------------------------------------

    const order =
      await prisma.order.findFirst({
        where: {
          id,
          OR: ownershipConditions,
        },

        include: {
          payment: true,
          shipment: true,
        },
      });

    // --------------------------------------------------------
    // Order not found
    // --------------------------------------------------------

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order not found",
        },
        { status: 404 },
      );
    }

    // ========================================================
    // Check order status
    // ========================================================

    const cancellableStatuses = [
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
    ];

    if (
      !cancellableStatuses.includes(
        order.status,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This order can no longer be cancelled.",
        },
        { status: 400 },
      );
    }

    // ========================================================
    // Payment safety
    // ========================================================
    //
    // COD orders currently have PENDING payment.
    //
    // Mobile Banking orders currently have PAID payment.
    //
    // Since NEXORA does not yet have a refund workflow,
    // paid orders must not be cancelled through this endpoint.
    // ========================================================

    if (
      order.payment?.status ===
      "PAID"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This order has already been paid. Cancellation is not available for paid orders.",
        },
        { status: 400 },
      );
    }

    // ========================================================
    // Cancel order inside a transaction
    // ========================================================

    const cancelledOrder =
      await prisma.$transaction(
        async (tx) => {
          // --------------------------------------------------
          // Re-check the order inside the transaction.
          //
          // This protects against two cancellation requests
          // arriving at nearly the same time.
          // --------------------------------------------------

          const currentOrder =
            await tx.order.findUnique({
              where: {
                id: order.id,
              },

              include: {
                payment: true,
              },
            });

          if (!currentOrder) {
            throw new Error(
              "ORDER_NOT_FOUND",
            );
          }

          // --------------------------------------------------
          // Re-check cancellation status
          // --------------------------------------------------

          if (
            !cancellableStatuses.includes(
              currentOrder.status,
            )
          ) {
            throw new Error(
              "ORDER_NOT_CANCELLABLE",
            );
          }

          // --------------------------------------------------
          // Re-check payment status
          // --------------------------------------------------

          if (
            currentOrder.payment?.status ===
            "PAID"
          ) {
            throw new Error(
              "ORDER_ALREADY_PAID",
            );
          }

          // --------------------------------------------------
          // Update order
          // --------------------------------------------------

          const updatedOrder =
            await tx.order.update({
              where: {
                id: currentOrder.id,
              },

              data: {
                status: "CANCELLED",
              },

              select: {
                id: true,
                orderNumber: true,
                status: true,
                totalAmount: true,
              },
            });

          // --------------------------------------------------
          // Cancel pending payment
          // --------------------------------------------------

          if (
            currentOrder.payment &&
            currentOrder.payment.status ===
              "PENDING"
          ) {
            await tx.payment.update({
              where: {
                id:
                  currentOrder.payment.id,
              },

              data: {
                status:
                  "CANCELLED",
              },
            });
          }

          return updatedOrder;
        },
        {
          maxWait: 10000,
          timeout: 20000,
        },
      );

    // ========================================================
    // Success
    // ========================================================

    return NextResponse.json({
      success: true,
      message:
        "Order cancelled successfully.",
      order: cancelledOrder,
    });
  } catch (error) {
    // ========================================================
    // Known business errors
    // ========================================================

    if (
      error instanceof Error
    ) {
      switch (error.message) {
        case "ORDER_NOT_FOUND":
          return NextResponse.json(
            {
              success: false,
              message:
                "Order not found",
            },
            { status: 404 },
          );

        case "ORDER_NOT_CANCELLABLE":
          return NextResponse.json(
            {
              success: false,
              message:
                "This order can no longer be cancelled.",
            },
            { status: 400 },
          );

        case "ORDER_ALREADY_PAID":
          return NextResponse.json(
            {
              success: false,
              message:
                "This order has already been paid. Cancellation is not available for paid orders.",
            },
            { status: 400 },
          );
      }
    }

    // ========================================================
    // Unexpected error
    // ========================================================

    console.error(
      "NEXORA order cancellation error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to cancel the order. Please try again.",
      },
      { status: 500 },
    );
  }
}