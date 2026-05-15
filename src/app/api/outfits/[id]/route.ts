import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { getDb } from "@/db/client";
import { outfits, outfitTags, type OutfitPayload } from "@/db/schema";
import { OUTFIT_LIMITS } from "@/lib/limits";
import { validateUserText } from "@/lib/validators/text";
import {
  isValidOutfitPayload,
  normalizeOutfitDescription,
  normalizeOutfitTags,
} from "@/lib/validators/outfit";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "edge";

interface UpdateBody {
  title?: string;
  description?: string | null;
  payload?: OutfitPayload;
  isPublic?: boolean;
  tags?: string[];
}

async function authorizeOwnership(
  id: number,
): Promise<{ userId: string } | NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("unauthorized", { status: 401 });
  }
  const db = getDb();
  const [row] = await db
    .select({ id: outfits.id })
    .from(outfits)
    .where(and(eq(outfits.id, id), eq(outfits.userId, session.user.id)));
  if (!row) {
    return new NextResponse("not found", { status: 404 });
  }
  return { userId: session.user.id };
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await ctx.params;
    const id = Number(rawId);
    if (!Number.isFinite(id)) return new NextResponse("bad id", { status: 400 });

    const db = getDb();
    const [row] = await db.select().from(outfits).where(eq(outfits.id, id));
    if (!row) return new NextResponse("not found", { status: 404 });

    if (!row.isPublic) {
      const session = await auth();
      if (session?.user?.id !== row.userId) {
        return new NextResponse("not found", { status: 404 });
      }
    }
    return NextResponse.json(row);
  } catch (err) {
    console.error("[api/outfits/[id] GET]", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await ctx.params;
    const id = Number(rawId);
    if (!Number.isFinite(id)) return new NextResponse("bad id", { status: 400 });

    const owner = await authorizeOwnership(id);
    if (owner instanceof NextResponse) return owner;

    const db = getDb();
    const rl = await checkRateLimit(db, {
      scope: `user:${owner.userId}:outfit-update`,
      windowSec: 60,
      max: 20,
    });
    if (!rl.ok) return rateLimitResponse(rl.resetIn);

    const body = (await req.json()) as UpdateBody;
    const patch: Partial<typeof outfits.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (body.title !== undefined) {
      const titleResult = validateUserText(body.title, {
        maxLen: OUTFIT_LIMITS.titleLen,
        label: "標題",
      });
      if (!titleResult.ok) {
        return NextResponse.json({ error: titleResult.error }, { status: 400 });
      }
      patch.title = titleResult.value;
    }
    if (body.payload !== undefined) {
      if (!isValidOutfitPayload(body.payload)) {
        return new NextResponse("invalid payload", { status: 400 });
      }
      patch.payload = body.payload;
    }
    if (body.description !== undefined) {
      const descResult = normalizeOutfitDescription(body.description);
      if ("error" in descResult) {
        return NextResponse.json({ error: descResult.error }, { status: 400 });
      }
      patch.description = descResult.value;
    }
    if (body.tags !== undefined) {
      const tags = normalizeOutfitTags(body.tags);
      if (tags.length === 0) {
        return NextResponse.json(
          { error: "請輸入至少 1 個標籤" },
          { status: 400 },
        );
      }
      patch.tags = tags;
    }
    if (body.isPublic !== undefined) patch.isPublic = body.isPublic;

    const [row] = await db
      .update(outfits)
      .set(patch)
      .where(eq(outfits.id, id))
      .returning();
    if (patch.tags !== undefined) {
      await db.delete(outfitTags).where(eq(outfitTags.outfitId, id));
      const newTags = patch.tags as string[];
      if (newTags.length > 0) {
        await db
          .insert(outfitTags)
          .values(newTags.map((tag) => ({ outfitId: id, tag })));
      }
    }
    return NextResponse.json(row);
  } catch (err) {
    console.error("[api/outfits/[id] PUT]", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await ctx.params;
    const id = Number(rawId);
    if (!Number.isFinite(id)) return new NextResponse("bad id", { status: 400 });

    const owner = await authorizeOwnership(id);
    if (owner instanceof NextResponse) return owner;

    const db = getDb();
    const rl = await checkRateLimit(db, {
      scope: `user:${owner.userId}:outfit-delete`,
      windowSec: 60,
      max: 20,
    });
    if (!rl.ok) return rateLimitResponse(rl.resetIn);

    await db.delete(outfits).where(eq(outfits.id, id));
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[api/outfits/[id] DELETE]", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
