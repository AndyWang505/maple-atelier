import { ImageResponse } from "next/og";

export const alt = "Maple Atelier — MapleStory Fashion Try-on";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 純英文 + emoji 避免 Satori 無 CJK 字型問題
export default async function Image() {
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
        {/* Top-left: deep purple */}
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
        {/* Bottom-right: violet */}
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
        {/* Center: warm amber halo behind logo */}
        <div
          style={{
            position: "absolute",
            top: 115,
            left: 400,
            width: 400,
            height: 400,
            background: "radial-gradient(circle, rgba(252,211,77,0.12) 0%, rgba(252,211,77,0.04) 50%, transparent 70%)",
          }}
        />
        {/* Top-right: cool indigo accent */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 420,
            height: 420,
            background: "radial-gradient(circle, rgba(79,70,229,0.3) 0%, rgba(79,70,229,0.08) 45%, transparent 70%)",
          }}
        />

        {/* Decorative crosses */}
        <div style={{ position: "absolute", top: 60, left: 80, display: "flex", fontSize: 24, color: "#c4b5fd", opacity: 0.18, fontWeight: 300 }}>+</div>
        <div style={{ position: "absolute", top: 80, right: 100, display: "flex", fontSize: 20, color: "#c4b5fd", opacity: 0.15, fontWeight: 300 }}>+</div>
        <div style={{ position: "absolute", bottom: 80, left: 100, display: "flex", fontSize: 20, color: "#c4b5fd", opacity: 0.15, fontWeight: 300 }}>+</div>
        <div style={{ position: "absolute", bottom: 60, right: 80, display: "flex", fontSize: 24, color: "#c4b5fd", opacity: 0.18, fontWeight: 300 }}>+</div>

        {/* Decorative circles */}
        <div style={{ position: "absolute", top: 160, left: 160, width: 12, height: 12, borderRadius: "50%", borderWidth: 1.5, borderStyle: "solid", borderColor: "rgba(167,139,250,0.45)" }} />
        <div style={{ position: "absolute", bottom: 160, right: 160, width: 12, height: 12, borderRadius: "50%", borderWidth: 1.5, borderStyle: "solid", borderColor: "rgba(167,139,250,0.45)" }} />
        <div style={{ position: "absolute", top: 280, right: 200, width: 8, height: 8, borderRadius: "50%", borderWidth: 1.5, borderStyle: "solid", borderColor: "rgba(167,139,250,0.35)" }} />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "0 80px",
          }}
        >
          <div style={{ fontSize: 96, lineHeight: 1, display: "flex", marginBottom: 8 }}>
            🍁
          </div>
          <div
            style={{
              fontSize: 144,
              fontWeight: 800,
              letterSpacing: "-3px",
              lineHeight: 1,
              display: "flex",
              backgroundImage:
                "linear-gradient(90deg, #c8423d 0%, #e87a4f 50%, #fcd34d 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Maple Atelier
          </div>
          <div
            style={{
              fontSize: 34,
              color: "#94a3b8",
              marginTop: 28,
              letterSpacing: "0.06em",
              display: "flex",
            }}
          >
            MapleStory Fashion · Try-on · Share
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
