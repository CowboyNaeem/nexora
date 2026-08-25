import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

/* =========================================================
   TYPES
========================================================= */

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

type ShipmentStatus =
  | "PENDING"
  | "PACKED"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "RETURNED";

/* =========================================================
   VALID STATUS VALUES
========================================================= */

const ORDER_STATUSES: readonly OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const SHIPMENT_STATUSES: readonly ShipmentStatus[] = [
  "PENDING",
  "PACKED",
  "SHIPPED",
  "IN_TRANSIT",
  "DELIVERED",
  "RETURNED",
];

/* =========================================================
   HELPERS
========================================================= */

function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    ORDER_STATUSES.includes(value as OrderStatus)
  );
}

function isShipmentStatus(
  value: unknown
): value is ShipmentStatus {
  return (
    typeof value === "string" &&
    SHIPMENT_STATUSES.includes(value as ShipmentStatus)
  );
}

/* =========================================================
   GET — ADMIN ORDER DETAILS
========================================================= */

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    /* -------------------------------------------------------
       Authentication
    ------------------------------------------------------- */

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

    /* -------------------------------------------------------
       Admin authorization
    ------------------------------------------------------- */

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      );
    }

    /* -------------------------------------------------------
       Get order ID
    ------------------------------------------------------- */

    const { id } = await context.params;

    if (!id?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID is required",
        },
        { status: 400 }
      );
    }

    /* -------------------------------------------------------
       Load complete order
       
       Important:
       OrderItem → Product → ProductImage
       
       This allows the admin order page to display the
       actual product image.
    ------------------------------------------------------- */

    const order = await prisma.order.findUnique({
      where: {
        id,
      },

      include: {
        /* ---------------------------------------------------
           Customer
        --------------------------------------------------- */

        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },

        /* ---------------------------------------------------
           Order items + product images
        --------------------------------------------------- */

        items: {
          orderBy: {
            createdAt: "asc",
          },

          include: {
            product: {
              select: {
                id: true,
                name: true,

                images: {
                  orderBy: {
                    sortOrder: "asc",
                  },

                  select: {
                    id: true,
                    url: true,
                    altText: true,
                    sortOrder: true,
                    isPrimary: true,
                  },
                },
              },
            },
          },
        },

        /* ---------------------------------------------------
           Payment
        --------------------------------------------------- */

        payment: true,

        /* ---------------------------------------------------
           Shipment
        --------------------------------------------------- */

        shipment: true,
      },
    });

    /* -------------------------------------------------------
       Order not found
    ------------------------------------------------------- */

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    /* -------------------------------------------------------
       Prepare order items
       
       Image priority:
       1. Primary product image
       2. First product image
       3. null
    ------------------------------------------------------- */

    const items = order.items.map((item) => {
      const primaryImage =
        item.product.images.find(
          (image) => image.isPrimary
        ) ??
        item.product.images[0] ??
        null;

      return {
        ...item,

        imageUrl: primaryImage?.url ?? null,

        imageAlt:
          primaryImage?.altText ??
          item.product.name ??
          item.productName,
      };
    });

    /* -------------------------------------------------------
       Return clean response
    ------------------------------------------------------- */

    return NextResponse.json({
      success: true,

      order: {
        ...order,
        items,
      },
    });
  } catch (error) {
    console.error(
      "NEXORA admin order details error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load order",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   PATCH — ADMIN ORDER + SHIPMENT UPDATE
========================================================= */

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    /* -------------------------------------------------------
       Authentication
    ------------------------------------------------------- */

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

    /* -------------------------------------------------------
       Admin authorization
    ------------------------------------------------------- */

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      );
    }

    /* -------------------------------------------------------
       Get order ID
    ------------------------------------------------------- */

    const { id } = await context.params;

    if (!id?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID is required",
        },
        { status: 400 }
      );
    }

    /* -------------------------------------------------------
       Parse request body safely
    ------------------------------------------------------- */

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body",
        },
        { status: 400 }
      );
    }

    /* -------------------------------------------------------
       Extract order status
    ------------------------------------------------------- */

    const status =
      typeof body.status === "string"
        ? body.status
        : undefined;

    /* -------------------------------------------------------
       Extract shipment status
    ------------------------------------------------------- */

    const shipmentStatus =
      typeof body.shipmentStatus === "string"
        ? body.shipmentStatus
        : undefined;

    /* -------------------------------------------------------
       Extract courier
    ------------------------------------------------------- */

    const courier =
      body.courier === null
        ? null
        : typeof body.courier === "string"
          ? body.courier.trim()
          : undefined;

    /* -------------------------------------------------------
       Extract tracking number
    ------------------------------------------------------- */

    const trackingNumber =
      body.trackingNumber === null
        ? null
        : typeof body.trackingNumber === "string"
          ? body.trackingNumber.trim()
          : undefined;

    /* -------------------------------------------------------
       Validate update payload
    ------------------------------------------------------- */

    if (
      status === undefined &&
      shipmentStatus === undefined &&
      courier === undefined &&
      trackingNumber === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "No update data provided",
        },
        { status: 400 }
      );
    }

    /* -------------------------------------------------------
       Validate order status
    ------------------------------------------------------- */

    if (
      status !== undefined &&
      !isOrderStatus(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order status",
        },
        { status: 400 }
      );
    }

    /* -------------------------------------------------------
       Validate shipment status
    ------------------------------------------------------- */

    if (
      shipmentStatus !== undefined &&
      !isShipmentStatus(shipmentStatus)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid shipment status",
        },
        { status: 400 }
      );
    }

    /* -------------------------------------------------------
       Find existing order
    ------------------------------------------------------- */

    const existingOrder =
      await prisma.order.findUnique({
        where: {
          id,
        },

        include: {
          shipment: true,
        },
      });

    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    /* -------------------------------------------------------
       Determine whether shipment needs updating
    ------------------------------------------------------- */

    const shipmentNeedsUpdate =
      shipmentStatus !== undefined ||
      courier !== undefined ||
      trackingNumber !== undefined;

    /* -------------------------------------------------------
       Transaction
    ------------------------------------------------------- */

    const result = await prisma.$transaction(
      async (tx) => {
        /* ---------------------------------------------------
           Update order status
        --------------------------------------------------- */

        const updatedOrder =
          status !== undefined
            ? await tx.order.update({
                where: {
                  id,
                },

                data: {
                  status,
                },
              })
            : existingOrder;

        /* ---------------------------------------------------
           Existing shipment
        --------------------------------------------------- */

        let updatedShipment =
          existingOrder.shipment;

        if (shipmentNeedsUpdate) {
          const shipmentData: {
            status?: ShipmentStatus;
            courier?: string | null;
            trackingNumber?: string | null;
            shippedAt?: Date | null;
            deliveredAt?: Date | null;
          } = {};

          /* -------------------------------------------------
             Shipment status
          ------------------------------------------------- */

          if (shipmentStatus !== undefined) {
            shipmentData.status =
              shipmentStatus;

            /* -----------------------------------------------
               Record shipping time automatically
            ----------------------------------------------- */

            if (
              shipmentStatus === "SHIPPED" ||
              shipmentStatus === "IN_TRANSIT"
            ) {
              shipmentData.shippedAt =
                existingOrder.shipment
                  ?.shippedAt ??
                new Date();
            }

            /* -----------------------------------------------
               Record delivery time automatically
            ----------------------------------------------- */

            if (
              shipmentStatus === "DELIVERED"
            ) {
              shipmentData.shippedAt =
                existingOrder.shipment
                  ?.shippedAt ??
                new Date();

              shipmentData.deliveredAt =
                existingOrder.shipment
                  ?.deliveredAt ??
                new Date();
            }
          }

          /* -------------------------------------------------
             Courier
          ------------------------------------------------- */

          if (courier !== undefined) {
            shipmentData.courier =
              courier || null;
          }

          /* -------------------------------------------------
             Tracking number
          ------------------------------------------------- */

          if (
            trackingNumber !== undefined
          ) {
            shipmentData.trackingNumber =
              trackingNumber || null;
          }

          /* -------------------------------------------------
             Update existing shipment
          ------------------------------------------------- */

          if (existingOrder.shipment) {
            updatedShipment =
              await tx.shipment.update({
                where: {
                  orderId: id,
                },

                data: shipmentData,
              });
          }

          /* -------------------------------------------------
             Create shipment if none exists
          ------------------------------------------------- */

          else {
            const initialShipmentStatus =
              shipmentStatus ??
              "PENDING";

            const shouldSetShippedAt =
              initialShipmentStatus ===
                "SHIPPED" ||
              initialShipmentStatus ===
                "IN_TRANSIT" ||
              initialShipmentStatus ===
                "DELIVERED";

            const shouldSetDeliveredAt =
              initialShipmentStatus ===
              "DELIVERED";

            updatedShipment =
              await tx.shipment.create({
                data: {
                  orderId: id,

                  status:
                    initialShipmentStatus,

                  courier:
                    courier || null,

                  trackingNumber:
                    trackingNumber || null,

                  shippedAt:
                    shouldSetShippedAt
                      ? new Date()
                      : null,

                  deliveredAt:
                    shouldSetDeliveredAt
                      ? new Date()
                      : null,
                },
              });
          }
        }

        return {
          order: updatedOrder,
          shipment: updatedShipment,
        };
      }
    );

    /* -------------------------------------------------------
       Success
    ------------------------------------------------------- */

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order: result.order,
      shipment: result.shipment,
    });
  } catch (error) {
    console.error(
      "NEXORA admin order update error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update order",
      },
      { status: 500 }
    );
  }
}