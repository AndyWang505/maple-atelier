import Link from "next/link";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import PageShell from "@/components/layout/PageShell";

export default function NotFound() {
  return (
    <PageShell width="content" className="flex flex-col items-center text-center py-20 gap-6">
      <SearchOffIcon sx={{ fontSize: 56, color: "#a1a1aa" }} />
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">找不到頁面</h1>
        <p className="text-zinc-500">這個頁面不存在,或已被移除。</p>
      </div>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-full bg-zinc-900 text-white font-semibold hover:bg-zinc-800 transition no-underline"
      >
        回首頁
      </Link>
    </PageShell>
  );
}
