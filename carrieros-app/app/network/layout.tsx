import AdvancedSubNav from "@/components/advanced/AdvancedSubNav";

export default function NetworkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <AdvancedSubNav />
      {children}
    </div>
  );
}
