import CatalogPage from "@/components/exchange/CatalogPage";

export default function Page() {
  return (
    <CatalogPage
      category="business_services"
      title="Business Services"
      description="Insurance, factoring, fuel cards, payroll, accounting, legal, permits, recruiting, software, and AI."
      softLinks={[{ label: "Hire via Workforce", href: "/workforce" }]}
    />
  );
}
