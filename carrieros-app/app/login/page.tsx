import Link from "next/link";
import { loginAction } from "@/app/login/actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; status?: string; next?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  configuration: "Authentication is not configured for this environment.",
  invalid_credentials: "The email or password was not accepted.",
  invalid_session: "Your session could not be verified. Please sign in again.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const message = params.error
    ? ERROR_MESSAGES[params.error] ?? "Sign-in failed. Please try again."
    : params.status === "signed_out"
      ? "You have been signed out."
      : null;

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-12">
      <section className="w-full rounded-[20px] bg-white p-6 ring-1 ring-[#E2E8F0] sm:p-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#2563EB]">
          Transpo.ai security
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#0F172A]">
          Sign in
        </h1>
        <p className="mt-2 text-[14px] leading-6 text-[#64748B]">
          Use your authorized company account to access document intake.
        </p>

        {message ? (
          <p className="mt-4 rounded-[12px] bg-[#FFF7ED] px-4 py-3 text-[13px] text-[#9A3412]">
            {message}
          </p>
        ) : null}

        <form action={loginAction} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={params.next ?? "/documents"} />
          <label className="block text-[13px] font-semibold text-[#334155]">
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-2 h-11 w-full rounded-[12px] border border-[#CBD5E1] px-3 text-[14px] outline-none focus:border-[#2563EB]"
            />
          </label>
          <label className="block text-[13px] font-semibold text-[#334155]">
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-2 h-11 w-full rounded-[12px] border border-[#CBD5E1] px-3 text-[14px] outline-none focus:border-[#2563EB]"
            />
          </label>
          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center rounded-[12px] bg-[#2563EB] px-4 text-[14px] font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            Sign in securely
          </button>
        </form>

        <Link href="/" className="mt-5 inline-flex text-[13px] font-semibold text-[#2563EB]">
          Return home
        </Link>
      </section>
    </main>
  );
}
