import { sql } from "drizzle-orm";
import { users } from "@/db/schema";

// displayName overrides Discord name in public-facing queries.
export const authorNameSql = sql<string | null>`COALESCE(${users.displayName}, ${users.name})`;

// Drizzle returns Date; wire format uses epoch ms — apply at every server→client boundary.
export const toWireRow = <T extends { createdAt: Date; updatedAt: Date }>(
  r: T,
): Omit<T, "createdAt" | "updatedAt"> & { createdAt: number; updatedAt: number } => ({
  ...r,
  createdAt: r.createdAt.getTime(),
  updatedAt: r.updatedAt.getTime(),
});
