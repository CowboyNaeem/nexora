import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET() {
  try {
    // Get the current session
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

    // Admin-only access
    if (session.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      );
    }

    // Load all orders for the admin panel
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        items: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            productName: true,
            quantity: true,
            totalPrice: true,
          },
        },

        payment: {
          select: {
            method: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("NEXORA admin orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load admin orders",
      },
      { status: 500 }
    );
  }
}