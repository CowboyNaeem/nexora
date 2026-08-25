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
    // Get logged-in user
    const cookieStore = await cookies();

    const token = cookieStore.get("nexora_session")?.value;

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

    // Get order ID from URL
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID is required",
        },
        { status: 400 }
      );
    }

    // Find order belonging to current user
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: session.userId,
      },

      include: {
        items: {
          orderBy: {
            createdAt: "asc",
          },
        },

        payment: true,

        shipment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("NEXORA order details error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load order",
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
    // =====================================================
    // Get logged-in user
    // =====================================================

    const cookieStore = await cookies();

    const token =
      cookieStore.get("nexora_session")?.value;

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

    // =====================================================
    // Get order ID
    // =====================================================

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID is required",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // Find order belonging to current user
    // =====================================================

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: session.userId,
      },
      include: {
        payment: true,
        shipment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    // =====================================================
    // Check whether order can be cancelled
    // =====================================================

    const cancellableStatuses = [
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
    ];

    if (!cancellableStatuses.includes(order.status)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This order can no longer be cancelled.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // Cancel order
    // =====================================================

    const cancelledOrder = await prisma.$transaction(
      async (tx) => {
        const updatedOrder = await tx.order.update({
          where: {
            id: order.id,
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

        // If payment is still pending,
        // cancel the payment as well.
        if (
          order.payment &&
          order.payment.status === "PENDING"
        ) {
          await tx.payment.update({
            where: {
              id: order.payment.id,
            },
            data: {
              status: "CANCELLED",
            },
          });
        }

        return updatedOrder;
      }
    );

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully.",
      order: cancelledOrder,
    });
  } catch (error) {
    console.error(
      "NEXORA order cancellation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to cancel the order. Please try again.",
      },
      { status: 500 }
    );
  }
}