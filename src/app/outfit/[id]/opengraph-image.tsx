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
      tags: outfits.tags,
    })
    .from(outfits)
    .where(eq(outfits.id, id));

  if (!row || !row.isPublic) return brandFallback();

  const characterUrl = outfitFullUrl(row.payload, { animated: false });
  const tags = Array.isArray(row.tags) ? row.tags.filter(Boolean).slice(0, 3) : [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "linear-gradient(135deg, #16122a 0%, #1f1747 60%, #16122a 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
          paddingLeft: 90,
        }}
      >
        {/* Ambient glows — radial-gradient avoids Satori blur-clips-to-square issue */}

        {/* Top-left: deep purple behind character */}
        <div
          style={{
            position: "absolute",
            top: -200,
            left: -160,
            width: 560,
            height: 560,
            background: "radial-gradient(circle, rgba(109,40,217,0.5) 0%, rgba(109,40,217,0.15) 45%, transparent 70%)",
          }}
        />
        {/* Top-right corner: cool indigo accent */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 420,
            height: 420,
            background: "radial-gradient(circle, rgba(79,70,229,0.35) 0%, rgba(79,70,229,0.1) 45%, transparent 70%)",
          }}
        />
        {/* Center-right: subtle glow behind title */}
        <div
          style={{
            position: "absolute",
            top: 100,
            right: 80,
            width: 460,
            height: 460,
            background: "radial-gradient(circle, rgba(124,58,237,0.22) 0%, rgba(124,58,237,0.06) 50%, transparent 70%)",
          }}
        />
        {/* Bottom-right: warm rose accent near upvotes */}
        <div
          style={{
            position: "absolute",
            bottom: -100,
            right: -80,
            width: 320,
            height: 320,
            background: "radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.06) 50%, transparent 70%)",
          }}
        />

        {/* Decorative crosses — kept away from UI content zones */}
        <div style={{ position: "absolute", top: 140, left: 720, display: "flex", fontSize: 22, color: "#c4b5fd", opacity: 0.2, fontWeight: 300 }}>+</div>
        <div style={{ position: "absolute", top: 180, right: 240, display: "flex", fontSize: 18, color: "#c4b5fd", opacity: 0.15, fontWeight: 300 }}>+</div>
        <div style={{ position: "absolute", top: 300, left: 440, display: "flex", fontSize: 16, color: "#c4b5fd", opacity: 0.12, fontWeight: 300 }}>+</div>
        <div style={{ position: "absolute", bottom: 80, left: 380, display: "flex", fontSize: 20, color: "#c4b5fd", opacity: 0.15, fontWeight: 300 }}>+</div>
        <div style={{ position: "absolute", top: 500, right: 260, display: "flex", fontSize: 18, color: "#c4b5fd", opacity: 0.13, fontWeight: 300 }}>+</div>

        {/* Decorative circles */}
        <div style={{ position: "absolute", top: 140, right: 380, width: 12, height: 12, borderRadius: "50%", borderWidth: 1.5, borderStyle: "solid", borderColor: "rgba(167,139,250,0.5)" }} />
        <div style={{ position: "absolute", bottom: 220, left: 460, width: 16, height: 16, borderRadius: "50%", borderWidth: 1.5, borderStyle: "solid", borderColor: "rgba(167,139,250,0.4)" }} />
        <div style={{ position: "absolute", top: 380, right: 200, width: 10, height: 10, borderRadius: "50%", borderWidth: 1.5, borderStyle: "solid", borderColor: "rgba(167,139,250,0.45)" }} />

        {/* Brand header — pill centered via justifyContent, OUTFIT·#ID absolute so it doesn't skew the center */}
        <div style={{ position: "absolute", top: 44, left: 0, width: 1200, height: 42, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.07)",
              borderRadius: 24,
              padding: "7px 18px",
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "rgba(167,139,250,0.2)",
            }}
          >
            <span style={{ display: "flex", fontSize: 18 }}>🍁</span>
            <span style={{ display: "flex", fontSize: 17, fontWeight: 600, color: "#ddd6fe", letterSpacing: "0.06em" }}>
              Maple Atelier
            </span>
          </div>
          <span style={{ position: "absolute", right: 72, display: "flex", fontSize: 15, color: "#6b7280", letterSpacing: "0.12em" }}>
            OUTFIT · #{id}
          </span>
        </div>

        {/* Left — character vertically centered */}
        <div
          style={{
            width: 460,
            height: "100%",
            display: "flex",
            position: "relative",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 145,
              left: 60,
              width: 340,
              height: 340,
              background: "radial-gradient(circle, rgba(139,92,246,0.55) 0%, rgba(139,92,246,0.15) 50%, transparent 70%)",
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={characterUrl}
            alt=""
            width={360}
            height={500}
            style={{ objectFit: "contain", imageRendering: "pixelated", position: "relative" }}
          />
        </div>

        {/* Right — content, vertically centered as a block */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "110px 72px 52px 32px",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <span style={{ display: "flex", fontSize: 15, color: "#a78bfa", letterSpacing: "0.18em", marginBottom: 14 }}>
            探索搭配
          </span>
          <span
            style={{
              display: "flex",
              fontSize: row.title.length > 14 ? 52 : 64,
              fontWeight: 800,
              color: "#f1f5f9",
              lineHeight: 1.15,
              letterSpacing: "-1px",
              maxWidth: 580,
            }}
          >
            {row.title}
          </span>

          {/* Tags + upvotes on same row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 28 }}>
            <div style={{ display: "flex", gap: 10 }}>
              {tags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    background: "rgba(139,92,246,0.18)",
                    borderRadius: 20,
                    padding: "6px 16px",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: "rgba(139,92,246,0.3)",
                  }}
                >
                  <span style={{ display: "flex", fontSize: 16, color: "#c4b5fd" }}>#{tag}</span>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(239, 68, 68, 0.12)",
                borderRadius: 20,
                padding: "8px 18px",
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "rgba(239,68,68,0.3)",
              }}
            >
              <span style={{ display: "flex", fontSize: 20, color: "#f87171" }}>❤</span>
              <span style={{ display: "flex", fontSize: 18, fontWeight: 700, color: "#f87171" }}>{row.upvotes}</span>
            </div>
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
            "linear-gradient(135deg, #16122a 0%, #1f1747 60%, #16122a 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -240,
            left: -240,
            width: 640,
            height: 640,
            background: "radial-gradient(circle, rgba(109,40,217,0.55) 0%, rgba(109,40,217,0.15) 45%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -260,
            right: -260,
            width: 680,
            height: 680,
            background: "radial-gradient(circle, rgba(139,92,246,0.45) 0%, rgba(139,92,246,0.12) 45%, transparent 70%)",
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
              fontSize: 100,
              fontWeight: 800,
              letterSpacing: "-3px",
              lineHeight: 1,
              marginTop: 24,
              display: "flex",
              color: "#ddd6fe",
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
