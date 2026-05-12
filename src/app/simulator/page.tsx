"use client";

import { useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import CharacterPreview from "@/components/simulator/CharacterPreview";
import ItemPicker from "@/components/simulator/ItemPicker";
import EquipmentSlots from "@/components/simulator/EquipmentSlots";
import SaveOutfitFab from "@/components/simulator/SaveOutfitFab";
import { useSimulator } from "@/store/simulator";
import { useApiOutfit } from "@/lib/api/hooks/use-api-outfits";

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
      <div className="relative container mx-auto max-w-7xl px-4 pt-4 pb-12 sm:pb-16 grid gap-4 md:grid-cols-[1fr_1.5fr] items-start">
        <div className="flex flex-col gap-4">
          <CharacterPreview />
          <EquipmentSlots />
        </div>
        <ItemPicker />
      </div>
      <SaveOutfitFab editId={ownedEditId} />
    </>
  );
}

export default function SimulatorPage() {
  return (
    <div className="relative overflow-hidden flex-1 min-h-[500px] bg-gradient-to-b from-sky-300/80 via-sky-100 to-cyan-100">
      {/* 底部極光帶 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-r from-yellow-100/40 via-emerald-100/40 to-sky-200/40 blur-2xl"
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
