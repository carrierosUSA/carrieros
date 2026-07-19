import TripDetail from "@/components/driver-app/TripDetail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DriverTripDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <TripDetail tripId={id} />;
}
