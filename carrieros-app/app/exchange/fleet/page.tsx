import CatalogPage from "@/components/exchange/CatalogPage";

export default function Page() {
  return (
    <CatalogPage
      category="fleet"
      title="Fleet Marketplace"
      description="List capacity and fleet assets. Soft-links to Fleet when present."
      softLinks={[
        { label: "Open Fleet", href: "/fleet" },
        { label: "List your truck", href: "/fleet/trucks" },
      ]}
    />
  );
}
