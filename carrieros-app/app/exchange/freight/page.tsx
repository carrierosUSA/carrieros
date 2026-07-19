import CatalogPage from "@/components/exchange/CatalogPage";

export default function Page() {
  return (
    <CatalogPage
      category="freight"
      title="Freight"
      description="Lane RFQs and freight opportunities. Soft-link to Dispatch / Loads."
      softLinks={[{ label: "Open Loads / Dispatch", href: "/loads" }]}
    />
  );
}
