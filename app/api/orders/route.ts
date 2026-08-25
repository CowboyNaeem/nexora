import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

type PaymentMethod =
  | "CASH_ON_DELIVERY"
  | "MOBILE_BANKING";

type MobileProvider =
  | "BKASH"
  | "NAGAD"
  | "ROCKET";

async function getUserId() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("nexora_session")?.value;

  if (!token) {
    return null;
  }

  const session = await verifySession(token);

  if (!session) {
    return null;
  }

  return session.userId;
}

function createOrderNumber() {
  const randomPart = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `NEX-${Date.now()}-${randomPart}`;
}

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

    const shippingName =
      typeof body.shippingName === "string"
        ? body.shippingName.trim()
        : "";

    const shippingPhone =
      typeof body.shippingPhone === "string"
        ? body.shippingPhone.trim()
        : "";

    const shippingDivision =
      typeof body.shippingDivision === "string"
        ? body.shippingDivision.trim()
        : "";

    const shippingCity =
      typeof body.shippingCity === "string"
        ? body.shippingCity.trim()
        : "";

    const shippingAddress =
      typeof body.shippingAddress === "string"
        ? body.shippingAddress.trim()
        : "";

    const shippingPostalCode =
      typeof body.shippingPostalCode === "string"
        ? body.shippingPostalCode.trim()
        : null;

    const paymentMethod =
      body.paymentMethod as PaymentMethod;

    const paymentProvider =
      body.paymentProvider as
        | MobileProvider
        | null;

    const transactionId =
      typeof body.transactionId === "string"
        ? body.transactionId.trim()
        : null;

    // =====================================================
    // Validation
    // =====================================================

    if (!shippingName) {
      return NextResponse.json(
        {
          success: false,
          message: "Shipping name is required.",
        },
        { status: 400 }
      );
    }

    if (!/^01[3-9]\d{8}$/.test(shippingPhone)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid Bangladesh phone number.",
        },
        { status: 400 }
      );
    }

    if (!shippingDivision) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Shipping division is required.",
        },
        { status: 400 }
      );
    }

    if (!shippingCity) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Shipping district is required.",
        },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Shipping address is required.",
        },
        { status: 400 }
      );
    }

    if (
      paymentMethod !== "CASH_ON_DELIVERY" &&
      paymentMethod !== "MOBILE_BANKING"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment method.",
        },
        { status: 400 }
      );
    }

    if (paymentMethod === "MOBILE_BANKING") {
      if (
        paymentProvider !== "BKASH" &&
        paymentProvider !== "NAGAD" &&
        paymentProvider !== "ROCKET"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Please select bKash, Nagad or Rocket.",
          },
          { status: 400 }
        );
      }

      if (!transactionId) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Mobile banking transaction ID is required.",
          },
          { status: 400 }
        );
      }
    }

    // =====================================================
    // Load cart
    // =====================================================

    const cart = await prisma.cart.findUnique({
      where: {
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                inventory: true,
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Your cart is empty.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // Calculate order
    // =====================================================

    let subtotal = 0;

    const orderItems: {
  productId: string;
  variantId: string | null;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}[] = [];

    for (const item of cart.items) {
      const product = item.product;

      if (product.status !== "ACTIVE") {
        return NextResponse.json(
          {
            success: false,
            message: `${product.name} is no longer available.`,
          },
          { status: 400 }
        );
      }

      let unitPrice = Number(product.price);
      let sku = product.sku;

      if (item.variant) {
        if (item.variant.price !== null) {
          unitPrice = Number(item.variant.price);
        }

        sku = item.variant.sku;

        if (item.variant.stock < item.quantity) {
          return NextResponse.json(
            {
              success: false,
              message:
                `Not enough stock available for ${product.name}.`,
            },
            { status: 400 }
          );
        }
      }

      if (product.inventory) {
        const availableStock =
          product.inventory.quantity -
          product.inventory.reserved;

        if (availableStock < item.quantity) {
          return NextResponse.json(
            {
              success: false,
              message:
                `Not enough stock available for ${product.name}.`,
            },
            { status: 400 }
          );
        }
      }

      const totalPrice =
        unitPrice * item.quantity;

      subtotal += totalPrice;

      orderItems.push({
        productId: product.id,
        variantId: item.variantId,
        productName: product.name,
        sku,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });
    }

    const shippingCost = 0;
    const discountAmount = 0;

    const totalAmount =
      subtotal +
      shippingCost -
      discountAmount;

    // =====================================================
    // Create everything using a Prisma transaction
    // with extended connection timeout
    // =====================================================

    const result = await prisma.$transaction(
      async (tx) => {
        const order = await tx.order.create({
          data: {
            userId,

            orderNumber: createOrderNumber(),

            status: "PENDING",

            subtotal,
            shippingCost,
            discountAmount,
            totalAmount,

            shippingName,
            shippingPhone,
            shippingDivision,
            shippingAddress,
            shippingCity,
            shippingPostalCode,
            shippingCountry: "Bangladesh",

            items: {
              create: orderItems,
            },
          },

          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
          },
        });
await tx.payment.create({
  data: {
    orderId: order.id,

    method: paymentMethod,

    provider:
      paymentMethod === "MOBILE_BANKING"
        ? paymentProvider
        : null,

    status:
      paymentMethod === "MOBILE_BANKING"
        ? "PAID"
        : "PENDING",

    amount: totalAmount,

    transactionId:
      paymentMethod === "MOBILE_BANKING"
        ? transactionId
        : null,

    paidAt:
      paymentMethod === "MOBILE_BANKING"
        ? new Date()
        : null,
  },
});
        
        await tx.shipment.create({
          data: {
            orderId: order.id,
            status: "PENDING",
          },
        });

        await tx.cartItem.deleteMany({
          where: {
            cartId: cart.id,
          },
        });

        return order;
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    );

    // =====================================================
    // Success
    // =====================================================

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully.",
        order: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "NEXORA order creation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to place your order. Please try again.",
      },
      { status: 500 }
    );
  }
}
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

    const orders = await prisma.order.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        payment: true,
        shipment: true,
        items: {
          select: {
            id: true,
            productName: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            sku: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("NEXORA orders GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load your orders.",
      },
      { status: 500 }
    );
  }
}
