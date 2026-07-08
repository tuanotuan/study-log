import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { CommitForm } from "@/components/CommitForm";
import { CommitList } from "@/components/CommitList";
import { ContributionGraph } from "@/components/ContributionGraph";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { formatDateInput } from "@/lib/dates";
import { getCopy, getLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { buildContributionDays, getContributionStats } from "@/lib/stats";

type DashboardPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const locale = await getLocale();
  const t = getCopy(locale);

  if (!user) {
    redirect("/login");
  }

  const commits = await prisma.studyCommit.findMany({
    where: {
      userId: user.id
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const contributionDays = buildContributionDays(commits.map((commit) => commit.studyDate));
  const stats = getContributionStats(contributionDays);

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-border bg-canvas">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">{t.common.appName}</p>
            <h1 className="text-xl font-semibold text-ink">{t.dashboard.title}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <LanguageSwitcher locale={locale} returnTo="/dashboard" />
            <Avatar avatarUrl={user.avatarUrl} name={user.displayName || user.username || user.email} />
            {user.username ? (
              <Link className="max-w-[42vw] truncate text-sm font-medium text-muted hover:text-ink" href={`/u/${user.username}`}>
                {user.displayName || `@${user.username}`}
              </Link>
            ) : (
              <span className="max-w-[42vw] truncate text-sm text-muted">{user.email}</span>
            )}
            <Link
              className="rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-ink transition hover:bg-gray-50"
              href="/profile/edit"
            >
              {t.profile.editProfile}
            </Link>
            <form action={logoutAction}>
              <button
                className="rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-ink transition hover:bg-gray-50"
                type="submit"
              >
                {t.common.logout}
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,360px)_1fr]">
        <aside className="space-y-6">
          <CommitForm
            labels={t.dashboard}
            today={formatDateInput(new Date())}
            error={params?.error}
            largeImageError={t.errors.largeImage}
          />
        </aside>

        <section className="space-y-6">
          <ContributionGraph days={contributionDays} labels={t.dashboard} locale={locale} stats={stats} />
          <CommitList commits={commits} labels={t.dashboard} locale={locale} />
        </section>
      </div>
    </main>
  );
}

function Avatar({ avatarUrl, name }: { avatarUrl: string | null; name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "L";

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={name}
        className="h-10 w-10 rounded-md border border-border object-cover"
        src={avatarUrl}
      />
    );
  }

  return (
    <div className="grid h-10 w-10 place-items-center rounded-md border border-border bg-white text-sm font-semibold text-muted">
      {initial}
    </div>
  );
}
