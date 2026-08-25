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

export async function createSession(
  userId: string,
  role: SessionPayload["role"]
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