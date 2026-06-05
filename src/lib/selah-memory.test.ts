import { describe, it, expect } from "vitest";
import { normalizeMemory, memoryIsEmpty, EMPTY_MEMORY } from "./selah-memory";

describe("normalizeMemory", () => {
  it("returns an empty memory for null/undefined input", () => {
    expect(normalizeMemory(null)).toEqual(EMPTY_MEMORY);
  });

  it("clamps arrays to their maximum length", () => {
    const many = Array.from({ length: 20 }, (_, i) => `item-${i}`);
    const m = normalizeMemory({
      recurring_struggles: many,
      important_context: many,
    });
    expect(m.recurring_struggles).toHaveLength(6);
    expect(m.important_context).toHaveLength(8);
  });

  it("trims long string fields", () => {
    const m = normalizeMemory({
      faith_state: "x".repeat(500),
      last_summary: "y".repeat(1000),
    });
    expect(m.faith_state.length).toBe(180);
    expect(m.last_summary.length).toBe(600);
  });

  it("drops empty / non-string array entries", () => {
    const m = normalizeMemory({ prayer_topics: ["a", "", null, "  ", "b"] });
    expect(m.prayer_topics).toEqual(["a", "b"]);
  });
});

describe("memoryIsEmpty", () => {
  it("is true for empty memory and false once something is stored", () => {
    expect(memoryIsEmpty(EMPTY_MEMORY)).toBe(true);
    expect(memoryIsEmpty(normalizeMemory({ faith_state: "seeking" }))).toBe(
      false
    );
  });
});
