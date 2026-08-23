import Link from "next/link";
import Brand from "@/components/Brand";
const navItems = [
  { name: "Command Center", href: "/" },
  { name: "Alert Center", href: "/alerts" },
  { name: "Dispatch", href: "/dispatch" },
  { name: "Brokers", href: "/brokers" },
  { name: "Drivers", href: "/drivers" },
  { name: "Fleet", href: "/fleet" },
  { name: "Maintenance", href: "/maintenance" },
  { name: "Finance", href: "/finance" },
  { name: "Payroll", href: "/payroll" },
  { name: "Fuel & IFTA", href: "/ifta" },
  { name: "Documents", href: "/documents" },
  { name: "Analytics", href: "/analytics" },
  { name: "Nova AI", href: "/nova" },
  { name: "Settings", href: "/settings" },
];
export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-72 border-r border-gray-200 bg-white px-5 py-6">
      <div className="mb-10">
        <Brand />
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="block rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            {item.name}
          </a>
        ))}
      </nav>

      <Link href="/nova" className="absolute bottom-6 left-5 right-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 hover:border-blue-300">
        <p className="text-sm font-semibold text-blue-900">AI Partner</p>
        <p className="mt-1 text-sm text-blue-700">Ready to help.</p>
      </Link>
    </aside>
  );
}
