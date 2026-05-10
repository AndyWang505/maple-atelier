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
    ...earFlagsForId(payload.slots.ear?.id),
  });
};

/** 卡片 / carousel 縮圖:固定 96×96 canvas,角色比例一致 */
export const outfitThumbnailUrl = (payload: OutfitPayload): string =>
  buildUrl(payload, { renderMode: 1 });

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
