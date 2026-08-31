import "dotenv/config";

import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

/**
 * ============================================================
 * NEXORA DATABASE CONNECTION
 * ============================================================
 *
 * Production:
 *   Vercel Fluid Compute
 *        ↓
 *   pg Pool
 *        ↓
 *   PrismaPg
 *        ↓
 *   Supabase Transaction Pooler
 *
 * The pool is intentionally created once at module scope so
 * warm Vercel instances can reuse the database connection.
 *
 * attachDatabasePool() allows Vercel Fluid Compute to release
 * idle connections before an instance is suspended.
 * ============================================================
 */

const pool = new Pool({
  connectionString,

  /**
   * Supabase connections require SSL.
   *
   * The Supabase pooler provides the trusted endpoint, while
   * rejectUnauthorized:false keeps the current NEXORA setup
   * compatible with the hosted pooler certificate chain.
   */
  ssl: {
    rejectUnauthorized: false,
  },

  /**
   * Serverless-friendly pool size.
   *
   * Keeping this small prevents every Vercel instance from
   * opening a large number of PostgreSQL connections.
   */
  max: 1,

  /**
   * Close idle connections relatively quickly.
   * This is especially useful for serverless/Fluid instances.
   */
  idleTimeoutMillis: 5_000,

  /**
   * Don't allow a request to wait indefinitely for a connection.
   */
  connectionTimeoutMillis: 10_000,
});

/**
 * Let Vercel Fluid Compute manage the lifecycle of the pg pool.
 */
attachDatabasePool(pool);

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

/**
 * Reuse Prisma during local development so Next.js hot reload
 * does not continuously create new database clients.
 */
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}