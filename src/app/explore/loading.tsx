import Skeleton from "@mui/material/Skeleton";
import PageShell from "@/components/layout/PageShell";
import OutfitCardSkeleton from "@/components/OutfitCardSkeleton";

export default function Loading() {
  return (
    <PageShell bg="soft">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 sm:mb-8">
        探索搭配
      </h1>
      <div className="space-y-8">
        <div>
          <Skeleton
            variant="rectangular"
            height={40}
            sx={{ borderRadius: 1, mb: 2.5 }}
          />
          <Skeleton
            variant="rectangular"
            width={180}
            height={32}
            sx={{ borderRadius: 1, mb: 2.5 }}
          />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                width={60 + (i % 3) * 20}
                height={28}
                sx={{ borderRadius: 999 }}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <OutfitCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}
