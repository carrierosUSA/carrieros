"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { attemptPortalLogin } from "@/lib/portal/session";
import { usePortal } from "@/components/portal/PortalProvider";

export default function PortalLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSession } = usePortal();
  const [email, setEmail] = useState("broker@freightline.com");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = attemptPortalLogin(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    refreshSession();
    if (result.requires2FA) {
      const next = searchParams.get("next");
      router.push(
        next
          ? `/portal/verify-2fa?next=${encodeURIComponent(next)}`
          : "/portal/verify-2fa",
      );
      return;
    }
    router.replace(searchParams.get("next") || "/portal/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#6B7280]">
          Transpo.ai
        </p>
        <h1 className="mt-2 text-[28px] font-bold tracking-tight text-[#111827]">
          Broker & Shipper Portal
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Manage loads, tracking, documents, and invoices online.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-3xl bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
      >
        <label className="block">
          <span className="carrieros-label text-[#374151]">Email</span>
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-xl border border-[#DDE2EA] bg-[#F8F9FB] px-3 text-sm text-[#111827] outline-none transition focus:border-[#2563EB] focus:bg-white"
          />
        </label>
        <label className="mt-4 block">
          <span className="carrieros-label text-[#374151]">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-xl border border-[#DDE2EA] bg-[#F8F9FB] px-3 text-sm text-[#111827] outline-none transition focus:border-[#2563EB] focus:bg-white"
          />
        </label>

        {error ? (
          <p className="mt-3 rounded-xl bg-[#FEF2F2] px-3 py-2 text-sm font-medium text-[#B91C1C]">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-[#2563EB] text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in securely"}
        </button>

        <div className="mt-4 flex items-center justify-between text-sm">
          <Link
            href="/portal/forgot-password"
            className="font-semibold text-[#2563EB] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </form>

      <div className="mt-6 rounded-2xl bg-white/80 px-4 py-4 text-sm text-[#4B5563] shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <p className="font-semibold text-[#111827]">Demo credentials</p>
        <ul className="mt-2 space-y-1.5">
          <li>
            Broker admin:{" "}
            <code className="rounded bg-[#F3F4F6] px-1.5 py-0.5 text-[12px]">
              broker@freightline.com
            </code>{" "}
            /{" "}
            <code className="rounded bg-[#F3F4F6] px-1.5 py-0.5 text-[12px]">
              demo1234
            </code>
          </li>
          <li>
            Shipper dispatcher:{" "}
            <code className="rounded bg-[#F3F4F6] px-1.5 py-0.5 text-[12px]">
              shipping@retailhub.com
            </code>{" "}
            /{" "}
            <code className="rounded bg-[#F3F4F6] px-1.5 py-0.5 text-[12px]">
              demo1234
            </code>
          </li>
          <li>
            Read only:{" "}
            <code className="rounded bg-[#F3F4F6] px-1.5 py-0.5 text-[12px]">
              viewer@freightline.com
            </code>{" "}
            /{" "}
            <code className="rounded bg-[#F3F4F6] px-1.5 py-0.5 text-[12px]">
              demo1234
            </code>
          </li>
        </ul>
        <p className="mt-2 text-[12px] text-[#6B7280]">
          After password, enter 2FA code <strong>123456</strong>.
        </p>
      </div>
    </div>
  );
}
