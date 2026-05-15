import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { DISPLAY_NAME_MAX_LEN } from "@/lib/limits";
import { validateUserText } from "@/lib/validators/text";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";


interface UpdateBody {
  displayName: string | null;
}

const validate = (raw: unknown): { value: string | null } | { error: string } => {
  if (raw === null) return { value: null };
  if (typeof raw !== "string") return { error: "displayName 需為字串或 null" };
  const result = validateUserText(raw, {
    maxLen: DISPLAY_NAME_MAX_LEN,
    label: "顯示名稱",
  });
  if (!result.ok) return { error: result.error };
  return { value: result.value };
};

const formatWait = (sec: number): string => {
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  if (days > 0) return `${days} 天 ${hours} 小時`;
  if (hours > 0) return `${hours} 小時`;
  return `${Math.max(1, Math.floor(sec / 60))} 分鐘`;
};

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("unauthorized", { status: 401 });
    }
    const userId = session.user.id;

    let body: UpdateBody;
    try {
      body = (await req.json()) as UpdateBody;
    } catch {
      return new NextResponse("invalid json", { status: 400 });
    }

    const result = validate(body.displayName);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const db = getDb();

    // 同名 PUT 不算修改,不消耗 rate limit 額度
    const [me] = await db
      .select({ displayName: users.displayName })
      .from(users)
      .where(eq(users.id, userId));
    if (me?.displayName === result.value) {
      return NextResponse.json({ displayName: result.value });
    }

    const rlBurst = await checkRateLimit(db, {
      scope: `user:${userId}:profile`,
      windowSec: 60,
      max: 5,
    });
    if (!rlBurst.ok) return rateLimitResponse(rlBurst.resetIn);

    // Fixed-window 近似:邊界 case 最多允許 6 次/14 天,trade-off 換 1 D1 op
    const rlWeekly = await checkRateLimit(db, {
      scope: `user:${userId}:display-name-weekly`,
      windowSec: 7 * 24 * 60 * 60,
      max: 3,
    });
    if (!rlWeekly.ok) {
      return NextResponse.json(
        {
          error: `顯示名稱每週最多修改 3 次,請於 ${formatWait(rlWeekly.resetIn)}後再試`,
          code: "display_name_weekly_limit",
        },
        {
          status: 429,
          headers: { "Retry-After": String(rlWeekly.resetIn) },
        },
      );
    }

    await db
      .update(users)
      .set({ displayName: result.value })
      .where(eq(users.id, userId));

    return NextResponse.json({ displayName: result.value });
  } catch (err) {
    console.error("[api/me/profile PUT]", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
