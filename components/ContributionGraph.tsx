import { CalendarCheck2, Flame, GitCommitHorizontal, Trophy } from "lucide-react";
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
  const monthFormatter = new Intl.DateTimeFormat(dateLocale, { month: "short", timeZone: "UTC" });
  const weekdayLabels = locale === "vi" ? ["", "T2", "", "T4", "", "T6", ""] : ["", "Mon", "", "Wed", "", "Fri", ""];

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

      <div className="grid border-y border-border sm:grid-cols-4 sm:divide-x sm:divide-border">
        <Stat icon={GitCommitHorizontal} label={labels.totalCommits} value={stats.totalCommits.toString()} />
        <Stat icon={Flame} label={labels.currentStreak} value={`${stats.currentStreak} ${labels.days}`} />
        <Stat icon={Trophy} label={labels.maxStreak} value={`${stats.maxStreak} ${labels.days}`} />
        <Stat icon={CalendarCheck2} label={labels.activeDays} value={stats.activeDays.toString()} />
      </div>

      <div className="graph-scroll mt-5 overflow-x-auto pb-2">
        <div className="min-w-max">
          <div className="mb-2 ml-8 flex gap-[3px] text-[10px] text-muted">
            {weeks.map((week, weekIndex) => {
              const firstMonthDay = week.find((day) => !("isPadding" in day) && day.date.getUTCDate() <= 7);

              return (
                <span className="w-3 overflow-visible whitespace-nowrap" key={weekIndex}>
                  {firstMonthDay ? monthFormatter.format(firstMonthDay.date) : ""}
                </span>
              );
            })}
          </div>
          <div className="flex gap-2">
            <div className="grid w-6 grid-rows-7 gap-[3px] text-[9px] leading-3 text-muted">
              {weekdayLabels.map((label, index) => <span key={index}>{label}</span>)}
            </div>
            <div className="flex gap-[3px]">
              {weeks.map((week, weekIndex) => (
                <div className="grid grid-rows-7 gap-[3px]" key={weekIndex}>
                  {week.map((day) => {
                const isPadding = "isPadding" in day;
                const count = isPadding ? 0 : day.count;
                const formattedDate = formatHumanDate(day.date, dateLocale);

                    return (
                      <div
                        aria-label={`${formattedDate}: ${count} commit`}
                        className={`h-3 w-3 rounded-[2px] outline-none transition-transform hover:scale-125 focus:scale-125 ${isPadding ? "bg-transparent" : levelForCount(day.count)}`}
                        key={day.date.toISOString()}
                        role={isPadding ? undefined : "img"}
                        tabIndex={isPadding ? undefined : 0}
                        title={`${formattedDate} - ${count} commit`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Flame; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-3">
      <Icon aria-hidden="true" className="shrink-0 text-success" size={18} strokeWidth={1.8} />
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="mt-0.5 text-lg font-semibold tabular-nums text-ink">{value}</p>
      </div>
    </div>
  );
}
