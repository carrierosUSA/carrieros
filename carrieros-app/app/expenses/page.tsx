"use client";

import { useEffect, useMemo, useState } from "react";
import { getExpensesAction, recordExpenseAction, voidExpenseAction } from "@/app/actions/expenses";
import Sidebar from "@/components/Sidebar";
import type { Expense } from "@/lib/expenses/ledger";
import type { FleetAsset } from "@/lib/fleet/assets";

const categories = ["fuel", "maintenance", "insurance", "tolls", "permits", "parking", "factoring", "software", "payroll", "other"];

export default function Page() {
  const [rows, setRows] = useState<Expense[]>([]);
  const [assets, setAssets] = useState<FleetAsset[]>([]);
  const [ready, setReady] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [voidTarget, setVoidTarget] = useState<Expense>();
  useEffect(() => {
    getExpensesAction().then((result) => {
      if (result.ok) { setRows(result.expenses); setAssets(result.assets); }
      setReady(true);
    });
  }, []);
  const active = useMemo(() => rows.filter((row) => row.status === "active"), [rows]);
  const total = active.reduce((sum, row) => sum + row.amountCents, 0);
  const update = (expenses: Expense[], nextAssets: FleetAsset[]) => {
    setRows(expenses);
    setAssets(nextAssets);
    setEditorOpen(false);
    setVoidTarget(undefined);
  };

  return <main className="min-h-screen bg-[#F5F7FB]">
    <Sidebar />
    <section className="px-4 pb-8 pt-20 lg:ml-72 lg:p-8"><div className="mx-auto max-w-[1300px]">
      <header className="flex justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#2563EB]">Verified finance</p><h1 className="mt-2 text-3xl font-semibold">Operating Expenses</h1><p className="mt-2 text-sm text-[#64748B]">Human-recorded costs only. No tax treatment inferred.</p></div>
        <button onClick={() => setEditorOpen(true)} className="h-fit rounded-xl bg-[#0F172A] px-4 py-3 text-xs font-semibold text-white">Record expense</button>
      </header>
      <div className="mt-6 rounded-[22px] border bg-white p-6"><p className="text-xs text-[#64748B]">Active recorded total</p><p className="mt-2 text-3xl font-semibold">{money(total)}</p></div>
      <section className="mt-4 overflow-hidden rounded-[22px] border bg-white">
        {ready ? (rows.length ? rows.map((row) => <div key={row.id} className="grid grid-cols-[1fr_.8fr_.7fr_.6fr_auto] items-center gap-3 border-b p-4 text-xs">
          <span><b className="capitalize">{row.category}</b><small className="block text-[#64748B]">{row.vendor || "Vendor not recorded"}</small></span>
          <span>{row.unitNumber ? `Unit ${row.unitNumber}` : "Company-wide"}</span><span>{row.incurredOn}</span>
          <b className={row.status === "voided" ? "text-[#94A3B8] line-through" : ""}>{money(row.amountCents)}</b>
          {row.status === "active" ? <button onClick={() => setVoidTarget(row)} className="rounded-lg border px-3 py-2 font-semibold text-[#B91C1C]">Void</button> : <span className="rounded-full bg-[#F1F5F9] px-3 py-2 text-[#64748B]">Voided</span>}
        </div>) : <Empty text="No verified expenses recorded." />) : <Empty text="Loading expenses…" />}
      </section>
      <p className="mt-4 text-[11px] text-[#64748B]">Verify receipts and avoid duplicate entry across Fuel, Maintenance, Payroll, and this ledger. Consult an accountant for tax treatment. Corrections void the record and preserve its audit history.</p>
    </div></section>
    {editorOpen && <Editor assets={assets} onClose={() => setEditorOpen(false)} onSaved={update} />}
    {voidTarget && <VoidEditor expense={voidTarget} onClose={() => setVoidTarget(undefined)} onSaved={update} />}
  </main>;
}

function Editor({ assets, onClose, onSaved }: { assets: FleetAsset[]; onClose: () => void; onSaved: (expenses: Expense[], assets: FleetAsset[]) => void }) {
  const [asset, setAsset] = useState(""); const [category, setCategory] = useState("other"); const [date, setDate] = useState(""); const [amount, setAmount] = useState(""); const [vendor, setVendor] = useState(""); const [reference, setReference] = useState(""); const [note, setNote] = useState(""); const [message, setMessage] = useState("");
  async function save() {
    const result = await recordExpenseAction({ assetId: asset || undefined, category, date, amountCents: Math.round(Number(amount) * 100), vendor, reference, note, requestId: crypto.randomUUID() });
    if (result.ok) onSaved(result.expenses, result.assets); else setMessage(result.error);
  }
  return <Modal title="Verified expense" onClose={onClose}>
    <select value={asset} onChange={(event) => setAsset(event.target.value)} className="mt-4 w-full rounded-xl border p-3 text-xs"><option value="">Company-wide</option>{assets.map((item) => <option key={item.id} value={item.id}>{item.unitNumber}</option>)}</select>
    <div className="mt-2 grid grid-cols-2 gap-2"><select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border p-3 text-xs">{categories.map((item) => <option key={item}>{item}</option>)}</select><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="rounded-xl border p-3 text-xs"/><input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount" className="rounded-xl border p-3 text-xs"/><input value={vendor} onChange={(event) => setVendor(event.target.value)} placeholder="Vendor" className="rounded-xl border p-3 text-xs"/><input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Receipt/reference" className="rounded-xl border p-3 text-xs"/><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Factual note" className="rounded-xl border p-3 text-xs"/></div>
    {message && <p className="mt-2 text-xs text-red-700">{message}</p>}<button disabled={!date || !amount || note.trim().length < 3} onClick={() => void save()} className="mt-3 w-full rounded-xl bg-[#0F172A] p-3 text-xs font-semibold text-white disabled:opacity-40">Record verified expense</button>
  </Modal>;
}

function VoidEditor({ expense, onClose, onSaved }: { expense: Expense; onClose: () => void; onSaved: (expenses: Expense[], assets: FleetAsset[]) => void }) {
  const [reason, setReason] = useState(""); const [message, setMessage] = useState("");
  async function submit() { const result = await voidExpenseAction({ expenseId: expense.id, reason, requestId: crypto.randomUUID() }); if (result.ok) onSaved(result.expenses, result.assets); else setMessage(result.error); }
  return <Modal title={`Void ${expense.category} expense`} onClose={onClose}><p className="mt-3 text-sm text-[#64748B]">This preserves the original record and appends a correction event.</p><textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Factual reason for correction" className="mt-3 min-h-24 w-full rounded-xl border p-3 text-xs"/>{message && <p className="mt-2 text-xs text-red-700">{message}</p>}<button disabled={reason.trim().length < 3} onClick={() => void submit()} className="mt-3 w-full rounded-xl bg-[#B91C1C] p-3 text-xs font-semibold text-white disabled:opacity-40">Void and preserve history</button></Modal>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-5"><div className="w-full max-w-xl rounded-[24px] bg-white p-6"><div className="flex justify-between"><h2 className="text-xl font-semibold">{title}</h2><button onClick={onClose}>Close</button></div>{children}</div></div>; }
function Empty({ text }: { text: string }) { return <p className="p-10 text-center text-sm text-[#64748B]">{text}</p>; }
function money(cents: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100); }
