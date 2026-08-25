import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      where: {
        status: "ACTIVE",
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    return NextResponse.json({
      success: true,
      stores,
    });
  } catch (error) {
    console.error("GET /api/stores error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch stores",
      },
      {
        status: 500,
      }
    );
  }
}