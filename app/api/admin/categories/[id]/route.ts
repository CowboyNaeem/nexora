import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("nexora_session")?.value;

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      ),
    };
  }

  const session = await verifySession(token);

  if (!session) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      ),
    };
  }

  if (session.role !== "ADMIN") {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true,
    session,
  };
}

/* =========================================================
   PATCH — Update category
========================================================= */

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const auth = await requireAdmin();

    if (!auth.ok) {
      return auth.response;
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Category ID is required",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    const data: {
      name?: string;
      slug?: string;
      description?: string;
      isActive?: boolean;
    } = {};

    if (typeof body.name === "string") {
      const name = body.name.trim();

      if (!name) {
        return NextResponse.json(
          {
            success: false,
            message: "Category name cannot be empty",
          },
          { status: 400 }
        );
      }

      data.name = name;
    }

    if (typeof body.slug === "string") {
      const slug = slugify(body.slug);

      if (!slug) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid slug",
          },
          { status: 400 }
        );
      }

      data.slug = slug;
    }

    if (typeof body.description === "string") {
      data.description = body.description.trim();
    }

    if (typeof body.isActive === "boolean") {
      data.isActive = body.isActive;
    }

    if (data.name || data.slug) {
      const duplicate = await prisma.category.findFirst({
        where: {
          id: {
            not: id,
          },
          OR: [
            ...(data.name
              ? [
                  {
                    name: {
                      equals: data.name,
                      mode: "insensitive" as const,
                    },
                  },
                ]
              : []),
            ...(data.slug
              ? [
                  {
                    slug: data.slug,
                  },
                ]
              : []),
          ],
        },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Another category already uses this name or slug",
          },
          { status: 409 }
        );
      }
    }

    const category = await prisma.category.update({
      where: {
        id,
      },
      data,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("PATCH /api/admin/categories/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update category",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   DELETE — Delete category
========================================================= */

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const auth = await requireAdmin();

    if (!auth.ok) {
      return auth.response;
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Category ID is required",
        },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This category contains products and cannot be deleted. Deactivate it instead.",
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/categories/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete category",
      },
      { status: 500 }
    );
  }
}