import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { fetchItemsBySlot, fetchSlotItemInfo } from "@/lib/maplestory";
import {
  DEFAULT_OUTFIT_PAYLOAD,
  pickRandom,
  pickRandomSlotSet,
} from "@/lib/outfit-rules";
import type { OutfitPayload } from "@/db/schema";
import type { CatalogItem, Slot } from "@/types/maplestory";
import { SLOTS } from "@/types/maplestory";

/** stub item 的 sentinel:`name === "#" + id` 表示這是 loadOutfit 留下還沒升級成真名的占位 */
const isStub = (item: CatalogItem) => item.name === `#${item.id}`;

type Equipped = Partial<Record<Slot, CatalogItem>>;

interface SlotCache {
  status: "idle" | "loading" | "success" | "error";
  items: CatalogItem[];
  error?: string;
}

type Catalog = Partial<Record<Slot, SlotCache>>;

const DEFAULT_STANCE = "stand1";
const DEFAULT_ANIMATED = false;
const DEFAULT_EXPRESSION = "default";

interface SimulatorState {
  equipped: Equipped;
  catalog: Catalog;
  /** 渲染姿勢(stand1 / walk1 / swingO1 ...) */
  stanceId: string;
  /** 是否取動畫 GIF(false 取靜態 PNG) */
  animated: boolean;
  expression: string;
  /**
   * 每次清空 / 隨機 / 載入別套都 +1。loadSlot 拿到 fetch 結果若要寫回隨機選的 item,
   * 會比對自己抓的 generation;若期間有人重新整理過,寫回會被丟棄,避免 in-flight
   * 的舊 random 結果污染新的 outfit。
   */
  generation: number;
  equip: (item: CatalogItem) => void;
  unequip: (slot: Slot) => void;
  /** 清空裝備並還原 stance / animated / expression 為預設 */
  reset: () => void;
  /** 必裝身體三件 + 選裝 9 件各 50% + (上衣+褲子) vs 套服 二擇一 */
  randomize: () => void;
  setStanceId: (id: string) => void;
  setAnimated: (animated: boolean) => void;
  setExpression: (expression: string) => void;
  loadSlot: (slot: Slot, options?: { randomize?: boolean }) => Promise<void>;
  loadOutfit: (payload: OutfitPayload) => void;
  loadDefault: () => void;
}

export const useSimulator = create<SimulatorState>()(
  persist(
    (set, get) => ({
      equipped: {},
      catalog: {},
      stanceId: DEFAULT_STANCE,
      animated: DEFAULT_ANIMATED,
      expression: DEFAULT_EXPRESSION,
      generation: 0,

      equip: (item) =>
        set((state) => {
          const next: Equipped = { ...state.equipped, [item.slot]: item };
          // 套服(overall)會蓋掉 coat + pants;反之亦然
          if (item.slot === "overall") {
            delete next.coat;
            delete next.pants;
          } else if (item.slot === "coat" || item.slot === "pants") {
            delete next.overall;
          }
          return { equipped: next };
        }),

      unequip: (slot) =>
        set((state) => {
          const next = { ...state.equipped };
          delete next[slot];
          return { equipped: next };
        }),

      reset: () =>
        set((state) => ({
          equipped: {},
          stanceId: DEFAULT_STANCE,
          animated: DEFAULT_ANIMATED,
          expression: DEFAULT_EXPRESSION,
          generation: state.generation + 1,
        })),

      randomize: () => {
        // 已快取的 slot 直接同步抽完一次寫入(避免 N 個分散 set 觸發 N 次 re-render);
        // 未快取的交給 loadSlot 走 fetch + 隨機路徑
        const state = get();
        const slots = pickRandomSlotSet();
        const equipped: Equipped = {};
        const slotsToFetch: Slot[] = [];
        for (const slot of slots) {
          const cache = state.catalog[slot];
          if (cache?.status === "success") {
            const item = pickRandom(cache.items);
            if (item) equipped[slot] = item;
          } else {
            slotsToFetch.push(slot);
          }
        }
        set({ equipped, generation: state.generation + 1 });
        for (const slot of slotsToFetch) {
          void get().loadSlot(slot, { randomize: true });
        }
      },

      setStanceId: (id) => {
        if (get().stanceId === id) return;
        set({ stanceId: id });
      },
      setAnimated: (animated) => {
        if (get().animated === animated) return;
        set({ animated });
      },
      setExpression: (expression) => {
        if (get().expression === expression) return;
        set({ expression });
      },

      loadOutfit: (payload) => {
        const state = get();
        const equipped: Equipped = {};
        for (const slot of SLOTS) {
          const ref = payload.slots[slot];
          if (!ref) continue;
          const cache = state.catalog[slot];
          const cached = cache?.items.find((i) => i.id === ref.id);
          equipped[slot] = cached ?? {
            id: ref.id,
            name: `#${ref.id}`,
            slot,
            isCash: false,
            requiredGender: 2,
            region: ref.region,
            version: ref.version,
          };
        }
        set((state) => ({
          equipped,
          stanceId: payload.stance,
          animated: payload.animated,
          expression: payload.expression ?? DEFAULT_EXPRESSION,
          generation: state.generation + 1,
        }));
        void upgradeStubNames(set, get, equipped);
      },

      loadDefault: () => {
        get().loadOutfit(DEFAULT_OUTFIT_PAYLOAD);
      },

      loadSlot: async (slot, options = {}) => {
        const { randomize = false } = options;
        const startGen = get().generation;
        const cached = get().catalog[slot];

        if (cached?.status === "loading") return;
        if (cached?.status === "success") {
          if (randomize) {
            const item = pickRandom(cached.items);
            if (item) tryWriteRandomized(set, slot, item, startGen);
          }
          return;
        }

        set((state) => ({
          catalog: { ...state.catalog, [slot]: { status: "loading", items: [] } },
        }));

        try {
          const items = await fetchItemsBySlot(slot);
          set((state) => {
            let nextEquipped = state.equipped;
            const current = nextEquipped[slot];
            if (current && isStub(current)) {
              const real = items.find((i) => i.id === current.id);
              if (real) nextEquipped = { ...nextEquipped, [slot]: real };
            }
            if (
              randomize &&
              state.generation === startGen &&
              !state.equipped[slot]
            ) {
              const random = pickRandom(items);
              if (random) nextEquipped = { ...nextEquipped, [slot]: random };
            }
            return {
              catalog: { ...state.catalog, [slot]: { status: "success", items } },
              equipped: nextEquipped,
            };
          });
        } catch (err) {
          set((state) => ({
            catalog: {
              ...state.catalog,
              [slot]: {
                status: "error",
                items: [],
                error: err instanceof Error ? err.message : "fetch failed",
              },
            },
          }));
        }
      },
    }),
    {
      name: "maple-atelier-simulator",
      storage: createJSONStorage(() => localStorage),
      // 避免 SSR / client 初始渲染不一致 — 由消費端手動 rehydrate
      skipHydration: true,
      partialize: (state) => ({
        equipped: state.equipped,
        stanceId: state.stanceId,
        animated: state.animated,
        expression: state.expression,
      }),
    },
  ),
);

/** 寫入「隨機抽到的 item」前再驗一次:期間沒被另一輪清空、且該 slot 還沒被搶先寫上 */
function tryWriteRandomized(
  set: (
    fn: (state: SimulatorState) => Partial<SimulatorState>,
  ) => void,
  slot: Slot,
  item: CatalogItem,
  startGen: number,
) {
  set((state) => {
    if (state.generation !== startGen || state.equipped[slot]) return {};
    return { equipped: { ...state.equipped, [slot]: item } };
  });
}

type StubLookup = { slot: Slot; id: number; name: string; isCash: boolean };

/** 用單筆 /item/{id} 端點 (~1KB / 筆) 升級 stub,而不是整個 catalog dump (100KB-2MB / slot)。 */
async function upgradeStubNames(
  set: (fn: (state: SimulatorState) => Partial<SimulatorState>) => void,
  get: () => SimulatorState,
  equipped: Equipped,
): Promise<void> {
  const stubs = (Object.entries(equipped) as [Slot, CatalogItem][]).filter(
    ([, item]) => isStub(item),
  );
  if (stubs.length === 0) return;

  const startGen = get().generation;
  const results = await Promise.all(
    stubs.map(async ([slot, item]): Promise<StubLookup | null> => {
      const info = await fetchSlotItemInfo(slot, item.id, {
        region: item.region,
        version: item.version,
      });
      return info
        ? { slot, id: item.id, name: info.name, isCash: info.isCash }
        : null;
    }),
  );
  const updates = results.filter((r): r is StubLookup => r !== null);
  if (updates.length === 0) return;

  set((state) => {
    // 期間 reset / randomize / 載入別套 → 整批 generation 失效,丟棄
    if (state.generation !== startGen) return {};
    const next = { ...state.equipped };
    for (const u of updates) {
      const current = next[u.slot];
      // per-slot race-check:使用者可能在同 generation 內 equip 別的 item
      if (!current || current.id !== u.id || !isStub(current)) continue;
      next[u.slot] = { ...current, name: u.name, isCash: u.isCash };
    }
    return { equipped: next };
  });
}
