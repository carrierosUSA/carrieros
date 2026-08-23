"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getReceivablesAction, recordVerifiedInvoiceAction, recordVerifiedPaymentAction } from "@/app/actions/finance";
import Sidebar from "@/components/Sidebar";
import type { Receivable } from "@/lib/finance/receivables";

export default function FinancePage() {
  const [rows, setRows] = useState<Receivable[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "denied">("loading");
  const [selected, setSelected] = useState<Receivable | null>(null);
  const totals = useMemo(() => rows.reduce((value, row) => ({ billed: value.billed + (row.invoiceNumber ? row.rateCents : 0), paid: value.paid + row.paidCents, overdue: value.overdue + (isOverdue(row) ? row.rateCents - row.paidCents : 0) }), { billed: 0, paid: 0, overdue: 0 }), [rows]);

  useEffect(() => {
    getReceivablesAction().then((result) => {
      if (result.ok) { setRows(result.receivables); setState("ready"); }
      else setState("denied");
    }).catch(() => setState("denied"));
  }, []);

  return <main className="min-h-screen bg-[#F5F7FB] text-[#0B1220]">
    <Sidebar /><section className="ml-72 min-h-screen px-8 py-7 xl:px-10"><div className="mx-auto max-w-[1450px]">
      <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#2563EB]">Verified finance</p><h1 className="mt-2 text-[34px] font-semibold">Accounts receivable</h1><p className="mt-2 text-sm text-[#64748B]">Human-recorded invoices and confirmed payments only.</p></div><Link href="/documents" className="rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs font-semibold">Open Document Center</Link></header>
      {state === "denied" ? <Empty text="Finance is restricted to authenticated owners and accounting users." /> : state === "loading" ? <Empty text="Loading authorized financial records…" /> : <>
        <section className="mt-6 grid gap-4 md:grid-cols-3"><Metric label="Verified invoiced" value={money(totals.billed)} /><Metric label="Confirmed paid" value={money(totals.paid)} /><Metric label="Verified overdue" value={money(totals.overdue)} alert={totals.overdue > 0} /></section>
        <section className="mt-4 overflow-hidden rounded-[22px] border border-[#DDE5F0] bg-white"><div className="grid grid-cols-[1.2fr_1fr_.8fr_.9fr_.9fr_120px] gap-3 border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3 text-[10px] font-semibold uppercase tracking-[.12em] text-[#64748B]"><span>Load / broker</span><span>Invoice</span><span>Rate</span><span>Balance</span><span>Due</span><span>Status</span></div>
          {rows.length ? rows.map((row) => <button key={row.loadId} onClick={() => setSelected(row)} className="grid w-full grid-cols-[1.2fr_1fr_.8fr_.9fr_.9fr_120px] gap-3 border-b border-[#EEF2F7] px-5 py-4 text-left text-xs last:border-0 hover:bg-[#F8FAFC]"><span><b className="block text-[#0F172A]">{row.loadNumber || "Number pending"}</b><small className="mt-1 block text-[#64748B]">{row.brokerName || "Broker not recorded"}</small></span><span>{row.invoiceNumber || "Not issued"}</span><span>{money(row.rateCents, row.currency)}</span><span>{money(Math.max(0, row.rateCents - row.paidCents), row.currency)}</span><span className={isOverdue(row) ? "font-semibold text-[#B91C1C]" : ""}>{date(row.expectedPaymentAt)}</span><span><Badge status={row.paymentStatus} overdue={isOverdue(row)} /></span></button>) : <Empty text="No verified load financials are available yet." />}
        </section></>}
    </div></section>
    {selected && <FinanceEditor row={selected} onClose={() => setSelected(null)} onSaved={(next) => { setRows(next); setSelected(next.find((item) => item.loadId === selected.loadId) ?? null); }} />}
  </main>;
}

function FinanceEditor({ row, onClose, onSaved }: { row: Receivable; onClose: () => void; onSaved: (rows: Receivable[]) => void }) {
  const [invoiceNumber, setInvoiceNumber] = useState(""); const [issuedAt, setIssuedAt] = useState(""); const [terms, setTerms] = useState("30");
  const [amount, setAmount] = useState(""); const [paidAt, setPaidAt] = useState(""); const [reference, setReference] = useState(""); const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  async function invoice() { setBusy(true); setMessage(""); const result = await recordVerifiedInvoiceAction({ loadId: row.loadId, invoiceNumber, issuedAt, paymentTermsDays: Number(terms), requestId: crypto.randomUUID() }); if (result.ok) { onSaved(result.receivables); setMessage("Verified invoice recorded."); } else setMessage(result.error); setBusy(false); }
  async function payment() { const amountCents = Math.round(Number(amount) * 100); setBusy(true); setMessage(""); const result = await recordVerifiedPaymentAction({ loadId: row.loadId, amountCents, paidAt, paymentReference: reference, note, requestId: crypto.randomUUID() }); if (result.ok) { onSaved(result.receivables); setAmount(""); setReference(""); setNote(""); setMessage("Confirmed payment recorded."); } else setMessage(result.error); setBusy(false); }
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#0F172A]/45 p-5"><section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[24px] bg-white p-6 shadow-2xl"><div className="flex justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-[#2563EB]">Human approval</p><h2 className="mt-2 text-xl font-semibold">{row.loadNumber}</h2></div><button onClick={onClose} className="h-9 rounded-lg border px-3 text-xs font-semibold">Close</button></div>
    {!row.invoiceNumber ? <div className="mt-5 space-y-3"><h3 className="text-sm font-semibold">Record issued invoice</h3><p className="text-[11px] leading-5 text-[#64748B]">Requires a current approved invoice already linked to this delivered load.</p><Input label="Verified invoice number" value={invoiceNumber} onChange={setInvoiceNumber} /><Input label="Actual issue date" type="datetime-local" value={issuedAt} onChange={setIssuedAt} /><Input label="Payment terms (days)" type="number" value={terms} onChange={setTerms} /><Action disabled={busy || !invoiceNumber.trim() || !issuedAt} onClick={() => void invoice()} text={busy ? "Saving…" : "Approve invoice record"} /></div> : <div className="mt-5 space-y-3"><h3 className="text-sm font-semibold">Record confirmed payment</h3><div className="rounded-xl bg-[#EFF6FF] p-3 text-xs text-[#1D4ED8]">Outstanding: {money(Math.max(0, row.rateCents - row.paidCents), row.currency)}</div><Input label="Confirmed amount" type="number" value={amount} onChange={setAmount} /><Input label="Actual payment date" type="datetime-local" value={paidAt} onChange={setPaidAt} /><Input label="Bank / check / factoring reference" value={reference} onChange={setReference} /><Input label="Factual note" value={note} onChange={setNote} /><Action disabled={busy || !amount || !paidAt || !reference.trim() || row.paymentStatus === "paid"} onClick={() => void payment()} text={busy ? "Saving…" : "Approve payment record"} /><Link href={`/finance/invoice/${row.loadId}`} className="block w-full rounded-xl border border-[#173B70] px-4 py-2.5 text-center text-xs font-semibold text-[#173B70]">Open printable invoice / PDF</Link></div>}
    {message && <p className="mt-4 rounded-xl bg-[#F8FAFC] p-3 text-xs text-[#475569]">{message}</p>}<p className="mt-4 text-[11px] leading-5 text-[#64748B]">Nova does not issue invoices or mark payments automatically. A human must verify every financial change.</p></section></div>;
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) { return <label className="block text-[10px] font-semibold uppercase tracking-[.12em] text-[#64748B]"><span className="mb-1.5 block">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-[#CBD5E1] px-3 py-2.5 text-xs" /></label>; }
function Action({ disabled, onClick, text }: { disabled: boolean; onClick: () => void; text: string }) { return <button disabled={disabled} onClick={onClick} className="w-full rounded-xl bg-[#0F172A] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{text}</button>; }
function Metric({ label, value, alert = false }: { label: string; value: string; alert?: boolean }) { return <div className={`rounded-[20px] border p-5 ${alert ? "border-[#FCA5A5] bg-[#FEF2F2]" : "border-[#DDE5F0] bg-white"}`}><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#64748B]">{label}</p><p className={`mt-3 text-2xl font-semibold ${alert ? "text-[#B91C1C]" : ""}`}>{value}</p></div>; }
function Badge({ status, overdue }: { status: Receivable["paymentStatus"]; overdue: boolean }) { const label = overdue ? "overdue" : status; return <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${status === "paid" ? "bg-[#ECFDF5] text-[#047857]" : overdue ? "bg-[#FEE2E2] text-[#B91C1C]" : "bg-[#EFF6FF] text-[#1D4ED8]"}`}>{label}</span>; }
function Empty({ text }: { text: string }) { return <div className="m-5 rounded-xl bg-[#F8FAFC] p-8 text-center text-sm text-[#64748B]">{text}</div>; }
function isOverdue(row: Receivable) { return row.paymentStatus !== "paid" && Boolean(row.expectedPaymentAt && new Date(row.expectedPaymentAt).getTime() < Date.now()); }
function money(cents: number, currency = "USD") { return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100); }
function date(value?: string) { if (!value) return "Not set"; const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? "Not set" : new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(parsed); }
