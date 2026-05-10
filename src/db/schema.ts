import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  index,
} from "drizzle-orm/sqlite-core";
import type { AdapterAccountType } from "next-auth/adapters";
import type { Slot } from "@/types/maplestory";

// Auth.js Drizzle adapter — schema fixed by https://authjs.dev/getting-started/adapters/drizzle
export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  /** null = fallback to Discord name */
  displayName: text("display_name"),
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

// Stored payload only keeps IDs + region/version override; full CatalogItem fields are re-fetched from maplestory.io.
export interface OutfitSlotRef {
  id: number;
  region?: string;
  version?: string;
  /** Persisted so detail page can show 現金/一般 tag without re-fetching */
  isCash?: boolean;
}

export interface OutfitPayload {
  slots: Partial<Record<Slot, OutfitSlotRef>>;
  stance: string;
  animated: boolean;
}

export const outfits = sqliteTable(
  "outfits",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    payload: text("payload", { mode: "json" }).$type<OutfitPayload>().notNull(),
    tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
    isPublic: integer("is_public", { mode: "boolean" }).notNull().default(false),
    upvotes: integer("upvotes").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("idx_outfits_user_id").on(t.userId),
    index("idx_outfits_public_created").on(t.isPublic, t.createdAt),
  ],
);

// Dual-write with outfits.tags JSON: this table powers tag-filter + top-tag aggregation; JSON powers single-row reads.
export const outfitTags = sqliteTable(
  "outfit_tags",
  {
    outfitId: integer("outfit_id")
      .notNull()
      .references(() => outfits.id, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.outfitId, t.tag] }),
    index("idx_outfit_tags_tag").on(t.tag),
  ],
);

// Fixed-window counter: key = `<scope>:<bucket>`, atomic INCR per row, expires_at + probabilistic GC.
export const rateLimits = sqliteTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  expiresAt: integer("expires_at").notNull(),
});

// One row per (user, outfit) — existence = liked.
export const votes = sqliteTable(
  "votes",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    outfitId: integer("outfit_id")
      .notNull()
      .references(() => outfits.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.outfitId] }),
    // PK starts with userId so outfitId-only lookups (recount on vote) need their own index.
    index("idx_votes_outfit_id").on(t.outfitId),
  ],
);
