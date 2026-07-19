import Skeleton from "@/components/ui/Skeleton";

export default function JobDetailLoading() {
  return (
    <div className="w-full rounded-[16px] bg-white p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1560px] space-y-4">
        <Skeleton className="h-7 w-72" />
        <Skeleton className="h-9 w-full max-w-md rounded-full" />
        <Skeleton className="h-40 w-full rounded-[16px]" />
        <Skeleton className="h-64 w-full rounded-[16px]" />
      </div>
    </div>
  );
}
