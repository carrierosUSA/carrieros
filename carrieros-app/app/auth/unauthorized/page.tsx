import { logoutAction } from "@/app/login/actions";

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center px-4 py-12">
      <section className="w-full rounded-[20px] bg-white p-7 ring-1 ring-[#FDE68A]">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#A16207]">
          Access restricted
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[#0F172A]">
          Your role is not authorized
        </h1>
        <p className="mt-3 text-[14px] leading-6 text-[#64748B]">
          Your authenticated account does not have a recognized Transpo.ai business role. Contact an administrator for access.
        </p>
        <form action={logoutAction} className="mt-6">
          <button type="submit" className="h-10 rounded-[12px] bg-[#0F172A] px-4 text-[13px] font-semibold text-white">
            Sign out
          </button>
        </form>
      </section>
    </main>
  );
}
