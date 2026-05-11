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

// 私密 / 不存在的 outfit fallback 到泛用品牌圖,避免社群 bot 拿到 404。
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
            "linear-gradient(135deg, #0c0a09 0%, #18181b 50%, #0c0a09 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -160,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "rgba(200, 66, 61, 0.45)",
            filter: "blur(90px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -180,
            right: -180,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "rgba(232, 122, 79, 0.4)",
            filter: "blur(90px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.08,
            backgroundImage:
              "radial-gradient(circle, #ffffff 1.25px, transparent 1.25px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div
          style={{
            position: "relative",
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

        <div
          style={{
            position: "relative",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 80px 60px 40px",
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              display: "flex",
              backgroundImage:
                "linear-gradient(90deg, #c8423d 0%, #e87a4f 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            🍁 Maple Atelier
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#f4f4f5",
              marginTop: 28,
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
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
              color: "#a1a1aa",
              marginTop: 36,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span style={{ display: "flex", color: "#e87a4f" }}>❤ {row.upvotes}</span>
            <span style={{ display: "flex", color: "#52525b" }}>·</span>
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
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0c0a09 0%, #18181b 50%, #0c0a09 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -160,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "rgba(200, 66, 61, 0.5)",
            filter: "blur(90px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -180,
            right: -180,
            width: 560,
            height: 560,
            borderRadius: "50%",
            background: "rgba(232, 122, 79, 0.45)",
            filter: "blur(90px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.1,
            backgroundImage:
              "radial-gradient(circle, #ffffff 1.25px, transparent 1.25px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 144, display: "flex" }}>🍁</div>
          <div
            style={{
              fontSize: 120,
              fontWeight: 800,
              letterSpacing: "-3px",
              lineHeight: 1,
              marginTop: 24,
              display: "flex",
              backgroundImage:
                "linear-gradient(90deg, #c8423d 0%, #e87a4f 50%, #fcd34d 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Maple Atelier
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
