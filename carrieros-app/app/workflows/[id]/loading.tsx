import Skeleton from "@/components/ui/Skeleton";

export default function WorkflowDetailLoading() {
  return (
    <div className="w-full rounded-[16px] bg-white p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1560px] space-y-4">
        <div className="h-[88px] rounded-[16px] bg-[#F5F7FA]" />
        <Skeleton className="h-40 rounded-[18px]" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-28 rounded-[18px]" />
          <Skeleton className="h-28 rounded-[18px]" />
          <Skeleton className="h-28 rounded-[18px]" />
        </div>
        <Skeleton className="h-64 rounded-[18px]" />
      </div>
    </div>
  );
}
