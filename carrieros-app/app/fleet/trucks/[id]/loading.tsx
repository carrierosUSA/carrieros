import TruckDetailSkeleton from "@/components/fleet/trucks/TruckDetailSkeleton";

export default function TruckDetailLoading() {
  return (
    <div className="min-h-[60vh] rounded-[16px] bg-[#F5F7FA] p-4 sm:p-5 lg:p-6">
      <TruckDetailSkeleton />
    </div>
  );
}
