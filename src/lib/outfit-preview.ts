import type { OutfitPayload } from "@/db/schema";
import {
  earFlagsForId,
  getCharacterRenderUrl,
  isSyntheticSlot,
} from "@/lib/maplestory";
import { SLOTS } from "@/types/maplestory";

interface PreviewOpts {
  /**
   * 0 = variable bounding box(隨裝備變大小,卡片並排會看起來大小不一)。
   * 1 = 固定 96×96 canvas(所有角色等大,適合縮圖網格與 carousel)。
   */
  renderMode?: 0 | 1;
  animated?: boolean;
  /** 蓋過 payload.stance — 用於詳情頁讓瀏覽者切換姿勢預覽 */
  stance?: string;
  /** mode=1 時的放大倍率(1=96×96, 2=192×192, 3=288×288) */
  resize?: number;
  /** Override maplestory.io 預設 padding。縮圖用較緊以減少留白 */
  padX?: number;
  padY?: number;
}

const buildUrl = (payload: OutfitPayload, opts: PreviewOpts) => {
  const skin = payload.slots.skin;
  const items = SLOTS.flatMap((slot) => {
    const ref = payload.slots[slot];
    if (!ref || isSyntheticSlot(slot)) return [];
    return [{ itemId: ref.id, region: ref.region, version: ref.version }];
  });
  return getCharacterRenderUrl(items, {
    skin: skin?.id,
    skinRegion: skin?.region,
    skinVersion: skin?.version,
    stance: opts.stance ?? payload.stance,
    frame: opts.animated ? "animated" : 0,
    renderMode: opts.renderMode,
    resize: opts.resize,
    padX: opts.padX,
    padY: opts.padY,
    ...earFlagsForId(payload.slots.ear?.id),
  });
};

/**
 * 卡片 / carousel 縮圖:固定 canvas、角色比例一致。
 * - resize 預設 2(192×192),大致對齊卡片實際顯示尺寸。
 * - pad 預設 padX=10 / padY=15(比 API 預設 30/50 緊一半多),減少角色周圍留白。
 *   極端尺寸的武器 / 帽子可能微切,點進詳情頁 (outfitFullUrl) 仍是完整的。
 */
export const outfitThumbnailUrl = (
  payload: OutfitPayload,
  opts?: { resize?: number; padX?: number; padY?: number },
): string =>
  buildUrl(payload, {
    renderMode: 1,
    resize: opts?.resize ?? 2,
    padX: opts?.padX ?? 10,
    padY: opts?.padY ?? 15,
  });

/** 詳情頁 / 高保真展示:variable bounding,大裝備不切 */
export const outfitFullUrl = (
  payload: OutfitPayload,
  opts?: { animated?: boolean; stance?: string },
): string =>
  buildUrl(payload, {
    renderMode: 0,
    animated: opts?.animated,
    stance: opts?.stance,
  });
