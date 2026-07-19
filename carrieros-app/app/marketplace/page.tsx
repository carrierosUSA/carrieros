import DetailSlideOver, { DetailGrid, DetailSection } from "@/components/premium/DetailSlideOver";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import OperationalTable from "@/components/premium/OperationalTable";
import PremiumMetricCard from "@/components/premium/MetricCard";
import PremiumStatusBadge from "@/components/premium/StatusBadge";
import TablePagination from "@/components/premium/TablePagination";
import TableToolbar from "@/components/premium/TableToolbar";

const marketplaceRows = [
  { category: "Truck Parts", partner: "Parts purchasing", coverage: "Engine, brakes, filters", status: "ready" },
  { category: "Tires", partner: "Tire marketplace", coverage: "Steer, drive, trailer", status: "ready" },
  { category: "Repair Shops", partner: "Verified mechanics", coverage: "PM, diagnostics, repairs", status: "network" },
  { category: "Roadside Assistance", partner: "Towing and mobile repair", coverage: "Breakdown support", status: "network" },
  { category: "Fuel Discounts", partner: "Fuel partners", coverage: "Fuel savings and cards", status: "planned" },
  { category: "Insurance Partners", partner: "Carrier vendor marketplace", coverage: "Fleet insurance", status: "planned" },
];

type MarketplacePageProps = {
  searchParams: Promise<{ details?: string }>;
};

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const params = await searchParams;
  const selectedRow = params.details
    ? marketplaceRows.find((row) => row.category === params.details)
    : undefined;

  return (
    <OperationalPageShell
      title="Marketplace"
      subtitle="Parts, tires, repair shops, mechanics, roadside assistance, parking, towing, fuel discounts, and insurance partner readiness."
      eyebrow="Vendor Network"
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <PremiumMetricCard label="Categories" value={marketplaceRows.length.toString()} detail="Vendor surfaces" accent="blue" />
        <PremiumMetricCard label="Parts & Tires" value="2" detail="Purchase workflows" accent="emerald" />
        <PremiumMetricCard label="Roadside" value="Ready" detail="Workflow placeholder" accent="amber" />
        <PremiumMetricCard label="Partners" value="Network" detail="Future vendor APIs" accent="slate" />
      </div>

      <div className="mt-4 overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
        <TableToolbar
          title="Marketplace Network"
          resultCount={marketplaceRows.length}
          searchPlaceholder="Search parts, services, vendors..."
          filters={["All", "Parts", "Service", "Roadside", "Insurance"]}
          activeFilter="All"
          bulkActionLabel="Request vendor"
        />
        <OperationalTable
          rows={marketplaceRows}
          getRowKey={(row) => row.category}
          getRowHref={(row) => `/marketplace?details=${encodeURIComponent(row.category)}`}
          emptyTitle="No marketplace categories"
          columns={[
            { key: "category", label: "Category", render: (row) => <span className="font-semibold text-slate-950">{row.category}</span> },
            { key: "partner", label: "Partner Type", render: (row) => row.partner },
            { key: "coverage", label: "Coverage", render: (row) => row.coverage },
            {
              key: "status",
              label: "Status",
              render: (row) => (
                <PremiumStatusBadge
                  label={row.status}
                  tone={row.status === "ready" ? "green" : row.status === "network" ? "blue" : "slate"}
                />
              ),
            },
            { key: "actions", label: "Actions", align: "center", render: () => "Open" },
          ]}
        />
        <TablePagination total={marketplaceRows.length} />
      </div>
      {selectedRow ? (
        <DetailSlideOver
          title={selectedRow.category}
          subtitle={selectedRow.partner}
          closeHref="/marketplace"
        >
          <DetailSection title="Marketplace Detail">
            <DetailGrid
              items={[
                { label: "Category", value: selectedRow.category },
                { label: "Partner Type", value: selectedRow.partner },
                { label: "Coverage", value: selectedRow.coverage },
                { label: "Status", value: selectedRow.status },
              ]}
            />
          </DetailSection>
          <DetailSection title="Actions & Notes">
            <p className="text-sm leading-6 text-slate-600">
              Vendor profile, quotes, request workflow, partner notes, and Alph recommendations will attach to this marketplace category.
            </p>
          </DetailSection>
        </DetailSlideOver>
      ) : null}
    </OperationalPageShell>
  );
}
