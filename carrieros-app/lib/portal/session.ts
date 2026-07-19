import {
  DEMO_2FA_CODE,
  getPortalCompanyById,
  getPortalUserByEmail,
} from "@/lib/portal/seed";
import type { PortalSession, PortalUser } from "@/lib/portal/types";

const SESSION_KEY = "carrieros.portal.session";
const PENDING_KEY = "carrieros.portal.pending2fa";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readJson<T>(key: string): T | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown | null) {
  if (!canUseStorage()) return;
  if (value === null) {
    localStorage.removeItem(key);
    return;
  }
  localStorage.setItem(key, JSON.stringify(value));
}

export function buildPortalSession(
  user: PortalUser,
  opts?: { pending2FA?: boolean },
): PortalSession | null {
  const company = getPortalCompanyById(user.companyId);
  if (!company) return null;
  return {
    userId: user.id,
    companyId: company.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyName: company.name,
    companyType: company.type,
    linkedBrokerId: company.linkedBrokerId,
    linkedCustomerId: company.linkedCustomerId,
    directoryCompanyId: company.directoryCompanyId,
    pending2FA: opts?.pending2FA ?? false,
    authenticatedAt: new Date().toISOString(),
  };
}

export type PortalLoginResult =
  | { ok: true; session: PortalSession; requires2FA: true }
  | { ok: true; session: PortalSession; requires2FA: false }
  | { ok: false; error: string };

export function attemptPortalLogin(
  email: string,
  password: string,
): PortalLoginResult {
  const user = getPortalUserByEmail(email);
  if (!user || user.password !== password) {
    return { ok: false, error: "Invalid email or password." };
  }
  const session = buildPortalSession(user, { pending2FA: true });
  if (!session) {
    return { ok: false, error: "Company account is unavailable." };
  }
  writeJson(PENDING_KEY, session);
  writeJson(SESSION_KEY, null);
  return { ok: true, session, requires2FA: true };
}

export function verifyPortal2FA(code: string): PortalLoginResult {
  const pending = readJson<PortalSession>(PENDING_KEY);
  if (!pending) {
    return { ok: false, error: "No pending verification. Sign in again." };
  }
  if (code.trim() !== DEMO_2FA_CODE) {
    return { ok: false, error: "Invalid verification code." };
  }
  const session: PortalSession = {
    ...pending,
    pending2FA: false,
    authenticatedAt: new Date().toISOString(),
  };
  writeJson(SESSION_KEY, session);
  writeJson(PENDING_KEY, null);
  return { ok: true, session, requires2FA: false };
}

export function getPortalSession(): PortalSession | null {
  const session = readJson<PortalSession>(SESSION_KEY);
  if (!session || session.pending2FA) return null;
  return session;
}

export function getPendingPortal2FA(): PortalSession | null {
  return readJson<PortalSession>(PENDING_KEY);
}

export function clearPortalSession() {
  writeJson(SESSION_KEY, null);
  writeJson(PENDING_KEY, null);
}

export function requestPortalPasswordReset(email: string): {
  ok: boolean;
  message: string;
} {
  const user = getPortalUserByEmail(email);
  if (!user) {
    return {
      ok: true,
      message:
        "If an account exists for that email, reset instructions were sent.",
    };
  }
  return {
    ok: true,
    message: `Reset link sent to ${user.email}. For demo, keep using password demo1234.`,
  };
}
