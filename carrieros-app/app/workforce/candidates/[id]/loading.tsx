import Skeleton from "@/components/ui/Skeleton";

export default function CandidateDetailLoading() {
  return (
    <div className="w-full rounded-[16px] bg-white p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1560px] space-y-4">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-24 w-full rounded-[12px]" />
        <Skeleton className="h-16 w-full rounded-[12px]" />
        <Skeleton className="h-16 w-full rounded-[12px]" />
        <Skeleton className="h-16 w-full rounded-[12px]" />
      </div>
    </div>
  );
}
