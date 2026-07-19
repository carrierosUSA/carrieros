import FleetSubNav from "@/components/fleet/FleetSubNav";
import TrailerDetailSkeleton from "@/components/fleet/trailers/TrailerDetailSkeleton";

export default function TrailerDetailLoading() {
  return (
    <div className="min-h-full bg-[#F5F7FA] p-4 lg:p-6">
      <div className="mb-6">
        <FleetSubNav />
      </div>
      <TrailerDetailSkeleton />
    </div>
  );
}
