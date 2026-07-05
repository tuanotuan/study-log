import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicHeader } from "@/components/PublicHeader";
import { getCopy, getLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";

const previewDays = [
  0, 1, 0, 2, 3, 0, 1, 1, 0, 4, 2, 0, 0, 1, 3, 5, 0, 2, 1, 0, 4, 0, 2, 3, 1, 0, 0, 5,
  3, 2, 0, 1, 4, 2, 1, 0, 0, 3, 2, 5, 4, 1
];

function graphClass(count: number) {
  if (count === 0) {
    return "bg-[#ebedf0]";
  }

  if (count === 1) {
    return "bg-[#9be9a8]";
  }

  if (count <= 3) {
    return "bg-[#40c463]";
  }

  return "bg-[#216e39]";
}

export default async function HomePage() {
  const user = await getCurrentUser();
  const locale = await getLocale();
  const t = getCopy(locale);

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-white">
      <PublicHeader
        labels={{ login: t.common.login, register: t.common.register }}
        locale={locale}
        returnTo="/"
      />

      <section className="border-b border-border bg-canvas">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:py-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-success">
              {t.home.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              {t.home.headline}
            </h1>
            <p className="mt-4 text-base leading-7 text-muted">
              {t.home.description}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                className="rounded-md bg-success px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#116329]"
                href="/register"
              >
                {t.home.primary}
              </Link>
              <Link
                className="rounded-md border border-border bg-white px-4 py-2.5 text-center text-sm font-semibold text-ink transition hover:bg-gray-50"
                href="/login"
              >
                {t.home.secondary}
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-white p-4 shadow-panel">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="text-sm font-semibold text-ink">{t.home.previewTitle}</p>
                <p className="text-xs text-muted">{t.home.previewSubtitle}</p>
              </div>
              <span className="rounded-md bg-canvas px-2.5 py-1 text-xs font-medium text-muted">
                {t.home.commits}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1">
              {previewDays.map((count, index) => (
                <span
                  aria-hidden="true"
                  className={`h-4 rounded-[3px] ${graphClass(count)}`}
                  key={`${count}-${index}`}
                />
              ))}
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">{t.home.sampleOne}</p>
                  <span className="text-xs text-muted">{t.home.today}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{t.home.sampleOneNote}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">{t.home.sampleTwo}</p>
                  <span className="text-xs text-muted">{t.home.yesterday}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{t.home.sampleTwoNote}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-8 md:grid-cols-3">
        <Feature title={t.home.featurePrivate} text={t.home.featurePrivateText} />
        <Feature title={t.home.featureImage} text={t.home.featureImageText} />
        <Feature title={t.home.featureStreak} text={t.home.featureStreakText} />
      </section>
    </main>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
    </div>
  );
}
