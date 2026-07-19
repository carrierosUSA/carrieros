import DriversSubNav from "@/components/drivers/DriversSubNav";

export default function DriversLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-mx-3 -mt-4 flex min-h-0 flex-1 flex-col sm:-mx-4 lg:-mx-6 lg:-mt-6">
      <div className="border-b border-[#EAEAEA] bg-[#F5F7FA] px-3 py-3 sm:px-4 lg:px-6">
        <DriversSubNav />
      </div>
      <div className="flex min-h-0 flex-1 flex-col bg-[#F5F7FA]">{children}</div>
    </div>
  );
}
