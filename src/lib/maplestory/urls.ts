import type { MaplestoryClientOptions, Slot } from "@/types/maplestory";
import { earFlagForId } from "./static-ears";

const DEFAULT_REGION = "TWMS";
const DEFAULT_VERSION = "256";
const DEFAULT_SKIN = 2000;

export const base = (opts?: MaplestoryClientOptions) => {
  const region = opts?.region ?? DEFAULT_REGION;
  const version = opts?.version ?? DEFAULT_VERSION;
  return `https://maplestory.io/api/${region}/${version}`;
};

export interface CharacterRenderItem {
  itemId: number;
  /** per-item region/version override;空白走全域 opts.region。讓 JMS-only 素材能跨服渲染 */
  region?: string;
  version?: string;
  animationName?: string;
}

// 30/50 sized for big weapons + tall hats; pads canvas so bottom-anchor keeps feet aligned across stances.
const DEFAULT_PAD_X = 30;
const DEFAULT_PAD_Y = 50;

/**
 * maplestory.io requires a stripped-bracket JSON array path; each item must carry region/version or it 500s.
 * Skin auto-includes body + head (skin+10000).
 */

export function getCharacterRenderUrl(
  items: ReadonlyArray<CharacterRenderItem>,
  opts?: MaplestoryClientOptions & {
    skin?: number;
    skinRegion?: string;
    skinVersion?: string;
    stance?: string;
    /** 數字為 frame index;`"animated"` 取得整段動畫 GIF */
    frame?: number | "animated";
    renderMode?: 0 | 1 | 2;
    showears?: boolean;
    showLefEars?: boolean;
    showHighLefEars?: boolean;
    padX?: number;
    padY?: number;
    /** 1 = 96×96 canvas (mode=1)、2/3 倍放大讓圖更貼近顯示尺寸 */
    resize?: number;
    /** true 把角色水平翻轉(預設角色面向右,flip 後面向左)*/
    flipX?: boolean;
  },
) {
  const skin = opts?.skin ?? DEFAULT_SKIN;
  const stance = opts?.stance ?? "stand1";
  const frame = opts?.frame ?? 0;
  const renderMode = opts?.renderMode ?? 0;
  const region = opts?.region ?? DEFAULT_REGION;
  const version = opts?.version ?? DEFAULT_VERSION;
  const skinRegion = opts?.skinRegion ?? region;
  const skinVersion = opts?.skinVersion ?? version;
  const padX = opts?.padX ?? DEFAULT_PAD_X;
  const padY = opts?.padY ?? DEFAULT_PAD_Y;
  const resize = opts?.resize ?? 1;

  const skinEntries =
    skin > 0
      ? [
          { itemId: skin, region: skinRegion, version: skinVersion },
          { itemId: skin + 10000, region: skinRegion, version: skinVersion },
        ]
      : [];
  const itemEntries = items.map((i) => ({
    itemId: i.itemId,
    region: i.region ?? region,
    version: i.version ?? version,
    ...(i.animationName ? { animationName: i.animationName } : {}),
  }));

  const allEntries = [...skinEntries, ...itemEntries];
  const json = JSON.stringify(allEntries);
  const payload = encodeURIComponent(json.slice(1, -1));

  const params = new URLSearchParams({
    showears: String(opts?.showears ?? false),
    showLefEars: String(opts?.showLefEars ?? false),
    showHighLefEars: String(opts?.showHighLefEars ?? false),
    resize: String(resize),
    flipX: String(opts?.flipX ?? false),
    renderMode: String(renderMode),
    padX: String(padX),
    padY: String(padY),
  });

  return `https://maplestory.io/api/character/${payload}/${stance}/${frame}?${params.toString()}`;
}

export function getItemIconUrl(id: number, opts?: MaplestoryClientOptions) {
  return `${base(opts)}/item/${id}/icon`;
}

// `/item/{bodyId}/icon` returns blank for most skins; `/character/{id}` returns a body sprite instead.
export function getSkinIconUrl(id: number, opts?: MaplestoryClientOptions) {
  return `${base(opts)}/character/${id}`;
}

// Ears aren't real items — sentinel ids map to character-render query flags.
export function getEarIconUrl(id: number, opts?: MaplestoryClientOptions) {
  const flag = earFlagForId(id);
  return `${base(opts)}/character/2000${flag ? `?${flag}=true` : ""}`;
}

export function getSlotIconUrl(
  slot: Slot,
  id: number,
  opts?: MaplestoryClientOptions,
) {
  if (slot === "skin") return getSkinIconUrl(id, opts);
  if (slot === "ear") return getEarIconUrl(id, opts);
  return getItemIconUrl(id, opts);
}
