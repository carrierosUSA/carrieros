"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  clearPortalSession,
  getPendingPortal2FA,
  verifyPortal2FA,
} from "@/lib/portal/session";
import { usePortal } from "@/components/portal/PortalProvider";

export default function PortalVerify2FAForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSession } = usePortal();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailHint, setEmailHint] = useState<string | null>(null);

  useEffect(() => {
    const pending = getPendingPortal2FA();
    if (!pending) {
      router.replace("/portal/login");
      return;
    }
    setEmailHint(pending.email);
  }, [router]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const result = verifyPortal2FA(code);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    refreshSession();
    router.replace(searchParams.get("next") || "/portal/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#6B7280]">
          Two-factor authentication
        </p>
        <h1 className="mt-2 text-[28px] font-bold tracking-tight">
          Enter verification code
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          {emailHint
            ? `We sent a code to ${emailHint}.`
            : "Enter the 6-digit code from your authenticator."}
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-3xl bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
      >
        <label className="block">
          <span className="carrieros-label text-[#374151]">6-digit code</span>
          <input
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="mt-1.5 h-12 w-full rounded-xl border border-[#DDE2EA] bg-[#F8F9FB] px-3 text-center text-xl font-semibold tracking-[0.35em] outline-none transition focus:border-[#2563EB] focus:bg-white"
            placeholder="••••••"
          />
        </label>

        {error ? (
          <p className="mt-3 rounded-xl bg-[#FEF2F2] px-3 py-2 text-sm font-medium text-[#B91C1C]">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-[#2563EB] text-sm font-semibold text-white hover:bg-[#1D4ED8]"
        >
          Verify and continue
        </button>

        <p className="mt-3 text-center text-[12px] text-[#6B7280]">
          Demo code: <strong>123456</strong>
        </p>

        <button
          type="button"
          onClick={() => {
            clearPortalSession();
            refreshSession();
            router.replace("/portal/login");
          }}
          className="mt-4 block w-full text-center text-sm font-semibold text-[#6B7280]"
        >
          Use a different account
        </button>

        <Link
          href="/portal/login"
          className="mt-2 block text-center text-sm font-semibold text-[#2563EB]"
        >
          Back to sign in
        </Link>
      </form>
    </div>
  );
}
