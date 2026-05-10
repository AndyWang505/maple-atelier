import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export const runtime = "edge";

const ALLOWED_HOST = "maplestory.io";
const UPSTREAM_TIMEOUT_MS = 10_000;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB,角色 PNG / GIF 應遠低於此
const MAX_FILENAME_LEN = 80;

/**
 * Proxy maplestory.io 圖片並回 `Content-Disposition: attachment` 觸發下載。
 * 直接 client 端 fetch 會被 maplestory.io 缺 CORS 擋 → 同源 proxy 是繞過唯一乾淨解。
 *
 * 安全防線:
 *   1. 必須登入(防止匿名濫用我們當免費 maplestory.io 圖片代理)
 *   2. URL 要 parse 成功 + protocol https + host 嚴格白名單
 *   3. upstream 10s timeout(避免 hang 住 edge)
 *   4. Content-Length > 5MB 拒絕(避免帶寬轉嫁)
 *   5. filename 長度上限,encodeURIComponent 防 header injection
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  const target = req.nextUrl.searchParams.get("url");
  if (!target) return new NextResponse("missing url", { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new NextResponse("invalid url", { status: 400 });
  }
  if (parsed.protocol !== "https:" || parsed.hostname !== ALLOWED_HOST) {
    return new NextResponse("forbidden host", { status: 403 });
  }

  const rawFilename = req.nextUrl.searchParams.get("filename") ?? "character.png";
  const filename = rawFilename.slice(0, MAX_FILENAME_LEN);

  let upstream: Response;
  try {
    upstream = await fetch(parsed.toString(), {
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    return new NextResponse("upstream timeout", { status: 504 });
  }

  if (!upstream.ok) {
    return new NextResponse("upstream failed", { status: upstream.status });
  }

  const contentLength = Number(upstream.headers.get("Content-Length") ?? 0);
  if (contentLength > MAX_BYTES) {
    return new NextResponse("file too large", { status: 413 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "image/png",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
