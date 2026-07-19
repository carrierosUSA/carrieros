"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import IftaDashboardClient from "@/components/ifta/IftaDashboardClient";
import IftaDashboardSkeleton from "@/components/ifta/IftaDashboardSkeleton";
import { parseIftaView } from "@/components/ifta/IftaTabs";
import {
  attemptIftaAccountantLogin,
  clearIftaAccountantSession,
  getIftaAccountantSession,
  IFTA_ACCOUNTANT_DEMO,
  type IftaAccountantSession,
} from "@/lib/ifta/accountant-auth";

export default function IftaAccountantClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialView = parseIftaView(searchParams.get("view") ?? "export");

  const [session, setSession] = useState<IftaAccountantSession | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string>(IFTA_ACCOUNTANT_DEMO.email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSession(getIftaAccountantSession());
    setReady(true);
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const result = attemptIftaAccountantLogin(email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setSession(result.session);
  }

  function handleLogout() {
    clearIftaAccountantSession();
    setSession(null);
    setPassword("");
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] p-4 sm:p-6">
        <div className="mx-auto max-w-[1100px]">
          <IftaDashboardSkeleton />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA] px-4">
        <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] ring-1 ring-[#EAEAEA]">
          <p className="text-[12px] font-medium uppercase tracking-wide text-slate-400">
            Accountant portal
          </p>
          <h1 className="mt-1 text-[24px] font-bold text-slate-950">
            IFTA read-only access
          </h1>
          <p className="mt-2 text-[14px] font-medium text-slate-600">
            Download fuel, mileage, and quarter reports. No edits.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-3">
            <label className="block">
              <span className="text-[13px] font-medium text-slate-600">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-11 w-full rounded-[12px] bg-[#F8FAFC] px-3 text-[14px] font-medium text-slate-900 outline-none ring-1 ring-[#EAEAEA] focus:ring-2 focus:ring-[#93C5FD]"
                autoComplete="username"
              />
            </label>
            <label className="block">
              <span className="text-[13px] font-medium text-slate-600">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="demo1234"
                className="mt-1 h-11 w-full rounded-[12px] bg-[#F8FAFC] px-3 text-[14px] font-medium text-slate-900 outline-none ring-1 ring-[#EAEAEA] focus:ring-2 focus:ring-[#93C5FD]"
                autoComplete="current-password"
              />
            </label>
            {error ? (
              <p className="text-[13px] font-semibold text-[#DC2626]">{error}</p>
            ) : null}
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#2563EB] text-[14px] font-semibold text-white transition hover:bg-[#1D4ED8]"
            >
              Sign in
            </button>
          </form>

          <p className="mt-4 text-[12px] font-medium text-slate-500">
            Demo: {IFTA_ACCOUNTANT_DEMO.email} / {IFTA_ACCOUNTANT_DEMO.password}
          </p>
          <button
            type="button"
            onClick={() => router.push("/ifta")}
            className="mt-3 text-[13px] font-semibold text-[#2563EB]"
          >
            Back to IFTA center
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="border-b border-[#EAEAEA] bg-white">
        <div className="mx-auto flex max-w-[1560px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wide text-slate-400">
              Accountant portal · read-only
            </p>
            <h1 className="text-[20px] font-bold text-slate-950">
              IFTA reports
            </h1>
            <p className="text-[13px] font-medium text-slate-500">
              Signed in as {session.name}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => router.push("/ifta")}
              className="inline-flex h-9 items-center rounded-full bg-[#F8FAFC] px-4 text-[13px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA]"
            >
              Full IFTA center
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-9 items-center rounded-full bg-slate-950 px-4 text-[13px] font-semibold text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1560px] px-4 py-5 sm:px-6">
        <div className="rounded-[16px] bg-white p-4 sm:p-5 lg:p-6">
          <IftaDashboardClient
            initialView={initialView}
            initialQuarter="Q2"
            readOnly
            actorName={session.name}
          />
        </div>
      </main>
    </div>
  );
}
