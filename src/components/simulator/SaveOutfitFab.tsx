"use client";

import { useState } from "react";
import Fab from "@mui/material/Fab";
import SaveIcon from "@mui/icons-material/Save";
import { useSession } from "next-auth/react";
import { useSimulator } from "@/store/simulator";
import { toOutfitPayload } from "@/lib/outfit-payload";
import { useToast } from "@/components/ToastProvider";
import { useApiCreateOutfit } from "@/lib/api/hooks/use-api-outfits";
import { ApiError, getApiErrorMessage } from "@/lib/api/fetcher";
import SaveOutfitDialog, { type OutfitFormValues, type SubmitResult } from "./SaveOutfitDialog";

export default function SaveOutfitFab() {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const { trigger: createOutfit } = useApiCreateOutfit();
  const equipped = useSimulator((s) => s.equipped);
  const stanceId = useSimulator((s) => s.stanceId);
  const animated = useSimulator((s) => s.animated);
  const expression = useSimulator((s) => s.expression);

  if (status === "loading") return null;

  const handleFabClick = () => {
    if (status !== "authenticated") {
      toast.info("需要登入後才能進行儲存搭配");
      return;
    }
    setOpen(true);
  };

  const handleCreate = async (values: OutfitFormValues): Promise<SubmitResult> => {
    try {
      await createOutfit({
        ...values,
        payload: toOutfitPayload(equipped, stanceId, animated, expression),
      });
      toast.success("已加入衣櫃");
      return { ok: true };
    } catch (e) {
      toast.error("儲存失敗");
      if (e instanceof ApiError) {
        if (e.status === 429) {
          return { ok: false, error: getApiErrorMessage(e) ?? "已達儲存上限,請刪除舊的搭配" };
        }
        if (e.status === 401) return { ok: false, error: "請先登入再儲存" };
        return { ok: false, error: `儲存失敗(${e.status})` };
      }
      return { ok: false, error: "儲存失敗" };
    }
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="儲存搭配"
        title="儲存搭配"
        onClick={handleFabClick}
        sx={{
          position: "fixed",
          right: {
            xs: 16,
            md: "max(32px, calc((100vw - 1280px) / 2 + 32px))",
          },
          bottom: { xs: 16, md: 32 },
          zIndex: 10,
        }}
      >
        <SaveIcon />
      </Fab>
      <SaveOutfitDialog
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleCreate}
      />
    </>
  );
}
