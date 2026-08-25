import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

function isAdmin(session: { role?: string } | null) {
  return !!session && session.role === "ADMIN";
}

async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("nexora_session")?.value;

  if (!token) return null;

  return verifySession(token);
}

// ============================================================
// GET - Admin User List
// ============================================================

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!isAdmin(session)) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const role = searchParams.get("role")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";

    const where = {
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                email: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                phone: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
      ...(role && ["CUSTOMER", "SELLER", "ADMIN"].includes(role)
        ? { role: role as "CUSTOMER" | "SELLER" | "ADMIN" }
        : {}),
      ...(status && ["ACTIVE", "SUSPENDED", "DELETED"].includes(status)
        ? {
            status: status as "ACTIVE" | "SUSPENDED" | "DELETED",
          }
        : {}),
    };

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { orders: true },
        },
        orders: {
          select: { totalAmount: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      orderCount: user._count.orders,
      totalSpent: user.orders.reduce(
        (sum, order) => sum + Number(order.totalAmount),
        0
      ),
    }));

    return NextResponse.json({
      success: true,
      count: formattedUsers.length,
      users: formattedUsers,
    });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// ============================================================
// POST - Create Admin
// ============================================================

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!isAdmin(session)) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    const password =
      typeof body.password === "string" ? body.password : "";

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email and password are required.",
        },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Name must contain at least 2 characters.",
        },
        { status: 400 }
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Admin account created successfully.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/users error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create admin account." },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH - Update User
// ============================================================

export async function PATCH(request: Request) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!isAdmin(session)) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, role, status } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const validRoles = ["CUSTOMER", "SELLER", "ADMIN"];
    const validStatuses = ["ACTIVE", "SUSPENDED", "DELETED"];

    if (role !== undefined && !validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, message: "Invalid user role" },
        { status: 400 }
      );
    }

    if (status !== undefined && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid user status" },
        { status: 400 }
      );
    }

    if (role === undefined && status === undefined) {
      return NextResponse.json(
        { success: false, message: "Nothing to update" },
        { status: 400 }
      );
    }

    if (
      id === session.userId &&
      role !== undefined &&
      role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot remove your own admin role.",
        },
        { status: 400 }
      );
    }

    if (
      id === session.userId &&
      status !== undefined &&
      status !== "ACTIVE"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot suspend or delete your own account.",
        },
        { status: 400 }
      );
    }

    const userToUpdate = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, status: true },
    });

    if (!userToUpdate) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    if (
      status !== undefined &&
      status !== "ACTIVE" &&
      userToUpdate.role === "ADMIN" &&
      userToUpdate.status === "ACTIVE"
    ) {
      const activeAdminCount = await prisma.user.count({
        where: {
          role: "ADMIN",
          status: "ACTIVE",
        },
      });

      if (activeAdminCount <= 1) {
        return NextResponse.json(
          {
            success: false,
            message: "At least one active admin account must remain.",
          },
          { status: 400 }
        );
      }
    }

    if (
      role !== undefined &&
      role !== "ADMIN" &&
      userToUpdate.role === "ADMIN" &&
      userToUpdate.status === "ACTIVE"
    ) {
      const activeAdminCount = await prisma.user.count({
        where: {
          role: "ADMIN",
          status: "ACTIVE",
        },
      });

      if (activeAdminCount <= 1) {
        return NextResponse.json(
          {
            success: false,
            message: "At least one active admin account must remain.",
          },
          { status: 400 }
        );
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(role !== undefined
          ? {
              role: role as "CUSTOMER" | "SELLER" | "ADMIN",
            }
          : {}),
        ...(status !== undefined
          ? {
              status: status as "ACTIVE" | "SUSPENDED" | "DELETED",
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully.",
      user,
    });
  } catch (error) {
    console.error("PATCH /api/admin/users error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 }
    );
  }
}
