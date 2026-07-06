import Link from "next/link";
import { redirect } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import { PublicHeader } from "@/components/PublicHeader";
import { getCopy, getLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";

type RegisterPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
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
        active="register"
        labels={{ login: t.common.login, register: t.common.register }}
        locale={locale}
        returnTo="/register"
      />

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:py-14">
        <div className="hidden rounded-lg border border-border bg-white p-5 shadow-panel lg:block">
          <p className="text-sm font-semibold text-muted">{t.auth.registerPanelEyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">{t.auth.registerPanelTitle}</h1>
          <div className="mt-6 space-y-3">
            <Feature text={t.auth.registerFeatureOne} />
            <Feature text={t.auth.registerFeatureTwo} />
            <Feature text={t.auth.registerFeatureThree} />
          </div>
        </div>

        <section className="w-full rounded-lg border border-border bg-white p-5 shadow-panel">
          <div className="mb-5">
            <p className="text-sm font-semibold text-muted">{t.common.appName}</p>
            <h2 className="mt-1 text-2xl font-semibold text-ink">{t.auth.registerTitle}</h2>
            <p className="mt-2 text-sm text-muted">{t.auth.registerSubtitle}</p>
          </div>

          {params?.error ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {params.error}
            </div>
          ) : null}

          <form action={registerAction} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-ink">{t.common.username}</span>
              <input
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-blue-100"
                name="username"
                type="text"
                autoComplete="username"
                minLength={3}
                maxLength={24}
                pattern="[A-Za-z0-9_]{3,24}"
                required
              />
              <span className="mt-1 block text-xs text-muted">{t.auth.usernameHelp}</span>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-ink">{t.common.email}</span>
              <input
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-blue-100"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-ink">{t.common.password}</span>
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
              {t.common.register}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
            <Link className="font-medium text-accent hover:underline" href="/login">
              {t.auth.loginInstead}
            </Link>
            <Link className="font-medium text-accent hover:underline" href="/verify-email">
              {t.auth.verifyEmail}
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-border p-3 text-sm text-muted">
      {text}
    </div>
  );
}
