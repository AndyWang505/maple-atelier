import { ImageResponse } from "next/og";

export const alt = "Maple Atelier — MapleStory Fashion Try-on";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 純英文 + emoji 避免 Satori 無 CJK 字型問題;設計對齊首頁 hero(暗底 + 楓紅 / 楓葉 / 琥珀色光暈 + dot pattern + 漸層字)。
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
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "rgba(252, 211, 77, 0.18)",
            filter: "blur(80px)",
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
              color: "#a1a1aa",
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
