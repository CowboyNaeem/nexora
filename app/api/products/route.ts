import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* =========================================================
   GET /api/products
   Fetch active products
========================================================= */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";

    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",

        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  brand: {
                    name: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
              ],
            }
          : {}),

        ...(category
          ? {
              category: {
                slug: category,
              },
            }
          : {}),
      },

      include: {
        category: true,
        brand: true,
        store: true,

        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },

        inventory: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("GET /api/products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      {
        status: 500,
      }
    );
  }
}
