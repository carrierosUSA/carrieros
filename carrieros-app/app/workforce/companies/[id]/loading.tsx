import Skeleton from "@/components/ui/Skeleton";

export default function CompanyDetailLoading() {
  return (
    <div className="w-full rounded-[16px] bg-white p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1560px] space-y-4">
        <Skeleton className="h-7 w-64" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-[12px]" />
          ))}
        </div>
        <Skeleton className="h-48 w-full rounded-[16px]" />
      </div>
    </div>
  );
}
