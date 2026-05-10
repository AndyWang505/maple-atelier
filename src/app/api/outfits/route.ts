import { NextResponse, type NextRequest } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { getDb } from "@/db/client";
import { outfits, outfitTags, type OutfitPayload } from "@/db/schema";
import { MAX_OUTFITS_PER_USER, OUTFIT_LIMITS } from "@/lib/limits";
import { validateUserText } from "@/lib/validators/text";
import {
  isValidOutfitPayload,
  normalizeOutfitDescription,
  normalizeOutfitTags,
} from "@/lib/validators/outfit";
import { toWireRow } from "@/lib/queries/utils";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "edge";

interface CreateBody {
  title?: string;
  description?: string;
  payload?: OutfitPayload;
  isPublic?: boolean;
  tags?: string[];
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("unauthorized", { status: 401 });
  }
  const mine = req.nextUrl.searchParams.get("mine");
  if (mine !== "1") {
    return new NextResponse("only ?mine=1 supported", { status: 400 });
  }
  const db = getDb();
  const raw = await db
    .select()
    .from(outfits)
    .where(eq(outfits.userId, session.user.id))
    .orderBy(desc(outfits.updatedAt));
  return NextResponse.json(raw.map(toWireRow));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  const body = (await req.json()) as CreateBody;
  if (typeof body.title !== "string") {
    return NextResponse.json({ error: "標題不能為空" }, { status: 400 });
  }
  const titleResult = validateUserText(body.title, {
    maxLen: OUTFIT_LIMITS.titleLen,
    label: "標題",
  });
  if (!titleResult.ok) {
    return NextResponse.json({ error: titleResult.error }, { status: 400 });
  }
  if (!isValidOutfitPayload(body.payload)) {
    return new NextResponse("invalid payload", { status: 400 });
  }
  const descResult = normalizeOutfitDescription(body.description);
  if ("error" in descResult) {
    return NextResponse.json({ error: descResult.error }, { status: 400 });
  }
  const tags = normalizeOutfitTags(body.tags);
  if (tags.length === 0) {
    return NextResponse.json(
      { error: "請輸入至少 1 個標籤" },
      { status: 400 },
    );
  }

  const db = getDb();
  const rl = await checkRateLimit(db, {
    scope: `user:${session.user.id}:outfit-create`,
    windowSec: 60,
    max: 5,
  });
  if (!rl.ok) return rateLimitResponse(rl.resetIn);

  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(outfits)
    .where(eq(outfits.userId, session.user.id));
  if (Number(count) >= MAX_OUTFITS_PER_USER) {
    return NextResponse.json(
      {
        error: `已達上限,最多儲存 ${MAX_OUTFITS_PER_USER} 套搭配`,
        code: "outfit_limit_reached",
      },
      { status: 429 },
    );
  }

  const [row] = await db
    .insert(outfits)
    .values({
      userId: session.user.id,
      title: titleResult.value,
      description: descResult.value,
      payload: body.payload,
      tags,
      isPublic: body.isPublic ?? false,
    })
    .returning();
  // 寫入順序:outfits 先進,outfit_tags 跟上 — 失敗只影響 top-tags 統計,outfits.tags 讀路徑仍正確
  if (tags.length > 0) {
    await db
      .insert(outfitTags)
      .values(tags.map((tag) => ({ outfitId: row.id, tag })));
  }
  return NextResponse.json(row, { status: 201 });
}
