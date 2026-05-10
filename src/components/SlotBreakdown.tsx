import type { OutfitPayload } from "@/db/schema";
import { getSlotIconUrl } from "@/lib/maplestory";
import { SLOT_LABELS, SLOT_SECTIONS } from "@/lib/slot-taxonomy";
import type { Slot } from "@/types/maplestory";

interface SlotBreakdownProps {
  payload: OutfitPayload;
  /** server-side 預先撈好的 item id → info map;沒命中的 fallback 顯示 #id 不掛標籤 */
  itemInfo: Record<number, { name: string; isCash: boolean }>;
}

/**
 * 詳情頁的「裝備明細」— 依 SLOT_SECTIONS 分外觀 / 裝備 / 坐騎,每個有穿戴的 slot 一張小卡。
 * 「裝備」與「坐騎」會顯示 一般 / 現金 標籤;外觀(髮 / 臉 / 膚 / 耳)不顯示(語意上沒有 cash 區別)。
 */
export default function SlotBreakdown({
  payload,
  itemInfo,
}: SlotBreakdownProps) {
  return (
    <div className="space-y-5">
      {SLOT_SECTIONS.map((section) => {
        const equipped = section.slots
          .map((slot) => ({ slot, ref: payload.slots[slot] }))
          .filter(
            (x): x is {
              slot: Slot;
              ref: { id: number; region?: string; version?: string; isCash?: boolean };
            } => x.ref !== undefined,
          );
        if (equipped.length === 0) return null;
        const showCashTag = section.id !== "appearance";
        return (
          <div key={section.id}>
            <h3 className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-2">
              {section.title}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {equipped.map(({ slot, ref }) => {
                const info = itemInfo[ref.id];
                const isCash = ref.isCash ?? info?.isCash;
                return (
                  <SlotCard
                    key={slot}
                    slot={slot}
                    itemId={ref.id}
                    region={ref.region}
                    version={ref.version}
                    name={info?.name}
                    isCash={isCash}
                    showCashTag={showCashTag}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface SlotCardProps {
  slot: Slot;
  itemId: number;
  region?: string;
  version?: string;
  name?: string;
  isCash?: boolean;
  showCashTag: boolean;
}

function SlotCard({
  slot,
  itemId,
  region,
  version,
  name,
  isCash,
  showCashTag,
}: SlotCardProps) {
  const iconUrl = getSlotIconUrl(slot, itemId, { region, version });
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg border border-zinc-200 bg-white">
      <div className="w-12 h-12 rounded bg-zinc-50 flex items-center justify-center shrink-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconUrl}
          alt={SLOT_LABELS[slot]}
          className="max-w-full max-h-full object-contain"
          style={{ imageRendering: "pixelated" }}
          loading="lazy"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-zinc-500">{SLOT_LABELS[slot]}</span>
          {showCashTag && isCash !== undefined && (
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded leading-none ${
                isCash
                  ? "bg-amber-100 text-amber-700"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {isCash ? "現金" : "一般"}
            </span>
          )}
        </div>
        <div className="text-sm font-semibold text-zinc-900 truncate">
          {name ?? `#${itemId}`}
        </div>
        <div className="text-xs text-zinc-400">#{itemId}</div>
      </div>
    </div>
  );
}
