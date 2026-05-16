import type { PublicOutfitRow } from "@/lib/api/types";
import ExploreOutfitCard from "./ExploreOutfitCard";
import PodiumConfetti from "./PodiumConfetti";

interface WeeklyPodiumProps {
  outfits: PublicOutfitRow[];
  currentUserId: string | null;
}

const TITLE_STYLE = {
  color: "#FFFFFF",
  textShadow: "0 1px 3px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.6)",
} as const;

const RANK_LABEL_COLOR: Record<1 | 2 | 3, string> = {
  1: "#F5C518",
  2: "#C0C8D2",
  3: "#C8845A",
};

// ── Desktop layout constants ──────────────────────────────────────────────────

interface PodiumLayout {
  centerX: string;
  bottom: string;
  labelBottom: string;
  labelText: string;
  labelSize: string;
  zCard: number;
}

const CARD_W = 180;

// 位置依 image 實測:image 1440×532, 三 stage top y(from top)={66, 156, 175}
// image 佔 container 高的比例:container 3:2, image 1440:532 → 55.4%
// bottom = (1 - y/532) × 55.4% - 3%(讓卡片底邊壓進 stage 頂面)
//   rank1 → (1 - 66/532)  × 55.4% - 3% ≈ 45.5%
//   rank2 → (1 - 156/532) × 55.4% - 3% ≈ 36.2%
//   rank3 → (1 - 175/532) × 55.4% - 3% ≈ 34.2%
const LAYOUT: Record<1 | 2 | 3, PodiumLayout> = {
  1: { centerX: "50%",   bottom: "45.5%", labelBottom: "28%", labelText: "1st", labelSize: "text-3xl sm:text-4xl", zCard: 30 },
  2: { centerX: "23.7%", bottom: "36.2%", labelBottom: "25%", labelText: "2nd", labelSize: "text-2xl sm:text-3xl", zCard: 20 },
  3: { centerX: "76.3%", bottom: "34.2%", labelBottom: "24%", labelText: "3rd", labelSize: "text-2xl sm:text-3xl", zCard: 20 },
};

// ── Component ─────────────────────────────────────────────────────────────────

const FALLBACK_QUOTE = "「很難說....因為已經這樣很久了....也可能無法回到一開始的樣子」";

function pickQuote(outfits: PublicOutfitRow[]): string {
  const candidates = outfits
    .map((o) => o.description?.trim())
    .filter((d): d is string => !!d);
  if (candidates.length === 0) return FALLBACK_QUOTE;
  const text = candidates[Math.floor(Math.random() * candidates.length)];
  return `「${text.length > 24 ? text.slice(0, 24) + "…" : text}」`;
}

export default function WeeklyPodium({ outfits, currentUserId }: WeeklyPodiumProps) {
  if (outfits.length < 3) return null;
  const [first, second, third] = outfits;
  const quote = pickQuote(outfits);

  return (
    <section
      className="relative overflow-hidden rounded-3xl ring-2 ring-white/85 mb-8 sm:mb-12"
      style={{
        boxShadow:
          "inset 0 1px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 0 rgba(255, 255, 255, 0.5)",
      }}
    >
      {/* Shared background layers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "url('/Map_El_Nath_General_Store.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(10px) saturate(1.05)",
          transform: "scale(1.06)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(228, 222, 212, 0.35) 0%, rgba(235, 230, 222, 0.20) 38%, rgba(230, 224, 214, 0.30) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-3 inset-x-12 h-px bg-gradient-to-r from-transparent via-white/95 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-5 inset-x-16 h-px bg-gradient-to-r from-transparent via-white/75 to-transparent"
      />
      <div className="hidden md:block absolute inset-0 pointer-events-none"><PodiumConfetti /></div>

      {/* Mobile / tablet: 3-column cards */}
      <div className="relative z-10 md:hidden px-3 pt-4 pb-5">
        <h2
          className="text-sm font-black italic tracking-tight text-center mb-3"
          style={TITLE_STYLE}
        >
          本期榮譽榜
        </h2>
        <div className="flex gap-1">
          {([second, first, third] as const).map((outfit, i) => {
            const rank = ([2, 1, 3] as const)[i];
            return (
              <div key={outfit.id} className="flex-1 flex flex-col gap-1 min-w-0">
                <span
                  className="text-center text-sm font-black italic leading-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
                  style={{ color: RANK_LABEL_COLOR[rank] }}
                >
                  {LAYOUT[rank].labelText}
                </span>
                <ExploreOutfitCard
                  outfit={outfit}
                  currentUserId={currentUserId}
                  rank={rank}
                  compact
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop: podium image with absolutely positioned cards */}
      <div className="relative z-10 hidden md:block mx-auto w-full max-w-4xl px-4 pt-4 pb-6">
        <div className="relative w-full" style={{ aspectRatio: "3 / 2" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/podium.webp"
            alt=""
            className="absolute inset-0 w-full h-full select-none"
            style={{ objectFit: "contain", objectPosition: "bottom" }}
            draggable={false}
          />
          <CardOnPodium outfit={second} rank={2} currentUserId={currentUserId} />
          <CardOnPodium outfit={first}  rank={1} currentUserId={currentUserId} />
          <CardOnPodium outfit={third}  rank={3} currentUserId={currentUserId} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/maple-leaf.svg"
            alt=""
            aria-hidden
            className="absolute pointer-events-none select-none"
            style={{
              left: LAYOUT[1].centerX,
              bottom: "22%",
              width: 100,
              height: 100,
              transform: "translateX(-50%)",
              zIndex: 8,
              opacity: 0.82,
              filter: "sepia(1) saturate(4) hue-rotate(5deg) brightness(1.05)",
            }}
          />
          <StageLabel rank={1} />
          <StageLabel rank={2} />
          <StageLabel rank={3} />
          <div className="absolute z-10 bottom-[7%] left-1/2 -translate-x-1/2 flex items-center gap-3 sm:gap-5 whitespace-nowrap pointer-events-none">
            <h2
              className="text-base sm:text-xl md:text-2xl font-black italic tracking-tight leading-none"
              style={TITLE_STYLE}
            >
              本期人氣榜
            </h2>
            <div className="h-4 sm:h-5 w-px bg-white/50" />
            <p
              className="text-sm sm:text-base font-semibold tracking-tight"
              style={{
                color: "rgba(255,255,255,0.85)",
                textShadow: "0 1px 3px rgba(0,0,0,0.8)",
              }}
            >
              {quote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Desktop helpers ───────────────────────────────────────────────────────────

function CardOnPodium({
  outfit,
  rank,
  currentUserId,
}: {
  outfit: PublicOutfitRow;
  rank: 1 | 2 | 3;
  currentUserId: string | null;
}) {
  const layout = LAYOUT[rank];
  return (
    <div
      className="absolute"
      style={{
        left: layout.centerX,
        bottom: layout.bottom,
        width: CARD_W,
        transform: "translateX(-50%)",
        zIndex: layout.zCard,
      }}
    >
      <ExploreOutfitCard outfit={outfit} currentUserId={currentUserId} rank={rank} />
    </div>
  );
}

function StageLabel({ rank }: { rank: 1 | 2 | 3 }) {
  const layout = LAYOUT[rank];
  return (
    <span
      aria-hidden
      className={`absolute z-10 pointer-events-none text-white font-black italic ${layout.labelSize} leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)]`}
      style={{
        left: layout.centerX,
        bottom: layout.labelBottom,
        transform: "translateX(-50%)",
      }}
    >
      {layout.labelText}
    </span>
  );
}
