/// <reference types="@cloudflare/workers-types" />
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

export type Db = ReturnType<typeof drizzle<typeof schema>>;

/**
 * 從 Cloudflare 的 request context 拿 D1 binding。本機 dev 走 OpenNext / wrangler、
 * prod 走 CF Workers,都靠 wrangler.toml 的 binding="DB" 對得上。
 */
export const getDb = (): Db => {
  const { env } = getCloudflareContext();
  return drizzle((env as { DB: D1Database }).DB, { schema });
};
