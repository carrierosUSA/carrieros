import DocumentDetailSkeleton from "@/components/documents/center/DocumentDetailSkeleton";

export default function DocumentDetailLoading() {
  return (
    <div className="w-full rounded-[16px] bg-white p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1560px]">
        <DocumentDetailSkeleton />
      </div>
    </div>
  );
}
