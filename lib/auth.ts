import { SignJWT, jwtVerify } from "jose";

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("AUTH_SECRET is not configured");
}

const secretKey = new TextEncoder().encode(secret);

export type SessionPayload = {
  userId: string;
  role: "CUSTOMER" | "SELLER" | "ADMIN";
};

export type OrderTrackingPayload = {
  type: "ORDER_TRACKING";
  orderIds: string[];
};

/**
 * ============================================================
 * USER SESSION
 * ============================================================
 */

export async function createSession(
  userId: string,
  role: SessionPayload["role"],
) {
  return await new SignJWT({
    userId,
    role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);

    return payload as unknown as SessionPayload & {
      iat: number;
      exp: number;
    };
  } catch {
    return null;
  }
}

/**
 * ============================================================
 * ORDER TRACKING
 * ============================================================
 *
 * This token is created only after the customer successfully
 * proves ownership of an order using email + phone.
 *
 * It is intentionally separate from the normal login session.
 */

export async function createOrderTrackingToken(
  orderIds: string[],
) {
  return await new SignJWT({
    type: "ORDER_TRACKING",
    orderIds,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(secretKey);
}

export async function verifyOrderTrackingToken(
  token: string,
) {
  try {
    const { payload } = await jwtVerify(
      token,
      secretKey,
    );

    if (
      payload.type !== "ORDER_TRACKING" ||
      !Array.isArray(payload.orderIds)
    ) {
      return null;
    }

    const orderIds = payload.orderIds.filter(
      (id): id is string =>
        typeof id === "string" &&
        id.length > 0,
    );

    if (orderIds.length === 0) {
      return null;
    }

    return {
      type: "ORDER_TRACKING" as const,
      orderIds,
      iat:
        typeof payload.iat === "number"
          ? payload.iat
          : undefined,
      exp:
        typeof payload.exp === "number"
          ? payload.exp
          : undefined,
    };
  } catch {
    return null;
  }
}