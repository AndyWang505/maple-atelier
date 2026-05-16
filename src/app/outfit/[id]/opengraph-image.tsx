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
          background: "linear-gradient(135deg, #fefce8 0%, #eff6ff 55%, #fdf4ff 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
          paddingLeft: 90,
        }}
      >
        {/* Ambient glows */}
        <div
          style={{
            position: "absolute",
            top: -200,
            left: -160,
            width: 560,
            height: 560,
            background: "radial-gradient(circle, rgba(196,181,253,0.45) 0%, rgba(196,181,253,0.12) 45%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 420,
            height: 420,
            background: "radial-gradient(circle, rgba(147,197,253,0.35) 0%, rgba(147,197,253,0.1) 45%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: 200,
            width: 400,
            height: 400,
            background: "radial-gradient(circle, rgba(253,230,138,0.4) 0%, rgba(253,230,138,0.1) 50%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: -60,
            width: 300,
            height: 300,
            background: "radial-gradient(circle, rgba(249,168,212,0.25) 0%, rgba(249,168,212,0.07) 50%, transparent 70%)",
          }}
        />

        {/* Decorative crosses */}
        <div style={{ position: "absolute", top: 140, left: 720, display: "flex", fontSize: 22, color: "#a78bfa", opacity: 0.35, fontWeight: 300 }}>+</div>
        <div style={{ position: "absolute", top: 180, right: 240, display: "flex", fontSize: 18, color: "#a78bfa", opacity: 0.3, fontWeight: 300 }}>+</div>
        <div style={{ position: "absolute", top: 300, left: 440, display: "flex", fontSize: 16, color: "#93c5fd", opacity: 0.4, fontWeight: 300 }}>+</div>
        <div style={{ position: "absolute", bottom: 80, left: 380, display: "flex", fontSize: 20, color: "#fbbf24", opacity: 0.35, fontWeight: 300 }}>+</div>
        <div style={{ position: "absolute", top: 500, right: 260, display: "flex", fontSize: 18, color: "#a78bfa", opacity: 0.3, fontWeight: 300 }}>+</div>

        {/* Decorative circles */}
        <div style={{ position: "absolute", top: 140, right: 380, width: 12, height: 12, borderRadius: "50%", borderWidth: 1.5, borderStyle: "solid", borderColor: "rgba(139,92,246,0.35)" }} />
        <div style={{ position: "absolute", bottom: 220, left: 460, width: 16, height: 16, borderRadius: "50%", borderWidth: 1.5, borderStyle: "solid", borderColor: "rgba(139,92,246,0.3)" }} />
        <div style={{ position: "absolute", top: 380, right: 200, width: 10, height: 10, borderRadius: "50%", borderWidth: 1.5, borderStyle: "solid", borderColor: "rgba(147,197,253,0.5)" }} />

        {/* Brand header */}
        <div style={{ position: "absolute", top: 44, left: 0, width: 1200, height: 42, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.7)",
              borderRadius: 24,
              padding: "7px 18px",
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "rgba(139,92,246,0.2)",
            }}
          >
            <span style={{ display: "flex", fontSize: 18 }}>🍁</span>
            <span style={{ display: "flex", fontSize: 17, fontWeight: 600, color: "#5b21b6", letterSpacing: "0.06em" }}>
              Maple Atelier
            </span>
          </div>
          <span style={{ position: "absolute", right: 72, display: "flex", fontSize: 15, color: "#9ca3af", letterSpacing: "0.12em" }}>
            OUTFIT · #{id}
          </span>
        </div>

        {/* Left — character */}
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
              background: "radial-gradient(circle, rgba(196,181,253,0.5) 0%, rgba(196,181,253,0.15) 50%, transparent 70%)",
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

        {/* Right — content */}
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
          <span style={{ display: "flex", fontSize: 15, color: "#7c3aed", letterSpacing: "0.18em", marginBottom: 14 }}>
            探索搭配
          </span>
          <span
            style={{
              display: "flex",
              fontSize: row.title.length > 14 ? 52 : 64,
              fontWeight: 800,
              color: "#1e1b4b",
              lineHeight: 1.15,
              letterSpacing: "-1px",
              maxWidth: 580,
            }}
          >
            {row.title}
          </span>

          {/* Tags + upvotes */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 28 }}>
            <div style={{ display: "flex", gap: 10 }}>
              {tags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    background: "rgba(139,92,246,0.1)",
                    borderRadius: 20,
                    padding: "6px 16px",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: "rgba(139,92,246,0.25)",
                  }}
                >
                  <span style={{ display: "flex", fontSize: 16, color: "#6d28d9" }}>#{tag}</span>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(239,68,68,0.08)",
                borderRadius: 20,
                padding: "8px 18px",
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "rgba(239,68,68,0.22)",
              }}
            >
              <span style={{ display: "flex", fontSize: 20, color: "#ef4444" }}>❤</span>
              <span style={{ display: "flex", fontSize: 18, fontWeight: 700, color: "#ef4444" }}>{row.upvotes}</span>
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
          background: "linear-gradient(135deg, #fefce8 0%, #eff6ff 55%, #fdf4ff 100%)",
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
            background: "radial-gradient(circle, rgba(196,181,253,0.45) 0%, rgba(196,181,253,0.12) 45%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -260,
            right: -260,
            width: 680,
            height: 680,
            background: "radial-gradient(circle, rgba(147,197,253,0.35) 0%, rgba(147,197,253,0.1) 45%, transparent 70%)",
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
              color: "#3b0764",
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
