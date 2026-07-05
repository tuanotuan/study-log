import { addUtcDays, formatHumanDate } from "@/lib/dates";
import type { Locale } from "@/lib/i18n";
import type { CommitDay, ContributionStats } from "@/lib/stats";

type ContributionGraphProps = {
  days: CommitDay[];
  stats: ContributionStats;
  locale: Locale;
  labels: {
    graphTitle: string;
    graphSubtitle: string;
    less: string;
    more: string;
    totalCommits: string;
    currentStreak: string;
    maxStreak: string;
    activeDays: string;
    days: string;
  };
};

function levelForCount(count: number) {
  if (count === 0) {
    return "bg-[#ebedf0]";
  }

  if (count === 1) {
    return "bg-[#9be9a8]";
  }

  if (count <= 3) {
    return "bg-[#40c463]";
  }

  if (count <= 5) {
    return "bg-[#30a14e]";
  }

  return "bg-[#216e39]";
}

function buildCalendarCells(days: CommitDay[]) {
  if (days.length === 0) {
    return [];
  }

  const first = days[0].date;
  const offset = first.getUTCDay();
  const paddedStart = addUtcDays(first, -offset);
  const dayMap = new Map(days.map((day) => [day.date.toISOString().slice(0, 10), day]));
  const totalCells = Math.ceil((days.length + offset) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const date = addUtcDays(paddedStart, index);
    return dayMap.get(date.toISOString().slice(0, 10)) ?? { date, count: 0, isPadding: true };
  });
}

export function ContributionGraph({ days, labels, locale, stats }: ContributionGraphProps) {
  const cells = buildCalendarCells(days);
  const weeks = Array.from({ length: Math.ceil(cells.length / 7) }, (_, index) =>
    cells.slice(index * 7, index * 7 + 7)
  );
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";

  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-panel">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">{labels.graphTitle}</h2>
          <p className="text-sm text-muted">{labels.graphSubtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>{labels.less}</span>
          {[0, 1, 2, 4, 6].map((count) => (
            <span
              aria-hidden="true"
              className={`h-3 w-3 rounded-[2px] ${levelForCount(count)}`}
              key={count}
            />
          ))}
          <span>{labels.more}</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label={labels.totalCommits} value={stats.totalCommits.toString()} />
        <Stat label={labels.currentStreak} value={`${stats.currentStreak} ${labels.days}`} />
        <Stat label={labels.maxStreak} value={`${stats.maxStreak} ${labels.days}`} />
        <Stat label={labels.activeDays} value={stats.activeDays.toString()} />
      </div>

      <div className="graph-scroll mt-5 overflow-x-auto pb-2">
        <div className="flex min-w-max gap-[3px]">
          {weeks.map((week, weekIndex) => (
            <div className="grid grid-rows-7 gap-[3px]" key={weekIndex}>
              {week.map((day) => {
                const isPadding = "isPadding" in day;
                const count = isPadding ? 0 : day.count;
                const formattedDate = formatHumanDate(day.date, dateLocale);

                return (
                  <div
                    aria-label={`${formattedDate}: ${count} commit`}
                    className={`h-3 w-3 rounded-[2px] ${isPadding ? "bg-transparent" : levelForCount(day.count)}`}
                    key={day.date.toISOString()}
                    title={`${formattedDate} - ${count} commit`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-canvas px-3 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}
