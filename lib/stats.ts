import { addUtcDays, dateKey, startOfUtcDay } from "@/lib/dates";

export type CommitDay = {
  date: Date;
  count: number;
};

export type ContributionStats = {
  totalCommits: number;
  activeDays: number;
  currentStreak: number;
  maxStreak: number;
};

export function buildContributionDays(studyDates: Date[]) {
  const today = startOfUtcDay(new Date());
  const end = today;
  const start = addUtcDays(end, -364);
  const counts = new Map<string, number>();

  for (const studyDate of studyDates) {
    const key = dateKey(studyDate);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const days: CommitDay[] = [];

  for (let date = start; date <= end; date = addUtcDays(date, 1)) {
    days.push({
      date,
      count: counts.get(dateKey(date)) ?? 0
    });
  }

  return days;
}

export function getContributionStats(days: CommitDay[]): ContributionStats {
  const totalCommits = days.reduce((total, day) => total + day.count, 0);
  const activeDays = days.filter((day) => day.count > 0).length;

  let currentStreak = 0;
  let maxStreak = 0;
  let runningStreak = 0;

  for (const day of days) {
    if (day.count > 0) {
      runningStreak += 1;
      maxStreak = Math.max(maxStreak, runningStreak);
    } else {
      runningStreak = 0;
    }
  }

  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (days[index].count === 0) {
      break;
    }

    currentStreak += 1;
  }

  return {
    totalCommits,
    activeDays,
    currentStreak,
    maxStreak
  };
}
