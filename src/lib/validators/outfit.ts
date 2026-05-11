import { OUTFIT_LIMITS, TAG_VALID_REGEX } from "@/lib/limits";
import type { OutfitPayload } from "@/db/schema";
import { SLOTS } from "@/types/maplestory";
import { validateUserText } from "./text";

const ALLOWED_SLOT_KEYS = new Set<string>(SLOTS);
// 正常 outfit ~1-2 KB,4× headroom 給未來 schema 擴充
const MAX_PAYLOAD_BYTES = 8 * 1024;
const MAX_STANCE_LEN = 32;
const MAX_REGION_LEN = 16;
const MAX_VERSION_LEN = 32;
const MAX_EXPRESSION_LEN = 32;

export const normalizeOutfitDescription = (
  raw: unknown,
): { value: string | null } | { error: string } => {
  if (raw === null || raw === undefined) return { value: null };
  if (typeof raw !== "string") return { value: null };
  if (!raw.trim()) return { value: null };
  const result = validateUserText(raw, {
    maxLen: OUTFIT_LIMITS.descriptionLen,
    label: "描述",
    allowEmpty: true,
  });
  if (!result.ok) return { error: result.error };
  return { value: result.value || null };
};

// Invalid tags are silently dropped; caller decides whether to surface in UI.
export const normalizeOutfitTags = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of raw) {
    if (typeof t !== "string") continue;
    const trimmed = t.trim().slice(0, OUTFIT_LIMITS.tagLen);
    if (!trimmed) continue;
    if (!TAG_VALID_REGEX.test(trimmed)) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
    if (out.length >= OUTFIT_LIMITS.maxTags) break;
  }
  return out;
};

export const isValidOutfitPayload = (p: unknown): p is OutfitPayload => {
  if (!p || typeof p !== "object") return false;
  const x = p as Partial<OutfitPayload>;

  if (typeof x.stance !== "string" || x.stance.length > MAX_STANCE_LEN) return false;
  if (typeof x.animated !== "boolean") return false;
  if (x.expression !== undefined && (typeof x.expression !== "string" || x.expression.length > MAX_EXPRESSION_LEN)) return false;
  if (!x.slots || typeof x.slots !== "object" || Array.isArray(x.slots)) return false;

  for (const [slot, ref] of Object.entries(x.slots)) {
    if (!ALLOWED_SLOT_KEYS.has(slot)) return false;
    if (!ref || typeof ref !== "object") return false;
    const r = ref as { id?: unknown; region?: unknown; version?: unknown; isCash?: unknown };
    if (typeof r.id !== "number" || !Number.isFinite(r.id)) return false;
    if (r.region !== undefined && (typeof r.region !== "string" || r.region.length > MAX_REGION_LEN)) return false;
    if (r.version !== undefined && (typeof r.version !== "string" || r.version.length > MAX_VERSION_LEN)) return false;
    if (r.isCash !== undefined && typeof r.isCash !== "boolean") return false;
  }

  // 兜底:per-field caps 理論上已壓在 ~2 KB 內
  if (JSON.stringify(p).length > MAX_PAYLOAD_BYTES) return false;
  return true;
};
