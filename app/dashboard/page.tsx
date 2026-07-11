import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, LogOut, Settings2 } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { CommitForm } from "@/components/CommitForm";
import { CommitList } from "@/components/CommitList";
import { ContributionGraph } from "@/components/ContributionGraph";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { formatDateInput } from "@/lib/dates";
import { getCopy, getLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { buildContributionDays, getContributionStartDate, getContributionStats } from "@/lib/stats";

const COMMITS_PER_PAGE = 8;

type DashboardPageProps = {
  searchParams?: Promise<{
    error?: string;
    page?: string;
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

  const requestedPage = Number.parseInt(params?.page ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const totalCommits = await prisma.studyCommit.count({ where: { userId: user.id } });
  const totalPages = Math.max(1, Math.ceil(totalCommits / COMMITS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const [commits, contributionDates] = await Promise.all([
    prisma.studyCommit.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * COMMITS_PER_PAGE,
      take: COMMITS_PER_PAGE
    }),
    prisma.studyCommit.findMany({
      where: {
        userId: user.id,
        studyDate: { gte: getContributionStartDate() }
      },
      select: { studyDate: true }
    })
  ]);

  const contributionDays = buildContributionDays(contributionDates.map((commit) => commit.studyDate));
  const stats = getContributionStats(contributionDays);

  return (
    <main className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#24292f] text-white">
              <BookOpen aria-hidden="true" size={19} strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-success">{t.common.appName}</p>
              <h1 className="truncate text-base font-semibold text-ink sm:text-lg">{t.dashboard.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher locale={locale} returnTo="/dashboard" />
            {user.username ? (
              <Link className="hidden items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-canvas sm:flex" href={`/u/${user.username}`}>
                <Avatar avatarUrl={user.avatarUrl} name={user.displayName || user.username || user.email} />
                <span className="max-w-32 truncate text-sm font-medium text-ink">{user.displayName || `@${user.username}`}</span>
              </Link>
            ) : (
              <span className="hidden max-w-32 truncate text-sm text-muted sm:block">{user.email}</span>
            )}
            <Link
              aria-label={t.profile.editProfile}
              className="grid h-9 w-9 place-items-center rounded-md border border-border bg-white text-muted transition hover:bg-canvas hover:text-ink"
              href="/profile/edit"
              title={t.profile.editProfile}
            >
              <Settings2 aria-hidden="true" size={17} strokeWidth={1.8} />
            </Link>
            <form action={logoutAction}>
              <button
                aria-label={t.common.logout}
                className="grid h-9 w-9 place-items-center rounded-md border border-border bg-white text-muted transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                title={t.common.logout}
                type="submit"
              >
                <LogOut aria-hidden="true" size={17} strokeWidth={1.8} />
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
            pendingLabel={t.common.processing}
          />
        </aside>

        <section className="space-y-6">
          <ContributionGraph days={contributionDays} labels={t.dashboard} locale={locale} stats={stats} />
          <CommitList
            commits={commits}
            currentPage={currentPage}
            labels={t.dashboard}
            locale={locale}
            totalCommits={totalCommits}
            totalPages={totalPages}
          />
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
        className="h-8 w-8 rounded-md border border-border object-cover"
        src={avatarUrl}
      />
    );
  }

  return (
    <div className="grid h-8 w-8 place-items-center rounded-md border border-border bg-white text-xs font-semibold text-muted">
      {initial}
    </div>
  );
}
