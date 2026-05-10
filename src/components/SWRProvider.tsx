"use client";

import { type ReactNode } from "react";
import { SWRConfig } from "swr";
import { apiJson } from "@/lib/api/fetcher";

/**
 * 全域 SWR 設定。
 * - 預設 fetcher 用 apiJson(throw on non-2xx + parse JSON)
 * - dedupe 5s — 同 key 短時間內多次呼叫合併成一次
 * - 切回視窗自動 revalidate(SWR 預設行為)
 * - 失敗預設不 retry,UI 端決定要不要做(避免 spam)
 */
const config = {
  fetcher: (url: string) => apiJson(url),
  dedupingInterval: 5000,
  shouldRetryOnError: false,
} as const;

export default function SWRProvider({ children }: { children: ReactNode }) {
  return <SWRConfig value={config}>{children}</SWRConfig>;
}
