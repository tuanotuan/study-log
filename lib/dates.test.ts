import { describe, expect, it } from "vitest";
import { parseStudyDate } from "./dates";

describe("parseStudyDate", () => {
  it("accepts a real calendar date", () => {
    expect(parseStudyDate("2024-02-29")?.toISOString()).toBe("2024-02-29T00:00:00.000Z");
  });

  it("rejects calendar overflow instead of normalizing it", () => {
    expect(parseStudyDate("2024-02-31")).toBeNull();
    expect(parseStudyDate("2024-13-01")).toBeNull();
  });
});
