import DispatchSubNav from "@/components/dispatch/DispatchSubNav";

export default function LoadsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-mx-3 -mt-4 flex min-h-0 flex-1 flex-col sm:-mx-4 lg:-mx-6 lg:-mt-6">
      <div className="border-b border-[#EAEAEA] bg-white px-3 py-3 sm:px-4 lg:px-6">
        <DispatchSubNav />
      </div>
      <div className="flex min-h-0 flex-1 flex-col bg-white">{children}</div>
    </div>
  );
}
