import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, __resetRateLimits } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => __resetRateLimits());

  it("allows requests up to the default limit (20/min)", () => {
    const t0 = 1_000_000;
    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit("user:a", t0).allowed).toBe(true);
    }
  });

  it("blocks the request that exceeds the limit and reports retryAfter", () => {
    const t0 = 1_000_000;
    for (let i = 0; i < 20; i++) checkRateLimit("user:b", t0);
    const blocked = checkRateLimit("user:b", t0);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
    expect(blocked.remaining).toBe(0);
  });

  it("resets the counter once the window has elapsed", () => {
    const t0 = 1_000_000;
    for (let i = 0; i < 20; i++) checkRateLimit("user:c", t0);
    expect(checkRateLimit("user:c", t0).allowed).toBe(false);
    // 61 seconds later → fresh window.
    expect(checkRateLimit("user:c", t0 + 61_000).allowed).toBe(true);
  });

  it("keeps separate counters per key", () => {
    const t0 = 1_000_000;
    for (let i = 0; i < 20; i++) checkRateLimit("user:d", t0);
    expect(checkRateLimit("user:d", t0).allowed).toBe(false);
    expect(checkRateLimit("user:e", t0).allowed).toBe(true);
  });
});
