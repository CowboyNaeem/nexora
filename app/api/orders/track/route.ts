import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { createOrderTrackingToken } from "@/lib/auth";

const ORDER_TRACKING_COOKIE =
  "nexora_order_tracking";

/**
 * ============================================================
 * POST /api/orders/track
 * ============================================================
 *
 * Finds orders using:
 *
 *   Email + Phone
 *
 * This works for:
 *
 *   - Guest customers
 *   - Registered customers
 *   - Registered customers who are currently signed out
 *
 * After successful verification, a short-lived signed
 * tracking cookie is created.
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const phone =
      typeof body?.phone === "string"
        ? body.phone.trim()
        : "";

    /**
     * ----------------------------------------------------------
     * Validation
     * ----------------------------------------------------------
     */

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email address is required.",
        },
        { status: 400 },
      );
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid email address.",
        },
        { status: 400 },
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Phone number is required.",
        },
        { status: 400 },
      );
    }

    /**
     * ----------------------------------------------------------
     * Find matching orders
     * ----------------------------------------------------------
     *
     * IMPORTANT:
     *
     * We intentionally do NOT require guestId here.
     *
     * This allows:
     *
     *   Guest order       → trackable
     *   Customer order    → trackable
     *
     * even when the customer is currently signed out.
     */

    const orders =
      await prisma.order.findMany({
        where: {
          shippingEmail: email,
          shippingPhone: phone,
        },

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          createdAt: true,

          shippingName: true,
          shippingPhone: true,
          shippingEmail: true,
          shippingDivision: true,
          shippingAddress: true,
          shippingCity: true,
          shippingPostalCode: true,
          shippingCountry: true,

          payment: {
            select: {
              method: true,
              status: true,
              provider: true,
              transactionId: true,
              paidAt: true,
            },
          },

          shipment: {
            select: {
              status: true,
              courier: true,
              trackingNumber: true,
              shippedAt: true,
              deliveredAt: true,
            },
          },

          items: {
            orderBy: {
              createdAt: "asc",
            },

            select: {
              id: true,
              productId: true,
              variantId: true,
              productName: true,
              sku: true,
              quantity: true,
              unitPrice: true,
              totalPrice: true,
            },
          },
        },
      });

    /**
     * ----------------------------------------------------------
     * No matching order
     * ----------------------------------------------------------
     */

    if (orders.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "We couldn't find an order with those details.",
        },
        { status: 404 },
      );
    }

    /**
     * ----------------------------------------------------------
     * Create signed tracking authorization
     * ----------------------------------------------------------
     *
     * Only the IDs of successfully matched orders are stored
     * inside the signed token.
     *
     * The token cannot be modified without AUTH_SECRET.
     */

    const trackingToken =
      await createOrderTrackingToken(
        orders.map((order) => order.id),
      );

    /**
     * ----------------------------------------------------------
     * Response
     * ----------------------------------------------------------
     */

    const response = NextResponse.json({
      success: true,
      orders,
      count: orders.length,
    });

    /**
     * ----------------------------------------------------------
     * Tracking cookie
     * ----------------------------------------------------------
     *
     * httpOnly:
     *   JavaScript cannot directly read the token.
     *
     * sameSite=lax:
     *   Helps protect against cross-site request abuse.
     *
     * secure:
     *   HTTPS in production.
     *
     * maxAge:
     *   30 minutes, matching the JWT lifetime.
     */

    response.cookies.set({
      name: ORDER_TRACKING_COOKIE,
      value: trackingToken,
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 30,
    });

    return response;
  } catch (error) {
    console.error(
      "NEXORA guest order tracking error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to track your order right now. Please try again.",
      },
      { status: 500 },
    );
  }
}