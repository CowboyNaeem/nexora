import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("nexora_session")?.value;

  if (!token) {
    return null;
  }

  const session = await verifySession(token);

  if (!session) {
    return null;
  }

  return session.userId;
}

/**
 * GET /api/auth/profile
 *
 * Returns the authenticated user's profile.
 */
export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
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
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message: "Account is not active",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Profile GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load profile",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/auth/profile
 *
 * Updates profile information and/or password.
 *
 * Body can contain:
 *
 * {
 *   name?: string,
 *   phone?: string,
 *   currentPassword?: string,
 *   newPassword?: string
 * }
 */
export async function PATCH(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    const name =
      typeof body?.name === "string"
        ? body.name.trim()
        : undefined;

    const phone =
      typeof body?.phone === "string"
        ? body.phone.trim()
        : undefined;

    const currentPassword =
      typeof body?.currentPassword === "string"
        ? body.currentPassword
        : undefined;

    const newPassword =
      typeof body?.newPassword === "string"
        ? body.newPassword
        : undefined;

    /*
     * Fetch the authenticated user.
     */
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        passwordHash: true,
        createdAt: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    if (existingUser.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message: "Account is not active",
        },
        { status: 403 },
      );
    }

    /*
     * Validate profile fields.
     */
    if (name !== undefined && name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Name must be at least 2 characters",
        },
        { status: 400 },
      );
    }

    if (phone !== undefined && phone.length > 30) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number is too long",
        },
        { status: 400 },
      );
    }

    /*
     * Password change.
     *
     * If a new password is supplied, the current password
     * must also be supplied and verified.
     */
    const changingPassword =
      typeof newPassword === "string" &&
      newPassword.length > 0;

    if (changingPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          {
            success: false,
            message: "Current password is required",
          },
          { status: 400 },
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          {
            success: false,
            message:
              "New password must be at least 6 characters",
          },
          { status: 400 },
        );
      }

      const passwordValid = await bcrypt.compare(
        currentPassword,
        existingUser.passwordHash,
      );

      if (!passwordValid) {
        return NextResponse.json(
          {
            success: false,
            message: "Current password is incorrect",
          },
          { status: 400 },
        );
      }
    }

    /*
     * Build update object.
     */
    const updateData: {
      name?: string;
      phone?: string | null;
      passwordHash?: string;
    } = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (phone !== undefined) {
      updateData.phone = phone || null;
    }

    if (changingPassword) {
      updateData.passwordHash = await bcrypt.hash(
        newPassword!,
        12,
      );
    }

    /*
     * Nothing to update.
     */
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No changes were provided",
        },
        { status: 400 },
      );
    }

    /*
     * Update the user.
     */
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: changingPassword
        ? "Profile and password updated successfully"
        : "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update profile",
      },
      { status: 500 },
    );
  }
}