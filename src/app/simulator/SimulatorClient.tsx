"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PublicIcon from "@mui/icons-material/Public";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import CharacterPreview from "@/components/simulator/CharacterPreview";
import EquipmentSlots from "@/components/simulator/EquipmentSlots";
import ItemPicker from "@/components/simulator/ItemPicker";
import SaveOutfitBar from "@/components/simulator/SaveOutfitBar";
import { useToast } from "@/components/ToastProvider";
import { useApiCreateOutfit, useApiOutfit, useApiUpdateOutfit } from "@/lib/api/hooks/use-api-outfits";
import { ApiError, getApiErrorMessage } from "@/lib/api/fetcher";
import SaveOutfitDialog, { type OutfitFormValues, type SubmitResult } from "@/components/simulator/SaveOutfitDialog";
import { fetchRegions, isSyntheticSlot } from "@/lib/maplestory";
import { toOutfitPayload } from "@/lib/outfit-payload";
import { SLOT_LABELS } from "@/lib/slot-taxonomy";
import { useSimulator } from "@/store/simulator";
import type { Slot, RegionInfo } from "@/types/maplestory";

type SparkleSpec = {
  pos: string;
  size: number;
  color: string;
  dur: string;
};

const SPARKLES: SparkleSpec[] = [
  { pos: "top-[3%] left-[2%]", size: 18, color: "text-pink-100/90", dur: "3.6s" },
  { pos: "top-[4%] left-[8%]", size: 22, color: "text-white/90", dur: "3s" },
  { pos: "top-[2%] left-[18%]", size: 12, color: "text-cyan-200/85", dur: "2.6s" },
  { pos: "top-[8%] left-[24%]", size: 16, color: "text-pink-100/90", dur: "4s" },
  { pos: "top-[8%] left-[36%]", size: 12, color: "text-white/80", dur: "3s" },
  { pos: "top-[12%] left-[42%]", size: 14, color: "text-cyan-100/90", dur: "3.5s" },
  { pos: "top-[6%] left-[48%]", size: 20, color: "text-cyan-300/80", dur: "3s" },
  { pos: "top-[6%] left-[58%]", size: 18, color: "text-purple-100/90", dur: "4.5s" },
  { pos: "top-[2%] left-[68%]", size: 14, color: "text-sky-100/85", dur: "3.2s" },
  { pos: "top-[10%] right-[20%]", size: 14, color: "text-cyan-100/90", dur: "2.8s" },
  { pos: "top-[8%] right-[32%]", size: 12, color: "text-purple-100/85", dur: "2.8s" },
  { pos: "top-[14%] left-[80%]", size: 18, color: "text-white/85", dur: "4.4s" },
  { pos: "top-[3%] left-[88%]", size: 22, color: "text-white/90", dur: "4.2s" },
  { pos: "top-[4%] right-[6%]", size: 18, color: "text-sky-200/90", dur: "3.2s" },
  { pos: "top-[12%] right-[2%]", size: 12, color: "text-blue-200/80", dur: "3.6s" },
  { pos: "top-[14%] left-[12%]", size: 14, color: "text-cyan-100/90", dur: "3.4s" },
  { pos: "top-[20%] left-[5%]", size: 14, color: "text-blue-100/90", dur: "3.8s" },
  { pos: "top-[24%] left-[18%]", size: 24, color: "text-white/85", dur: "5s" },
  { pos: "top-[18%] left-[36%]", size: 12, color: "text-pink-200/85", dur: "3s" },
  { pos: "top-[16%] left-[50%]", size: 14, color: "text-pink-100/90", dur: "4s" },
  { pos: "top-[26%] left-[52%]", size: 16, color: "text-cyan-200/90", dur: "4.2s" },
  { pos: "top-[18%] left-[72%]", size: 16, color: "text-blue-100/90", dur: "4s" },
  { pos: "top-[22%] right-[28%]", size: 18, color: "text-sky-100/90", dur: "3.4s" },
  { pos: "top-[16%] right-[8%]", size: 20, color: "text-purple-100/90", dur: "4s" },
  { pos: "top-[22%] left-[88%]", size: 14, color: "text-purple-100/90", dur: "3.4s" },
  { pos: "top-[28%] left-[8%]", size: 12, color: "text-pink-100/90", dur: "3s" },
  { pos: "top-[32%] left-[24%]", size: 16, color: "text-cyan-200/80", dur: "4.2s" },
  { pos: "top-[30%] left-[44%]", size: 12, color: "text-white/80", dur: "3.4s" },
  { pos: "top-[28%] left-[62%]", size: 14, color: "text-sky-100/90", dur: "4s" },
  { pos: "top-[34%] right-[14%]", size: 14, color: "text-sky-100/85", dur: "2.6s" },
  { pos: "top-[26%] right-[2%]", size: 12, color: "text-pink-100/90", dur: "3.8s" },
  { pos: "top-[38%] left-[10%]", size: 18, color: "text-white/90", dur: "3.6s" },
  { pos: "top-[42%] left-[28%]", size: 14, color: "text-sky-100/85", dur: "4.4s" },
  { pos: "top-[36%] left-[46%]", size: 22, color: "text-sky-200/85", dur: "3s" },
  { pos: "top-[36%] left-[78%]", size: 18, color: "text-cyan-200/80", dur: "4.6s" },
  { pos: "top-[44%] right-[22%]", size: 14, color: "text-pink-100/90", dur: "3.8s" },
  { pos: "top-[40%] right-[6%]", size: 18, color: "text-sky-100/90", dur: "4.6s" },
  { pos: "top-[46%] left-[2%]", size: 14, color: "text-cyan-200/80", dur: "3s" },
  { pos: "top-[48%] left-[36%]", size: 16, color: "text-purple-100/85", dur: "4.2s" },
  { pos: "top-[50%] left-[48%]", size: 14, color: "text-cyan-200/80", dur: "3.6s" },
  { pos: "top-[48%] left-[78%]", size: 20, color: "text-white/90", dur: "3.2s" },
  { pos: "top-[46%] right-[10%]", size: 12, color: "text-pink-100/90", dur: "4s" },
];

type DotSpec = { pos: string; cls: string };
const DOTS: DotSpec[] = [
  { pos: "top-[4%] left-[44%]", cls: "w-1 h-1 bg-purple-300/75" },
  { pos: "top-[6%] right-[12%]", cls: "w-1 h-1 bg-white/85" },
  { pos: "top-[10%] left-[35%]", cls: "w-1 h-1 bg-white/85" },
  { pos: "top-[14%] left-[70%]", cls: "w-1 h-1 bg-cyan-300/85" },
  { pos: "top-[18%] left-[8%]", cls: "w-1 h-1 bg-cyan-200/85" },
  { pos: "top-[22%] left-[60%]", cls: "w-1 h-1 bg-pink-300/80" },
  { pos: "top-[28%] right-[34%]", cls: "w-1.5 h-1.5 bg-pink-300/80" },
  { pos: "top-[34%] right-[8%]", cls: "w-2 h-2 bg-pink-200/40 blur-[1px]" },
  { pos: "top-[40%] right-[40%]", cls: "w-1 h-1 bg-purple-300/80" },
  { pos: "top-[42%] left-[12%]", cls: "w-1 h-1 bg-emerald-300/80" },
  { pos: "top-[44%] left-[24%]", cls: "w-1 h-1 bg-cyan-300/80" },
  { pos: "top-[44%] left-[56%]", cls: "w-2 h-2 bg-sky-200/50 blur-[1px]" },
  { pos: "top-[48%] left-[3%]", cls: "w-1 h-1 bg-pink-300/75" },
];

function Sparkle({ pos, size, color, dur }: SparkleSpec) {
  const scaled = Math.round(size * 1.6);
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width={scaled}
      height={scaled}
      fill="currentColor"
      className={`pointer-events-none absolute ${pos} ${color} drop-shadow-[0_0_12px_currentColor]`}
      style={{ animation: `pulse ${dur} ease-in-out infinite` }}
    >
      <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5Z" />
    </svg>
  );
}

function Dot({ pos, cls }: DotSpec) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute rounded-full ${pos} ${cls}`}
    />
  );
}

const REGION_OPTIONS = [
  { code: "TWMS", label: "TWMS" },
  { code: "KMS",  label: "KMS"  },
  { code: "GMS",  label: "GMS"  },
] as const;

type RegionCode = (typeof REGION_OPTIONS)[number]["code"];

function SimulatorSettingsPanel() {
  const region = useSimulator((s) => s.region);
  const setRegion = useSimulator((s) => s.setRegion);
  const [versionMap, setVersionMap] = useState<Partial<Record<RegionCode, string>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegions()
      .then((list: RegionInfo[]) => {
        const map: Partial<Record<RegionCode, string>> = {};
        for (const { code } of REGION_OPTIONS) {
          // Only numeric versions are stable game patches; skip beta/test tags like "40B"
          const entries = list.filter(
            (x) => x.region === code && /^\d+$/.test(x.version),
          );
          if (entries.length === 0) continue;
          const latest = entries.reduce((a, b) =>
            Number(b.version) > Number(a.version) ? b : a,
          );
          map[code] = latest.version;
        }
        setVersionMap(map);
        // Sync the current region to the latest version to avoid stale localStorage 500s
        const cur = useSimulator.getState().region;
        const latestVer = map[cur as RegionCode];
        if (latestVer) setRegion(cur, latestVer);
      })
      .catch(() => { /* silently degrade */ })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentVersion = versionMap[region as RegionCode];

  return (
    <div className="relative z-20 mx-4 mt-3 mb-2 rounded-2xl bg-white shadow-sm px-4 py-2.5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <SettingsOutlinedIcon sx={{ fontSize: 15, color: "#71717a", flexShrink: 0 }} />
          <Typography variant="caption" noWrap sx={{ color: "#71717a", fontSize: "11px" }}>
            切換地區以載入對應版本的裝備目錄，已穿戴的裝備會保留，但部分裝備可能因資料尚未提供而無法顯示。
          </Typography>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <PublicIcon sx={{ fontSize: 15, color: "#71717a" }} />
          <ToggleButtonGroup
            exclusive
            size="small"
            value={region}
            onChange={(_, val: string | null) => {
              if (!val) return;
              const ver = versionMap[val as RegionCode];
              if (ver) setRegion(val, ver);
            }}
            sx={{
              gap: 0.5,
              "& .MuiToggleButtonGroup-grouped": { border: "none !important", borderRadius: "999px !important" },
            }}
          >
            {REGION_OPTIONS.map(({ code, label }) => {
              const ver = versionMap[code];
              const disabled = !loading && !ver;
              return (
                <ToggleButton
                  key={code}
                  value={code}
                  disabled={disabled}
                  sx={{
                    px: 1.5,
                    py: 0.25,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: "#52525b",
                    bgcolor: "#f4f4f5",
                    "&:hover": { bgcolor: "#e4e4e7" },
                    "&.Mui-selected": {
                      bgcolor: "#D97706",
                      color: "#fff",
                      boxShadow: "0 2px 8px rgba(217,119,6,0.35)",
                      "&:hover": { bgcolor: "#B45309" },
                    },
                    "&.Mui-disabled": { color: "#d4d4d8", bgcolor: "#fafafa" },
                  }}
                >
                  {label}
                </ToggleButton>
              );
            })}
          </ToggleButtonGroup>
          {!loading && currentVersion && (
            <Typography variant="caption" sx={{ color: "#71717a" }}>
              版本 {currentVersion}
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
}

function StickyEquipmentDrawer({ editId }: { editId: number | null }) {
  const [open, setOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const { status: sessionStatus } = useSession();
  const equipped = useSimulator((s) => s.equipped);
  const stanceId = useSimulator((s) => s.stanceId);
  const animated = useSimulator((s) => s.animated);
  const expression = useSimulator((s) => s.expression);
  const { trigger: updateOutfit } = useApiUpdateOutfit();
  const { trigger: createOutfit } = useApiCreateOutfit();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const equippedEntries = useMemo(
    () => Object.entries(equipped)
      .filter(([, item]) => item != null && !isSyntheticSlot(item.slot))
      .map(([slot, item]) => ({ slot: slot as Slot, item: item! })),
    [equipped],
  );

  const count = equippedEntries.length;
  const slotNames = useMemo(
    () => equippedEntries.map(({ slot }) => SLOT_LABELS[slot]).join("、"),
    [equippedEntries],
  );

  const requireAuth = () => {
    if (sessionStatus !== "authenticated") {
      toast.info("需要登入後才能進行儲存搭配");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (editId === null || !requireAuth()) return;
    setSaving(true);
    try {
      await updateOutfit({ id: editId, body: { payload: toOutfitPayload(equipped, stanceId, animated, expression) } });
      toast.success("已儲存");
    } catch {
      toast.error("儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (values: OutfitFormValues): Promise<SubmitResult> => {
    try {
      await createOutfit({ ...values, payload: toOutfitPayload(equipped, stanceId, animated, expression) });
      toast.success("已加入衣櫃");
      return { ok: true };
    } catch (e) {
      toast.error("儲存失敗");
      if (e instanceof ApiError) {
        if (e.status === 429) return { ok: false, error: getApiErrorMessage(e) ?? "已達儲存上限" };
        if (e.status === 401) return { ok: false, error: "請先登入再儲存" };
        return { ok: false, error: `儲存失敗(${e.status})` };
      }
      return { ok: false, error: "儲存失敗" };
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div
          className="bg-zinc-50 overflow-y-auto transition-[max-height] duration-300 ease-in-out rounded-t-2xl shadow-[0_-2px_12px_rgba(0,0,0,0.06)]"
          style={{ maxHeight: open ? "65vh" : 0 }}
        >
          <div className="p-4">
            <EquipmentSlots hideTitle />
          </div>
        </div>
        <div className="bg-white border-t border-zinc-200 px-4 py-2.5 flex items-center gap-2 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-zinc-800">目前裝備 {count} 件</p>
            <p className="text-xs text-zinc-400 truncate">{slotNames}</p>
          </div>
          <IconButton
            size="small"
            onClick={() => setOpen((v) => !v)}
            sx={{ color: "#71717a", border: "1px solid #e4e4e7", borderRadius: "999px", "&:hover": { borderColor: "#a1a1aa", bgcolor: "transparent" } }}
          >
            <ExpandMoreIcon sx={{ fontSize: 18, transition: "transform 0.25s", transform: open ? "rotate(0deg)" : "rotate(180deg)" }} />
          </IconButton>
          {editId !== null && (
            <Button
              variant="contained" size="small" color="primary"
              disabled={saving}
              onClick={() => void handleSave()}
              sx={{ borderRadius: 1, px: 2, flexShrink: 0 }}
            >
              {saving ? <CircularProgress size={14} color="inherit" /> : "儲存"}
            </Button>
          )}
          <Button
            variant="outlined" size="small" color="primary"
            onClick={() => { if (requireAuth()) setFormOpen(true); }}
            sx={{ borderRadius: 1, px: 2, flexShrink: 0 }}
          >
            新增
          </Button>
        </div>
      </div>

      <SaveOutfitDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        subtitle={`目前裝備 ${count} 件`}
      />
    </>
  );
}

function SimulatorContent() {
  const searchParams = useSearchParams();

  const rawEdit = searchParams.get("edit");
  const editId =
    rawEdit !== null && Number.isFinite(Number(rawEdit)) ? Number(rawEdit) : null;

  // ?load=ID — load outfit as remix starting point, never shows "儲存"
  const rawLoad = searchParams.get("load");
  const loadId =
    rawLoad !== null && Number.isFinite(Number(rawLoad)) ? Number(rawLoad) : null;

  // fetch whichever ID is present; edit takes priority
  const fetchId = editId ?? loadId;

  const { data: session } = useSession();
  const { data: fetchedOutfit } = useApiOutfit(fetchId);
  const loadOutfit = useSimulator((s) => s.loadOutfit);

  const initOnce = useRef(false);
  const appliedFetchId = useRef<number | null>(null);

  // Draft mode: rehydrate localStorage once on mount (skipped when edit/load param present,
  // so API data doesn't race with localStorage restore).
  useEffect(() => {
    if (fetchId !== null) return;
    if (initOnce.current) return;
    initOnce.current = true;
    void useSimulator.persist.rehydrate()?.then(() => {
      const { equipped, loadDefault, upgradeStubs } = useSimulator.getState();
      if (Object.keys(equipped).length === 0) loadDefault();
      else upgradeStubs();
    });
    // intentionally only runs on mount; fetchId is the correct value at that point
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Edit/load mode: apply the fetched outfit to the simulator once per fetchId
  useEffect(() => {
    if (!fetchedOutfit || appliedFetchId.current === fetchId) return;
    appliedFetchId.current = fetchId;
    loadOutfit(fetchedOutfit.payload);
  }, [fetchedOutfit, fetchId, loadOutfit]);

  // "儲存" only appears when ?edit is set AND the logged-in user owns the outfit
  const ownedEditId =
    editId !== null && fetchedOutfit?.userId === session?.user?.id ? editId : null;

  return (
    <>
      <div className="relative container mx-auto max-w-[1600px]">
        <SimulatorSettingsPanel />
        <div className="px-4 pt-2 pb-28 xl:pb-16 grid gap-4 md:grid-cols-[360px_1fr] xl:grid-cols-[380px_1fr_280px] 2xl:grid-cols-[460px_1fr_360px] items-start">
          <div className="self-start flex flex-col gap-3">
            <CharacterPreview />
          </div>
          <ItemPicker />
          <div className="hidden xl:flex flex-col gap-3 sticky top-[72px]">
            <EquipmentSlots scrollable />
            <SaveOutfitBar editId={ownedEditId} />
          </div>
        </div>
        <div className="xl:hidden">
          <StickyEquipmentDrawer editId={ownedEditId} />
        </div>
      </div>
    </>
  );
}

export default function SimulatorClient() {
  return (
    <div className="relative overflow-hidden flex-1 min-h-[500px] bg-gradient-to-b from-sky-300/80 via-sky-100 to-cyan-100">
      {/* 底部極光帶 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-r from-yellow-100/40 via-emerald-100/40 to-sky-200/40 blur-2xl"
      />
      {/* 裝飾雲朵 */}
      <Image src="/simulator-cloude.png" alt="" aria-hidden width={256} height={120}
        className="pointer-events-none absolute -top-4 -left-8 w-64 opacity-70"
        style={{ height: "auto", animation: "pulse 6s ease-in-out infinite" }}
      />
      <Image src="/simulator-cloude.png" alt="" aria-hidden width={384} height={180}
        className="pointer-events-none absolute top-16 right-0 w-96 opacity-50"
        style={{ height: "auto", animation: "pulse 8s ease-in-out infinite" }}
      />
      <Image src="/simulator-cloude.png" alt="" aria-hidden width={160} height={75}
        className="pointer-events-none absolute top-40 left-1/3 w-40 opacity-40"
        style={{ height: "auto", animation: "pulse 5s ease-in-out infinite" }}
      />
      {SPARKLES.map((s) => (
        <Sparkle key={s.pos} {...s} />
      ))}
      {DOTS.map((d) => (
        <Dot key={d.pos} {...d} />
      ))}
      {/* Suspense required because SimulatorContent uses useSearchParams */}
      <Suspense>
        <SimulatorContent />
      </Suspense>
    </div>
  );
}
