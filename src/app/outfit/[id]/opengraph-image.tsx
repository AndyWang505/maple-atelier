import { ImageResponse } from "next/og";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { outfits } from "@/db/schema";
import { outfitFullUrl } from "@/lib/outfit-preview";

export const alt = "Outfit on Maple Atelier";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ id: string }>;
}

/**
 * 單一搭配的動態 OG。社群分享時長這樣:
 *   左:角色預覽圖(maplestory.io 渲染,server-fetch 編進 PNG)
 *   右:標題 / 推數 / 品牌 watermark(英文 + 數字 + emoji,避免 CJK 字型問題)
 *
 * 私密 / 不存在的 outfit fallback 到泛用品牌圖,避免社群 bot 拿到 404。
 */
export default async function Image({ params }: ImageProps) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isFinite(id)) return brandFallback();

  const db = getDb();
  const [row] = await db
    .select({
      title: outfits.title,
      payload: outfits.payload,
      upvotes: outfits.upvotes,
      isPublic: outfits.isPublic,
    })
    .from(outfits)
    .where(eq(outfits.id, id));

  if (!row || !row.isPublic) return brandFallback();

  const characterUrl = outfitFullUrl(row.payload, { animated: false });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "linear-gradient(135deg, rgba(254,215,170,0.5) 0%, #ffffff 50%, rgba(252,165,165,0.4) 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* 左半:角色 */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 60,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={characterUrl}
            alt=""
            width={400}
            height={500}
            style={{
              objectFit: "contain",
              imageRendering: "pixelated",
            }}
          />
        </div>

        {/* 右半:資訊 */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 80px 60px 40px",
          }}
        >
          <div style={{ fontSize: 28, color: "#c8423d", fontWeight: 700, display: "flex" }}>
            🍁 Maple Atelier
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: "#1a1a1a",
              marginTop: 24,
              lineHeight: 1.15,
              display: "flex",
              maxWidth: 520,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {row.title}
          </div>
          <div
            style={{
              fontSize: 36,
              color: "#52525b",
              marginTop: 32,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span style={{ display: "flex" }}>❤ {row.upvotes}</span>
            <span style={{ display: "flex", color: "#a1a1aa" }}>·</span>
            <span style={{ display: "flex" }}>#{id}</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

function brandFallback() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(180deg, rgba(254,215,170,0.55) 0%, #ffffff 35%, #ffffff 65%, rgba(252,165,165,0.45) 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 160, display: "flex" }}>🍁</div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: "#c8423d",
            marginTop: 24,
            display: "flex",
          }}
        >
          Maple Atelier
        </div>
      </div>
    ),
    { ...size },
  );
}
