import ExecutiveDashboardSkeleton from "@/components/executive/ExecutiveDashboardSkeleton";

export default function DashboardLoading() {
  return (
    <div className="w-full rounded-[16px] bg-white p-3 text-[#111827] sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1560px]">
        <ExecutiveDashboardSkeleton />
      </div>
    </div>
  );
}
