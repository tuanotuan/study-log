import type { StudyCommit } from "@prisma/client";
import Image from "next/image";
import { deleteCommitAction } from "@/app/actions/commits";
import { formatHumanDate } from "@/lib/dates";
import type { Locale } from "@/lib/i18n";

type CommitListProps = {
  commits: StudyCommit[];
  locale: Locale;
  labels: {
    recentCommits: string;
    emptyCommits: string;
    deleteCommit: string;
  };
};

export function CommitList({ commits, labels, locale }: CommitListProps) {
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";

  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-panel">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">{labels.recentCommits}</h2>
        <span className="text-sm text-muted">{commits.length} commit</span>
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
                  <button
                    className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                    type="submit"
                  >
                    {labels.deleteCommit}
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
