import { Suspense } from "react";
import IftaDashboardClient from "@/components/ifta/IftaDashboardClient";
import IftaDashboardSkeleton from "@/components/ifta/IftaDashboardSkeleton";
import { parseIftaView } from "@/components/ifta/IftaTabs";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import { getCurrentSession } from "@/lib/auth/session";

type IftaPageProps = {
  searchParams: Promise<{ view?: string; quarter?: string }>;
};

export default async function IftaPage({ searchParams }: IftaPageProps) {
  const params = await searchParams;
  const initialView = parseIftaView(params.view);
  const session = getCurrentSession();
  const quarterParam = params.quarter?.toUpperCase();
  const initialQuarter =
    quarterParam === "Q1" ||
    quarterParam === "Q2" ||
    quarterParam === "Q3" ||
    quarterParam === "Q4"
      ? quarterParam
      : undefined;

  return (
    <OperationalPageShell
      title="IFTA"
      subtitle="Miles, fuel, and tax by truck and state — accountant-ready in one click."
      eyebrow="IFTA Management Center"
      action={
        <a
          href="/ifta/accountant"
          className="inline-flex h-9 items-center rounded-full bg-[#F8FAFC] px-4 text-[13px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA] transition hover:bg-white"
        >
          Accountant portal
        </a>
      }
    >
      <Suspense fallback={<IftaDashboardSkeleton />}>
        <IftaDashboardClient
          initialView={initialView}
          initialQuarter={initialQuarter}
          actorName={session.name}
        />
      </Suspense>
    </OperationalPageShell>
  );
}
