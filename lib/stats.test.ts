import { describe, expect, it } from "vitest";
import { getContributionStats, type CommitDay } from "./stats";

function days(...counts: number[]): CommitDay[] {
  return counts.map((count, index) => ({
    count,
    date: new Date(Date.UTC(2026, 0, index + 1))
  }));
}

describe("getContributionStats", () => {
  it("keeps yesterday's streak current before today's study is logged", () => {
    expect(getContributionStats(days(1, 1, 0)).currentStreak).toBe(2);
  });

  it("counts total commits, active days, and max streak", () => {
    expect(getContributionStats(days(2, 0, 1, 3, 1))).toEqual({
      activeDays: 4,
      currentStreak: 3,
      maxStreak: 3,
      totalCommits: 7
    });
  });
});
