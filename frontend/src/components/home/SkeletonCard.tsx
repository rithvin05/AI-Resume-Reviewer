import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <div className="w-2/5 flex flex-col space-y-6">
      <Skeleton label="Generating AI Feedback..." className="h-[94px] w-full rounded-[20px] bg-[#afc3d0]" />
      <Skeleton className="h-[10vh] w-full rounded-[10px] bg-[#afc3d0]" />
      <Skeleton className="h-[55vh] w-full rounded-[10px] bg-[#afc3d0]" />
    </div>
  );
}
