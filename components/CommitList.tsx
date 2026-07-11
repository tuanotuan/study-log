import type { StudyCommit } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { deleteCommitAction } from "@/app/actions/commits";
import { DeleteCommitButton } from "@/components/DeleteCommitButton";
import { formatHumanDate } from "@/lib/dates";
import type { Locale } from "@/lib/i18n";

type CommitListProps = {
  commits: StudyCommit[];
  currentPage: number;
  locale: Locale;
  totalCommits: number;
  totalPages: number;
  labels: {
    recentCommits: string;
    emptyCommits: string;
    deleteCommit: string;
    deleteConfirm: string;
    nextPage: string;
    previousPage: string;
    showingCommits: string;
  };
};

export function CommitList({ commits, currentPage, labels, locale, totalCommits, totalPages }: CommitListProps) {
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";

  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-panel">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">{labels.recentCommits}</h2>
        <span className="text-sm text-muted">
          {labels.showingCommits} {commits.length}/{totalCommits}
        </span>
      </div>

      {commits.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-canvas px-4 py-8 text-center text-sm text-muted">
          {labels.emptyCommits}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {commits.map((commit) => (
            <article key={commit.id} className="overflow-hidden rounded-lg border border-border bg-white">
              <div className="relative aspect-[4/3] w-full bg-canvas">
                <Image
                  alt={commit.title}
                  className="h-full w-full object-cover"
                  fill
                  sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                  src={commit.imageUrl}
                />
              </div>

              <div className="space-y-3 p-4">
                <div>
                  <h3 className="line-clamp-2 text-sm font-semibold text-ink">{commit.title}</h3>
                  <p className="mt-1 text-xs text-muted">{formatHumanDate(commit.studyDate, dateLocale)}</p>
                </div>

                <p className="line-clamp-4 whitespace-pre-wrap text-sm text-muted">{commit.note}</p>

                <form action={deleteCommitAction}>
                  <input name="id" type="hidden" value={commit.id} />
                  <DeleteCommitButton confirmMessage={labels.deleteConfirm} label={labels.deleteCommit} />
                </form>
              </div>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <nav aria-label="Pagination" className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <PageLink disabled={currentPage <= 1} href={`/dashboard?page=${currentPage - 1}`}>
            {labels.previousPage}
          </PageLink>
          <span className="text-sm tabular-nums text-muted">
            {currentPage} / {totalPages}
          </span>
          <PageLink disabled={currentPage >= totalPages} href={`/dashboard?page=${currentPage + 1}`}>
            {labels.nextPage}
          </PageLink>
        </nav>
      ) : null}
    </section>
  );
}

function PageLink({ children, disabled, href }: { children: React.ReactNode; disabled: boolean; href: string }) {
  if (disabled) {
    return <span className="rounded-md border border-border px-3 py-2 text-sm text-muted opacity-50">{children}</span>;
  }

  return (
    <Link className="rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-ink transition hover:bg-canvas" href={href}>
      {children}
    </Link>
  );
}
