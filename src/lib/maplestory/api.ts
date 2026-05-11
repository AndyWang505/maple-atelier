import type {
  CatalogItem,
  MaplestoryClientOptions,
  RegionInfo,
  Slot,
} from "@/types/maplestory";
import { SLOT_FILTERS, buildItemUrl } from "./filters";
import { STATIC_EAR_ITEMS } from "./static-ears";
import { STATIC_ITEMS_BY_SLOT } from "./static-items";
import { STATIC_SKIN_ITEMS } from "./static-skins";

interface RawItem {
  id: number;
  name: string;
  isCash?: boolean;
  requiredGender?: number;
}

export interface ItemInfo {
  name: string;
  isCash: boolean;
}

/**
 * 撈單一 item 的基本 metadata(name + isCash)。
 * 用於 detail 頁的裝備明細顯示。失敗 / timeout 時回 null,呼叫端 fallback 顯示 #id 不掛 cash 標籤。
 */
export async function fetchSlotItemInfo(
  slot: Slot,
  id: number,
  opts?: MaplestoryClientOptions,
): Promise<ItemInfo | null> {
  if (slot === "skin") {
    const found = STATIC_SKIN_ITEMS.find((s) => s.id === id);
    return found ? { name: found.name, isCash: false } : null;
  }
  if (slot === "ear") {
    const found = STATIC_EAR_ITEMS.find((e) => e.id === id);
    return found ? { name: found.name, isCash: false } : null;
  }
  return fetchItemInfo(id, opts);
}

export async function fetchItemInfo(
  id: number,
  opts?: MaplestoryClientOptions,
): Promise<ItemInfo | null> {
  try {
    const region = opts?.region ?? "TWMS";
    const version = opts?.version ?? "256";
    const r = await fetch(
      `https://maplestory.io/api/${region}/${version}/item/${id}`,
      {
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!r.ok) return null;
    const data = (await r.json()) as {
      description?: { name?: string } | null;
      name?: string;
      isCash?: boolean;
    };
    const name = data.description?.name ?? data.name;
    if (!name) return null;
    return { name, isCash: !!data.isCash };
  } catch {
    return null;
  }
}

export async function fetchItemsBySlot(
  slot: Slot,
  opts?: MaplestoryClientOptions,
): Promise<CatalogItem[]> {
  const staticItems = STATIC_ITEMS_BY_SLOT[slot];
  if (staticItems) return [...staticItems];

  const responses = await Promise.all(
    SLOT_FILTERS[slot].map(async (filter) => {
      const r = await fetch(buildItemUrl(filter, opts));
      if (!r.ok) throw new Error(`maplestory.io ${slot} returned ${r.status}`);
      return (await r.json()) as RawItem[];
    }),
  );

  const seen = new Set<number>();
  const items: CatalogItem[] = [];
  for (const list of responses) {
    for (const raw of list) {
      if (seen.has(raw.id)) continue;
      seen.add(raw.id);
      items.push({
        id: raw.id,
        // 偶有 maplestory.io 回傳沒 name 的 item,用 id 兜底避免下游 .toLowerCase() 炸
        name: raw.name ?? `#${raw.id}`,
        slot,
        isCash: !!raw.isCash,
        requiredGender: raw.requiredGender ?? 2,
      });
    }
  }
  return items;
}

interface RawRegion {
  region: string;
  mapleVersionId: string;
  isReady: boolean;
}

export async function fetchRegions(): Promise<RegionInfo[]> {
  const r = await fetch("https://maplestory.io/api/wz");
  if (!r.ok) throw new Error(`maplestory.io regions returned ${r.status}`);
  const raw = (await r.json()) as RawRegion[];
  return raw
    .filter((x) => x.isReady)
    .map((x) => ({ region: x.region, version: x.mapleVersionId }));
}
