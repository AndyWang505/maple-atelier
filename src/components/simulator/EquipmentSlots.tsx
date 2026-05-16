"use client";

import { useState } from "react";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { isStub as isStubItem, useSimulator } from "@/store/simulator";
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
import type { Slot } from "@/types/maplestory";

export default function EquipmentSlots({ hideTitle, scrollable }: { hideTitle?: boolean; scrollable?: boolean } = {}) {
  const equipped = useSimulator((s) => s.equipped);
  const catalog = useSimulator((s) => s.catalog);
  const equip = useSimulator((s) => s.equip);
  const unequip = useSimulator((s) => s.unequip);
  const [expandedSlots, setExpandedSlots] = useState<Set<Slot>>(new Set());

  const toggleExpand = (slot: Slot) =>
    setExpandedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(slot)) next.delete(slot);
      else next.add(slot);
      return next;
    });

  return (
    <div className={`rounded-2xl bg-white shadow-sm${scrollable ? " flex flex-col max-h-[calc(100vh-320px)] overflow-hidden pl-4 pt-4 pb-4 pr-0" : " p-4"}`}>
      {!hideTitle && (
        <div className="mb-2 shrink-0">
          <h3 className="font-semibold text-sm">目前裝備</h3>
        </div>
      )}

      <div className={scrollable ? "overflow-y-auto flex-1 min-h-0 pr-4" : ""}>
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
                const isStub = isStubItem(item);
                const displayName = isStub
                  ? null
                  : isColorSlot(slot)
                  ? stripColorName(item.name)
                  : item.name;
                const hasColors = colorVariants.length > 1;
                const isExpanded = expandedSlots.has(slot);
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
                          {id === "equipment" && !isStub && (
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
                          {displayName ? (
                            <>
                              {displayName}{" "}
                              <span className="text-zinc-400">({item.id})</span>
                            </>
                          ) : (
                            <span className="text-zinc-400">#{item.id}</span>
                          )}
                        </p>
                      </div>
                      {hasColors && (
                        <IconButton
                          size="small"
                          onClick={() => toggleExpand(slot)}
                          aria-label={isExpanded ? "收起顏色" : "展開顏色"}
                          sx={{
                            transition: "transform 0.2s",
                            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                            color: isExpanded ? "#D97706" : undefined,
                          }}
                        >
                          <ExpandMoreIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => unequip(slot)}
                        aria-label="移除"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </div>
                    {hasColors && (
                      <Collapse in={isExpanded} unmountOnExit>
                        <div className="flex flex-wrap gap-2 mt-1.5 pl-11 pb-0.5">
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
                                    ? "border-amber-500 scale-110"
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
                      </Collapse>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      </div>
    </div>
  );
}
