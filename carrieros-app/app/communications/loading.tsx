import CommunicationsSkeleton from "@/components/communications/CommunicationsSkeleton";

export default function CommunicationsLoading() {
  return (
    <div className="w-full rounded-[16px] bg-white p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1560px] space-y-4">
        <div className="h-[88px] rounded-[16px] bg-[#F5F7FA]" />
        <CommunicationsSkeleton />
      </div>
    </div>
  );
}
