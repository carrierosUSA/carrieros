"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Brand from "@/components/Brand";

const groups = [
  { label: "Operations", items: [
    { name: "Command Center", href: "/" }, { name: "Alert Center", href: "/alerts" },
    { name: "Dispatch", href: "/dispatch" }, { name: "Schedule", href: "/schedule" },
    { name: "Documents", href: "/documents" },
  ] },
  { label: "Fleet & Safety", items: [
    { name: "Drivers", href: "/drivers" }, { name: "Fleet", href: "/fleet" },
    { name: "Maintenance", href: "/maintenance" }, { name: "Compliance", href: "/compliance" },
    { name: "Reefer Logs", href: "/reefer" },
    { name: "Incidents & Claims", href: "/claims" }, { name: "Inventory", href: "/inventory" },
  ] },
  { label: "Finance", items: [
    { name: "Finance", href: "/finance" }, { name: "Expenses", href: "/expenses" },
    { name: "Truck P&L", href: "/profitability" }, { name: "Payroll", href: "/payroll" },
    { name: "Fuel & IFTA", href: "/ifta" },
    { name: "Year-End Records", href: "/year-end" },
  ] },
  { label: "Network", items: [
    { name: "Brokers", href: "/brokers" }, { name: "Broker Performance", href: "/broker-performance" },
    { name: "Shippers & Facilities", href: "/facilities" },
    { name: "Service Providers", href: "/providers" },
  ] },
  { label: "Intelligence", items: [
    { name: "Analytics", href: "/analytics" }, { name: "Lane Performance", href: "/lanes" },
    { name: "Nova AI", href: "/nova" },
    { name: "Settings", href: "/settings" }, { name: "System Readiness", href: "/system-readiness" },
  ] },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <>
    <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-[#DDE5F0] bg-white px-4 lg:hidden">
      <Brand />
      <button type="button" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)} className="rounded-xl border border-[#DDE5F0] px-3 py-2 text-sm font-semibold">Menu</button>
    </header>
    {open && <button type="button" aria-label="Close navigation overlay" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-[#0F172A]/40 lg:hidden" />}
    <aside aria-label="Primary navigation" className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#DDE5F0] bg-white transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center justify-between px-5 py-5">
        <Brand />
        <button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="rounded-lg border px-3 py-2 text-xs font-semibold lg:hidden">Close</button>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto px-4 pb-5" aria-label="Application modules">
        {groups.map((group) => <section key={group.label} className="mb-5">
          <p className="mb-1 px-3 text-[9px] font-semibold uppercase tracking-[.18em] text-[#94A3B8]">{group.label}</p>
          <div className="space-y-1">{group.items.map((item) => { const active = isActive(pathname, item.href); return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)} className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${active ? "bg-[#0F172A] text-white" : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"}`}>{item.name}</Link>; })}</div>
        </section>)}
        <Link href="/nova" onClick={() => setOpen(false)} className="block rounded-2xl border border-blue-100 bg-blue-50 p-4 hover:border-blue-300"><p className="text-sm font-semibold text-blue-900">Nova AI Partner</p><p className="mt-1 text-xs text-blue-700">Assistive and read-only.</p></Link>
      </nav>
    </aside>
  </>;
}
