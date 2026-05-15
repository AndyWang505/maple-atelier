"use client";

import Link from "next/link";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import PageShell from "@/components/layout/PageShell";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageShell width="content" className="flex flex-col items-center text-center py-20 gap-6">
      <ErrorOutlinedIcon sx={{ fontSize: 56, color: "#c8423d" }} />
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">出了點問題</h1>
        <p className="text-zinc-500">頁面發生非預期錯誤,請重試或回首頁。</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-full bg-maple-red text-white font-semibold hover:opacity-90 transition"
        >
          重試
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-full bg-zinc-900 text-white font-semibold hover:bg-zinc-800 transition no-underline"
        >
          回首頁
        </Link>
      </div>
    </PageShell>
  );
}
