import Skeleton from "@mui/material/Skeleton";
import PageShell from "@/components/layout/PageShell";
import OutfitCardSkeleton from "@/components/OutfitCardSkeleton";

export default function Loading() {
  return (
    <PageShell bg="soft">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 sm:mb-8">
        我的衣櫃
      </h1>
      <Skeleton variant="text" width={140} height={20} className="mb-3" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <OutfitCardSkeleton key={i} />
        ))}
      </div>
    </PageShell>
  );
}
