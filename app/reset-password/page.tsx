import Link from "next/link";
import { redirect } from "next/navigation";
import { resetPasswordAction } from "@/app/actions/auth";
import { PublicHeader } from "@/components/PublicHeader";
import { getCopy, getLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";

type ResetPasswordPageProps = {
  searchParams?: Promise<{
    email?: string;
    error?: string;
    debugCode?: string;
    sent?: string;
  }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const locale = await getLocale();
  const t = getCopy(locale);

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-canvas">
      <PublicHeader
        labels={{ login: t.common.login, register: t.common.register }}
        locale={locale}
        returnTo="/reset-password"
      />
      <section className="mx-auto mt-10 w-full max-w-sm rounded-lg border border-border bg-white p-6 shadow-panel">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold text-muted">{t.common.appName}</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">{t.auth.resetTitle}</h1>
          <p className="mt-2 text-sm text-muted">{t.auth.resetSubtitle}</p>
        </div>

        {params?.sent ? (
          <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {t.auth.resetSent}
          </div>
        ) : null}

        {params?.debugCode ? (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {t.auth.testCode} <span className="font-semibold tracking-wide">{params.debugCode}</span>
          </div>
        ) : null}

        {params?.error ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {params.error}
          </div>
        ) : null}

        <form action={resetPasswordAction} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-ink">{t.common.email}</span>
            <input
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-blue-100"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={params?.email ?? ""}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink">{t.common.code}</span>
            <input
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-blue-100"
              name="code"
              inputMode="numeric"
              maxLength={6}
              minLength={6}
              pattern="[0-9]{6}"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink">{t.auth.newPassword}</span>
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
            <span className="text-sm font-medium text-ink">{t.common.confirmPassword}</span>
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
            {t.auth.resetPassword}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          {t.auth.needCode}{" "}
          <Link className="font-medium text-accent hover:underline" href="/forgot-password">
            {t.auth.requestReset}
          </Link>
        </p>
      </section>
    </main>
  );
}
