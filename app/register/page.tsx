import Link from "next/link";
import { redirect } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/session";

type RegisterPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <section className="w-full max-w-sm rounded-lg border border-border bg-white p-6 shadow-panel">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold text-muted">LogStudy</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">Tạo tài khoản</h1>
        </div>

        {params?.error ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {params.error}
          </div>
        ) : null}

        <form action={registerAction} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-ink">Email</span>
            <input
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-blue-100"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink">Password</span>
            <input
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-blue-100"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink">Confirm password</span>
            <input
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-blue-100"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          <button
            className="w-full rounded-md bg-success px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#116329] focus:outline-none focus:ring-2 focus:ring-emerald-200"
            type="submit"
          >
            Register
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Đã có tài khoản?{" "}
          <Link className="font-medium text-accent hover:underline" href="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
