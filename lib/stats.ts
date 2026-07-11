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

export function getContributionStartDate(reference = new Date()) {
  return addUtcDays(startOfUtcDay(reference), -364);
}

export function buildContributionDays(studyDates: Date[]) {
  const today = startOfUtcDay(new Date());
  const end = today;
  const start = getContributionStartDate(today);
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

  let currentIndex = days.length - 1;

  // A streak is still current when the user studied yesterday but has not logged today yet.
  if (currentIndex >= 0 && days[currentIndex].count === 0) {
    currentIndex -= 1;
  }

  for (let index = currentIndex; index >= 0; index -= 1) {
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
