import Skeleton from "@/components/ui/Skeleton";

export default function FleetLoading() {
  return (
    <div className="w-full rounded-[16px] bg-white p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1560px] space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-[112px] shrink-0 rounded-[12px]" />
          ))}
        </div>
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-[16px]" />
        </div>
      </div>
    </div>
  );
}
