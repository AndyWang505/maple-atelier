"use client";

import { useMemo, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Chip from "@mui/material/Chip";
import { useApiTopTags } from "@/lib/hooks/use-tags";
import { OUTFIT_LIMITS, TAG_VALID_REGEX } from "@/lib/limits";
import { tagChipSx, tagChipClickableSx } from "@/lib/mui/theme";

const MAX_TITLE_LEN = OUTFIT_LIMITS.titleLen;
const MAX_DESCRIPTION_LEN = OUTFIT_LIMITS.descriptionLen;
const MAX_TAGS = OUTFIT_LIMITS.maxTags;
const MAX_TAG_LEN = OUTFIT_LIMITS.tagLen;
const SUGGESTION_LIMIT = 10;

/** DB 還沒累積熱門 tag 時的兜底 — 常見 MapleStory 風格 keyword */
const FALLBACK_SUGGESTIONS = [
  "帥氣",
  "可愛",
  "萌系",
  "高冷",
  "暗黑",
  "復古",
  "制服",
];

/** 標籤分隔符:半形/全形空白、半形/全形逗號、頓號 */
const TAG_DELIMITER = /[\s,,、]+/;

/** 把使用者輸入的整段字串切成 valid tag 陣列(過掉含符號的) */
const parseTags = (raw: string): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const piece of raw.split(TAG_DELIMITER)) {
    const trimmed = piece.trim().slice(0, MAX_TAG_LEN);
    if (!trimmed) continue;
    if (!TAG_VALID_REGEX.test(trimmed)) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
    if (out.length >= MAX_TAGS) break;
  }
  return out;
};

/** 找出含非法字元的 tag(submit 前 surface 給使用者看) */
const findInvalidTags = (raw: string): string[] => {
  const out: string[] = [];
  for (const piece of raw.split(TAG_DELIMITER)) {
    const trimmed = piece.trim();
    if (!trimmed) continue;
    if (!TAG_VALID_REGEX.test(trimmed)) out.push(trimmed);
  }
  return out;
};

export interface OutfitFormValues {
  title: string;
  description: string;
  tags: string[];
  isPublic: boolean;
}

export type SubmitResult = { ok: true } | { ok: false; error: string };

interface SaveOutfitDialogProps {
  open: boolean;
  onClose: () => void;
  dialogTitle?: string;
  submitLabel?: string;
  initial?: Partial<OutfitFormValues>;
  /** 由 caller 決定怎麼送(POST 建立 / PUT 編輯)。回 ok=false 會顯示錯誤、保持開啟 */
  onSubmit: (values: OutfitFormValues) => Promise<SubmitResult>;
}

/**
 * 通用 outfit metadata dialog — 標題 / 標籤 / 公開 toggle。
 * caller 決定 submit 走 create or edit。同實例切換編輯目標時用 `key={outfitId}` 強制 remount。
 */
export default function SaveOutfitDialog({
  open,
  onClose,
  dialogTitle = "儲存搭配",
  submitLabel = "儲存",
  initial,
  onSubmit,
}: SaveOutfitDialogProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [tagsInput, setTagsInput] = useState((initial?.tags ?? []).join(" "));
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? false);
  const [submitting, setSubmitting] = useState(false);
  /** field 為 undefined 代表非欄位專屬(API 錯誤等),顯示在 dialog 底部 */
  const [error, setError] = useState<
    | { field?: "title" | "tags"; message: string }
    | null
  >(null);
  // 熱門 tag 當建議,/explore 可能已 warm 過 cache 直接命中。失敗 / 沒資料就用 fallback。
  const { data: topTagsData } = useApiTopTags(SUGGESTION_LIMIT);
  const topTags = useMemo(
    () => topTagsData?.map((x) => x.tag) ?? [],
    [topTagsData],
  );

  const previewTags = useMemo(() => parseTags(tagsInput), [tagsInput]);

  const suggestions = useMemo(() => {
    const used = new Set(previewTags.map((t) => t.toLowerCase()));
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of [...topTags, ...FALLBACK_SUGGESTIONS]) {
      const key = t.toLowerCase();
      if (seen.has(key) || used.has(key)) continue;
      seen.add(key);
      out.push(t);
      if (out.length >= SUGGESTION_LIMIT) break;
    }
    return out;
  }, [topTags, previewTags]);

  const handleAddSuggestion = (tag: string) => {
    if (previewTags.length >= MAX_TAGS) return;
    setTagsInput((prev) => {
      if (!prev) return tag;
      return /[\s,,、]$/.test(prev) ? prev + tag : prev + " " + tag;
    });
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);
    const trimmed = title.trim();
    if (!trimmed) {
      setError({ field: "title", message: "請輸入標題" });
      return;
    }
    const invalid = findInvalidTags(tagsInput);
    if (invalid.length > 0) {
      setError({
        field: "tags",
        message: `標籤只能用中英文或數字,「${invalid[0]}」不合法`,
      });
      return;
    }
    const finalTags = parseTags(tagsInput);
    if (finalTags.length === 0) {
      setError({
        field: "tags",
        message: `請輸入至少 1 個標籤(最多 ${MAX_TAGS} 個)`,
      });
      return;
    }
    setSubmitting(true);
    try {
      const result = await onSubmit({
        title: trimmed,
        description: description.trim().slice(0, MAX_DESCRIPTION_LEN),
        tags: finalTags,
        isPublic,
      });
      if (!result.ok) {
        setError({ message: result.error });
        setSubmitting(false);
        return;
      }
      onClose();
    } catch {
      setError({ message: "網路錯誤,請稍後再試" });
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          required
          label="標題"
          placeholder="這套真的沒動過醫美"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          slotProps={{ htmlInput: { maxLength: MAX_TITLE_LEN } }}
          error={error?.field === "title"}
          helperText={
            error?.field === "title"
              ? error.message
              : `${title.length}/${MAX_TITLE_LEN}`
          }
          sx={{ mt: 1 }}
        />
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={5}
          label="描述（可選）"
          placeholder="自由市場20頻18洞選帥選美快來集合"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          slotProps={{ htmlInput: { maxLength: MAX_DESCRIPTION_LEN } }}
          helperText={`${description.length}/${MAX_DESCRIPTION_LEN}`}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          required
          label="標籤"
          placeholder="時尚 黑暗 可愛"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          error={error?.field === "tags"}
          helperText={
            error?.field === "tags"
              ? error.message
              : `${previewTags.length}/${MAX_TAGS} ・ 空白或逗號分隔 ・ 中英文 / 數字 ・ 每個最多 ${MAX_TAG_LEN} 字`
          }
          sx={{ mt: 2 }}
        />
        {previewTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {previewTags.map((t) => (
              <Chip key={t} label={`#${t}`} size="small" variant="outlined" sx={tagChipSx} />
            ))}
          </div>
        )}
        {suggestions.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-zinc-500 mb-1.5">建議標籤（點擊加入）</p>
            <div className="flex flex-wrap gap-1">
              {suggestions.map((s) => (
                <Chip
                  key={s}
                  label={`#${s}`}
                  size="small"
                  variant="outlined"
                  onClick={() => handleAddSuggestion(s)}
                  disabled={previewTags.length >= MAX_TAGS}
                  clickable
                  sx={tagChipClickableSx}
                />
              ))}
            </div>
          </div>
        )}
        <FormControlLabel
          control={
            <Switch
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
          }
          label={isPublic ? "公開（其他人可見）" : "私密（僅自己可見）"}
          sx={{ mt: 1 }}
        />
        {error && !error.field && (
          <p className="mt-2 text-sm text-red-600">{error.message}</p>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting} color="inherit">
          取消
        </Button>
        <Button
          onClick={handleSubmit}
          loading={submitting}
          variant="contained"
          color="primary"
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
