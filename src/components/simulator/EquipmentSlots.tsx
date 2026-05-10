"use client";

import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import Button from "@mui/material/Button";
import { useSimulator } from "@/store/simulator";
import { getSlotIconUrl } from "@/lib/maplestory";
import { ItemIcon } from "@/components/ui/ItemIcon";
import { SLOT_LABELS, SLOT_SECTIONS } from "@/lib/slot-taxonomy";
import {
  COLOR_SWATCHES,
  getColorIndex,
  isColorSlot,
  isSameStyle,
  stripColorName,
} from "@/lib/color-variants";

export default function EquipmentSlots() {
  const equipped = useSimulator((s) => s.equipped);
  const catalog = useSimulator((s) => s.catalog);
  const equip = useSimulator((s) => s.equip);
  const unequip = useSimulator((s) => s.unequip);
  const reset = useSimulator((s) => s.reset);
  const randomize = useSimulator((s) => s.randomize);

  return (
    <div className="rounded-2xl bg-white/75 backdrop-blur-md border border-white/80 shadow-sm shadow-sky-200/40 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">目前裝備</h3>
        <div className="flex gap-2">
          <Button
            size="small"
            startIcon={<ShuffleIcon />}
            onClick={randomize}
            color="primary"
          >
            隨機
          </Button>
          <Button
            size="small"
            startIcon={<RestartAltIcon />}
            onClick={reset}
            color="inherit"
          >
            重置
          </Button>
        </div>
      </div>

      {SLOT_SECTIONS.map(({ id, title, slots }) => {
        const equippedSlots = slots.filter((s) => equipped[s]);
        if (equippedSlots.length === 0) return null;
        return (
          <div key={id} className="mt-2 first:mt-0">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
              {title}
            </h4>
            <ul className="list-none p-0 divide-y divide-zinc-100">
              {equippedSlots.map((slot) => {
                const item = equipped[slot]!;
                const colorVariants = isColorSlot(slot)
                  ? (catalog[slot]?.items ?? [])
                      .filter((i) => isSameStyle(slot, i.id, item.id))
                      .sort(
                        (a, b) =>
                          getColorIndex(slot, a.id) - getColorIndex(slot, b.id),
                      )
                  : [];
                const displayName = isColorSlot(slot)
                  ? stripColorName(item.name)
                  : item.name;
                return (
                  <li key={slot} className="py-1.5">
                    <div className="flex items-center gap-3">
                      <ItemIcon
                        src={getSlotIconUrl(slot, item.id, {
                          region: item.region,
                          version: item.version,
                        })}
                        alt=""
                        className="w-8 h-8 object-contain"
                        style={{ imageRendering: "pixelated" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-500 flex items-center gap-2">
                          {SLOT_LABELS[slot]}
                          {id === "equipment" && (
                            <span
                              className={`inline-block px-1.5 py-0.5 text-[10px] font-medium rounded ${
                                item.isCash
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-zinc-100 text-zinc-600"
                              }`}
                            >
                              {item.isCash ? "現金" : "一般"}
                            </span>
                          )}
                        </p>
                        <p className="text-sm truncate">
                          {displayName}{" "}
                          <span className="text-zinc-400">({item.id})</span>
                        </p>
                      </div>
                      <IconButton
                        size="small"
                        onClick={() => unequip(slot)}
                        aria-label="移除"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </div>
                    {colorVariants.length > 1 && (
                      <div className="flex gap-2 mt-1.5 pl-11">
                        {colorVariants.map((v) => {
                          const colorIdx = getColorIndex(slot, v.id);
                          const swatch = COLOR_SWATCHES[colorIdx];
                          const isActive = v.id === item.id;
                          return (
                            <button
                              key={v.id}
                              onClick={() => equip(v)}
                              className={`w-5 h-5 rounded-full border-2 transition ${
                                isActive
                                  ? "border-maple-red scale-110"
                                  : "border-zinc-300 hover:border-zinc-500"
                              }`}
                              style={{
                                background: swatch?.hex ?? "#a3a3a3",
                              }}
                              title={`${swatch?.name ?? colorIdx}色 (${v.id})`}
                              aria-label={`切換顏色 ${swatch?.name ?? colorIdx}`}
                            />
                          );
                        })}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
