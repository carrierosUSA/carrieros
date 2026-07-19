import type { Metadata, Viewport } from "next";
import DriverAppRoot from "@/components/driver-app/DriverAppRoot";

export const metadata: Metadata = {
  title: "Transpo Driver App™",
  description:
    "AI-powered trucking driver companion — trips, documents, wallet, payroll, and offline sync.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Transpo Driver",
  },
  formatDetection: {
    telephone: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F7FA" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0F14" },
  ],
};

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return <DriverAppRoot>{children}</DriverAppRoot>;
}
