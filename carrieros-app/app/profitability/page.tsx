"use client";

import { useEffect, useState } from "react";
import { getTruckProfitabilityAction } from "@/app/actions/profitability";
import Sidebar from "@/components/Sidebar";
import type { TruckProfitability } from "@/lib/profitability/truck-profitability";

function initialPeriod() {
  const end = new Date();
  const start = new Date(end.getTime() - 29 * 86_400_000);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

export default function ProfitabilityPage() {
  const [initial] = useState(() => initialPeriod());
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);
  const [rows, setRows] = useState<TruckProfitability[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");

  async function load(nextStart = start, nextEnd = end) {
    setState("loading");
    const result = await getTruckProfitabilityAction({ start: nextStart, end: nextEnd });
    if (result.ok) { setRows(result.rows); setState("ready"); setMessage(""); }
    else { setState("error"); setMessage(result.error); }
  }
  useEffect(() => {
    getTruckProfitabilityAction({ start: initial.start, end: initial.end }).then((result) => {
      if (result.ok) { setRows(result.rows); setState("ready"); setMessage(""); }
      else { setState("error"); setMessage(result.error); }
    });
  }, [initial.end, initial.start]);

  const totals = rows.reduce((sum, row) => ({
    revenue: sum.revenue + row.revenueCents,
    expense: sum.expense + row.expenseCents,
    net: sum.net + row.netCents,
    loads: sum.loads + row.loadCount,
  }), { revenue: 0, expense: 0, net: 0, loads: 0 });
  const companyWide = rows[0]?.companyWideExpenseCents ?? 0;
  const missingRates = rows.reduce((sum, row) => sum + row.missingRateLoadCount, 0);
  const unmapped = rows[0]?.unmappedLoadCount ?? 0;

  return <main className="min-h-screen bg-[#F5F7FB] text-[#0F172A]">
    <Sidebar />
    <section className="ml-72 min-h-screen p-8"><div className="mx-auto max-w-[1400px]">
      <header className="flex items-end justify-between gap-5"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#2563EB]">Verified finance</p><h1 className="mt-2 text-3xl font-semibold">Truck Profitability</h1><p className="mt-2 text-sm text-[#64748B]">Earned load rates minus active truck-assigned expense ledger records.</p></div><div className="flex gap-2"><input aria-label="Start date" type="date" value={start} onChange={(event) => setStart(event.target.value)} className="rounded-xl border bg-white p-3 text-xs"/><input aria-label="End date" type="date" value={end} onChange={(event) => setEnd(event.target.value)} className="rounded-xl border bg-white p-3 text-xs"/><button onClick={() => void load()} className="rounded-xl bg-[#0F172A] px-4 text-xs font-semibold text-white">Calculate</button></div></header>
      <section className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4"><Metric label="Verified revenue" cents={totals.revenue}/><Metric label="Truck expenses" cents={totals.expense}/><Metric label="Truck contribution" cents={totals.net} alert={totals.net < 0}/><div className="rounded-[20px] border bg-white p-5"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#64748B]">Earned loads</p><p className="mt-3 text-2xl font-semibold">{totals.loads}</p></div></section>
      {(missingRates > 0 || unmapped > 0 || companyWide > 0) && <div className="mt-4 rounded-[18px] border border-[#FDE68A] bg-[#FFFBEB] p-4 text-xs leading-6 text-[#854D0E]">{missingRates > 0 && <p>{missingRates} earned load{missingRates === 1 ? " is" : "s are"} missing a verified rate and contribute $0.</p>}{unmapped > 0 && <p>{unmapped} earned load{unmapped === 1 ? " has" : "s have"} a truck unit not matched to the Fleet Registry and is excluded from truck totals.</p>}{companyWide > 0 && <p>{money(companyWide)} in company-wide expenses is shown separately and is not allocated to trucks.</p>}</div>}
      <section className="mt-4 overflow-hidden rounded-[22px] border bg-white"><div className="grid grid-cols-[1fr_.7fr_1fr_1fr_1fr_.7fr] bg-[#F8FAFC] p-4 text-[10px] font-semibold uppercase tracking-[.12em] text-[#64748B]"><span>Truck</span><span>Loads</span><span>Revenue</span><span>Expenses</span><span>Contribution</span><span>Margin</span></div>{state === "loading" ? <Empty text="Calculating verified truck profitability…"/> : state === "error" ? <Empty text={message}/> : rows.length ? rows.map((row) => { const margin = row.revenueCents > 0 ? row.netCents / row.revenueCents * 100 : null; return <div key={row.assetId} className="grid grid-cols-[1fr_.7fr_1fr_1fr_1fr_.7fr] border-t p-4 text-xs"><b>Unit {row.unitNumber}</b><span>{row.loadCount}</span><span>{money(row.revenueCents)}</span><span>{money(row.expenseCents)}</span><b className={row.netCents < 0 ? "text-[#B91C1C]" : "text-[#047857]"}>{money(row.netCents)}</b><span>{margin === null ? "Insufficient data" : `${margin.toFixed(1)}%`}</span></div>; }) : <Empty text="No verified trucks are available."/>}</section>
      <div className="mt-4 rounded-xl bg-white p-4 text-[11px] leading-5 text-[#64748B]"><p>This is an operational contribution view, not a tax return or accounting statement. Company-wide expenses are never allocated automatically.</p><p>Fuel-card/IFTA and payroll records are excluded unless separately entered in the Operating Expense Ledger, preventing automatic double counting. Missing rates remain visible as incomplete data.</p></div>
    </div></section>
  </main>;
}

function Metric({ label, cents, alert = false }: { label: string; cents: number; alert?: boolean }) { return <div className={`rounded-[20px] border p-5 ${alert ? "border-[#FCA5A5] bg-[#FEF2F2]" : "bg-white"}`}><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#64748B]">{label}</p><p className={`mt-3 text-2xl font-semibold ${alert ? "text-[#B91C1C]" : ""}`}>{money(cents)}</p></div>; }
function Empty({ text }: { text: string }) { return <p className="col-span-full p-10 text-center text-sm text-[#64748B]">{text}</p>; }
function money(cents: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100); }
