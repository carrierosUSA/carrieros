import Skeleton from "@/components/ui/Skeleton";

export default function BusinessDetailLoading() {
  return (
    <div className="w-full rounded-[16px] bg-white p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1560px] space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-[12px]" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-[16px]" />
      </div>
    </div>
  );
}
