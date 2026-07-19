const ACCOUNTANT_SESSION_KEY = "carrieros.ifta.accountant.session";

export const IFTA_ACCOUNTANT_DEMO = {
  email: "accountant@carrieros.com",
  password: "demo1234",
  name: "Demo Accountant",
} as const;

export type IftaAccountantSession = {
  email: string;
  name: string;
  role: "accountant";
  authenticatedAt: string;
  readOnly: true;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getIftaAccountantSession(): IftaAccountantSession | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(ACCOUNTANT_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as IftaAccountantSession;
  } catch {
    return null;
  }
}

export function attemptIftaAccountantLogin(
  email: string,
  password: string,
): { ok: true; session: IftaAccountantSession } | { ok: false; error: string } {
  const normalized = email.trim().toLowerCase();
  if (
    normalized !== IFTA_ACCOUNTANT_DEMO.email ||
    password !== IFTA_ACCOUNTANT_DEMO.password
  ) {
    return { ok: false, error: "Invalid email or password." };
  }

  const session: IftaAccountantSession = {
    email: IFTA_ACCOUNTANT_DEMO.email,
    name: IFTA_ACCOUNTANT_DEMO.name,
    role: "accountant",
    authenticatedAt: new Date().toISOString(),
    readOnly: true,
  };

  if (canUseStorage()) {
    localStorage.setItem(ACCOUNTANT_SESSION_KEY, JSON.stringify(session));
  }
  return { ok: true, session };
}

export function clearIftaAccountantSession() {
  if (canUseStorage()) {
    localStorage.removeItem(ACCOUNTANT_SESSION_KEY);
  }
}
