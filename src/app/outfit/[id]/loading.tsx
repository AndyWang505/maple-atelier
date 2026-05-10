import Skeleton from "@mui/material/Skeleton";
import PageShell from "@/components/layout/PageShell";

export default function Loading() {
  return (
    <PageShell width="content" bg="soft">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width={120} sx={{ fontSize: "0.875rem" }} />
        </div>

        <Skeleton
          variant="rectangular"
          height={320}
          sx={{ borderRadius: 1.5, width: "100%" }}
        />

        <div className="flex flex-wrap gap-2">
          <Skeleton variant="rounded" width={140} height={36} />
          <Skeleton variant="rounded" width={120} height={36} />
        </div>

        <div className="flex items-center justify-between gap-3">
          <Skeleton variant="text" width="55%" sx={{ fontSize: "1.5rem" }} />
          <Skeleton variant="rounded" width={84} height={36} />
        </div>

        <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />

        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              width={56}
              height={24}
              sx={{ borderRadius: 999 }}
            />
          ))}
        </div>
      </div>
    </PageShell>
  );
}
