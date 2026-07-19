import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AiSafetyProvider from "@/components/ai-safety/AiSafetyProvider";
import AppShell from "@/components/AppShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Transpo.ai",
    template: "%s · Transpo.ai",
  },
  description: "One Platform. Every Trucking Operation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AiSafetyProvider>
          <AppShell>{children}</AppShell>
        </AiSafetyProvider>
      </body>
    </html>
  );
}
