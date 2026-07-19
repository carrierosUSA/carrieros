import DocumentsSubNav from "@/components/documents/DocumentsSubNav";

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <DocumentsSubNav />
      {children}
    </div>
  );
}
