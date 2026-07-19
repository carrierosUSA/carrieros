"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { requestPortalPasswordReset } from "@/lib/portal/session";

export default function PortalForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const result = requestPortalPasswordReset(email);
    setMessage(result.message);
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#6B7280]">
          Transpo.ai Portal
        </p>
        <h1 className="mt-2 text-[28px] font-bold tracking-tight">
          Reset password
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          We&apos;ll email a secure reset link to your company account.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-3xl bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
      >
        <label className="block">
          <span className="carrieros-label text-[#374151]">Work email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-xl border border-[#DDE2EA] bg-[#F8F9FB] px-3 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white"
            placeholder="you@company.com"
          />
        </label>

        {message ? (
          <p className="mt-3 rounded-xl bg-[#ECFDF3] px-3 py-2 text-sm font-medium text-[#166534]">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-[#2563EB] text-sm font-semibold text-white hover:bg-[#1D4ED8]"
        >
          Send reset link
        </button>

        <Link
          href="/portal/login"
          className="mt-4 block text-center text-sm font-semibold text-[#2563EB]"
        >
          Back to sign in
        </Link>
      </form>
    </div>
  );
}
