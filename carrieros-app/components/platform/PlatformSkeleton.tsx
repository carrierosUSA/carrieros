import Skeleton from "@/components/ui/Skeleton";

export default function PlatformSkeleton() {
  return (
    <div className="w-full rounded-[16px] bg-white p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1560px] space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] w-full rounded-[12px]" />
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-[16px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
