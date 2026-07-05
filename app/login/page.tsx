import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { PublicHeader } from "@/components/PublicHeader";
import { getCopy, getLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    registered?: string;
    reset?: string;
    verified?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
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
        active="login"
        labels={{ login: t.common.login, register: t.common.register }}
        locale={locale}
        returnTo="/login"
      />

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:py-14">
        <div className="hidden rounded-lg border border-border bg-white p-5 shadow-panel lg:block">
          <p className="text-sm font-semibold text-muted">{t.auth.welcomeBack}</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">{t.auth.loginHeadline}</h1>
          <div className="mt-6 grid gap-3">
            <div className="rounded-md border border-border p-3">
              <p className="text-sm font-semibold text-ink">{t.auth.currentStreak}</p>
              <p className="mt-1 text-2xl font-semibold text-success">{t.auth.sevenDays}</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="text-sm font-semibold text-ink">{t.auth.todayFocus}</p>
              <p className="mt-1 text-sm text-muted">{t.auth.todayFocusText}</p>
            </div>
          </div>
        </div>

        <section className="w-full rounded-lg border border-border bg-white p-5 shadow-panel">
          <div className="mb-5">
            <p className="text-sm font-semibold text-muted">{t.common.appName}</p>
            <h2 className="mt-1 text-2xl font-semibold text-ink">{t.auth.loginTitle}</h2>
          </div>

          {params?.registered ? (
            <Notice tone="success">{t.auth.registered}</Notice>
          ) : null}

          {params?.verified ? <Notice tone="success">{t.auth.verified}</Notice> : null}

          {params?.reset ? <Notice tone="success">{t.auth.resetDone}</Notice> : null}

          {params?.error ? <Notice tone="error">{params.error}</Notice> : null}

          <form action={loginAction} className="space-y-4">
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
                autoComplete="current-password"
                required
              />
            </label>

            <button
              className="w-full rounded-md bg-success px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#116329] focus:outline-none focus:ring-2 focus:ring-emerald-200"
              type="submit"
            >
              {t.common.login}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
            <Link className="font-medium text-accent hover:underline" href="/forgot-password">
              {t.auth.forgotPassword}
            </Link>
            <Link className="font-medium text-accent hover:underline" href="/register">
              {t.auth.createAccount}
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}

function Notice({ children, tone }: { children: React.ReactNode; tone: "success" | "error" }) {
  const className =
    tone === "success"
      ? "mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
      : "mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700";

  return <div className={className}>{children}</div>;
}
