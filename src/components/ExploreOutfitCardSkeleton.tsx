import Skeleton from "@mui/material/Skeleton";

export default function ExploreOutfitCardSkeleton() {
  return (
    <div className="rounded-xl bg-white border border-zinc-200 overflow-hidden">
      <div className="aspect-square">
        <Skeleton variant="rectangular" sx={{ width: "100%", height: "100%" }} />
      </div>
      <div className="p-2 space-y-1">
        {/* title */}
        <Skeleton variant="text" width="72%" height={20} />
        {/* avatar + author name */}
        <div className="flex items-center gap-1">
          <Skeleton variant="circular" width={16} height={16} sx={{ flexShrink: 0 }} />
          <Skeleton variant="text" width="45%" height={16} />
        </div>
        {/* tags */}
        <div className="flex gap-1">
          <Skeleton variant="rounded" width={52} height={20} />
          <Skeleton variant="rounded" width={44} height={20} />
        </div>
        {/* like button */}
        <Skeleton variant="rounded" width={56} height={24} />
      </div>
    </div>
  );
}
