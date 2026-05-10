import { ImageResponse } from "next/og";

export const alt = "Maple Atelier — MapleStory Fashion Try-on";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * 全站預設 OG。沒指定路徑或匿名分享時走這張。
 * 純英文 + emoji 避免 Satori 的 CJK 字型問題;品牌色帶 + 楓葉視覺。
 */
export default async function Image() {
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
          padding: "0 80px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 200, lineHeight: 1, display: "flex" }}>🍁</div>
        <div
          style={{
            fontSize: 112,
            fontWeight: 800,
            color: "#c8423d",
            letterSpacing: "-2px",
            marginTop: 24,
            display: "flex",
          }}
        >
          Maple Atelier
        </div>
        <div
          style={{
            fontSize: 36,
            color: "#52525b",
            marginTop: 16,
            display: "flex",
          }}
        >
          MapleStory Fashion · Try-on · Share
        </div>
      </div>
    ),
    { ...size },
  );
}
