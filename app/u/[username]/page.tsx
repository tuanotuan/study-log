import Link from "next/link";
import { notFound } from "next/navigation";
import { ContributionGraph } from "@/components/ContributionGraph";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getCopy, getLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { buildContributionDays, getContributionStats } from "@/lib/stats";

type PublicProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
  searchParams?: Promise<{
    updated?: string;
  }>;
};

export default async function PublicProfilePage({ params, searchParams }: PublicProfilePageProps) {
  const { username } = await params;
  const query = await searchParams;
  const locale = await getLocale();
  const t = getCopy(locale);
  const viewer = await getCurrentUser();
  const normalizedUsername = decodeURIComponent(username).trim().toLowerCase();

  if (!/^[a-z0-9_]{3,24}$/.test(normalizedUsername)) {
    notFound();
  }

  const profile = await prisma.user.findUnique({
    where: { username: normalizedUsername },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
      studyCommits: {
        select: {
          studyDate: true
        }
      }
    }
  });

  if (!profile) {
    notFound();
  }

  const isOwnProfile = viewer?.id === profile.id;
  const name = profile.displayName || `@${profile.username}`;
  const joinedAt = new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    month: "long",
    year: "numeric"
  }).format(profile.createdAt);
  const contributionDays = buildContributionDays(
    profile.studyCommits.map((commit) => commit.studyDate)
  );
  const contributionStats = getContributionStats(contributionDays);

  return (
    <main className="min-h-screen bg-canvas">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link className="flex items-center gap-3" href={viewer ? "/dashboard" : "/"}>
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[#24292f] text-sm font-bold text-white">
              LS
            </span>
            <span className="text-base font-semibold text-ink">{t.common.appName}</span>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher locale={locale} returnTo={`/u/${profile.username}`} />
            {viewer ? (
              <Link
                className="rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-ink transition hover:bg-gray-50"
                href="/dashboard"
              >
                {t.profile.dashboard}
              </Link>
            ) : (
              <Link
                className="rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-ink transition hover:bg-gray-50"
                href="/login"
              >
                {t.common.login}
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8">
        {query?.updated && isOwnProfile ? (
          <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {t.profile.updated}
          </div>
        ) : null}

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-white p-5 shadow-panel">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <Avatar avatarUrl={profile.avatarUrl} name={name} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h1 className="truncate text-2xl font-semibold text-ink">{name}</h1>
                    <p className="mt-1 text-sm font-medium text-muted">@{profile.username}</p>
                  </div>

                  {isOwnProfile ? (
                    <Link
                      className="rounded-md border border-border bg-white px-3 py-2 text-center text-sm font-semibold text-ink transition hover:bg-gray-50"
                      href="/profile/edit"
                    >
                      {t.profile.editProfile}
                    </Link>
                  ) : null}
                </div>

                {profile.bio ? (
                  <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-ink">{profile.bio}</p>
                ) : (
                  <p className="mt-5 text-sm text-muted">{t.profile.emptyBio}</p>
                )}

                <div className="mt-6 rounded-md border border-border bg-canvas px-3 py-2 text-sm text-muted">
                  {t.profile.joined} {joinedAt}
                </div>
              </div>
            </div>
          </div>

          <ContributionGraph
            days={contributionDays}
            labels={t.dashboard}
            locale={locale}
            stats={contributionStats}
          />
        </div>
      </section>
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
        className="h-28 w-28 shrink-0 rounded-lg border border-border object-cover"
        src={avatarUrl}
      />
    );
  }

  return (
    <div className="grid h-28 w-28 shrink-0 place-items-center rounded-lg border border-border bg-canvas text-3xl font-semibold text-muted">
      {initial}
    </div>
  );
}
