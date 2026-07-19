import CustomersSubNav from "@/components/customers/CustomersSubNav";

export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <CustomersSubNav />
      {children}
    </div>
  );
}
