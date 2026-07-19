import Skeleton from "@/components/ui/Skeleton";

export default function ProfessionalDetailLoading() {
  return (
    <div className="w-full rounded-[16px] bg-white p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1560px] space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-14 w-14 rounded-[14px]" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
        </div>
        <Skeleton className="h-40 w-full rounded-[16px]" />
        <Skeleton className="h-56 w-full rounded-[16px]" />
      </div>
    </div>
  );
}
