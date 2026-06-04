/**
 * Lightweight per-user rate limiter.
 *
 * The chat endpoint triggers paid Anthropic calls (the answer itself plus a
 * memory-update call), so an authenticated user — or an automated script
 * using a stolen/valid session — could otherwise run the bill up without
 * bound. This in-memory sliding-window limiter is a cheap first line of
 * defence: it caps how many requests a single user may make per window.
 *
 * Caveat: in a multi-instance / serverless deployment each instance keeps
 * its own counter, so the effective limit is (per-instance limit × number
 * of warm instances). That is still a large improvement over no limit at
 * all. For a hard global cap, move this state to Redis/Upstash or a
 * Supabase table later — the call site does not need to change.
 */

const WINDOW_MS = 60_000; // 1 minute

function configuredLimit(): number {
  const raw = Number(process.env.CHAT_RATE_LIMIT_PER_MIN);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 20;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds the caller should wait before retrying (only when blocked). */
  retryAfter: number;
  remaining: number;
  limit: number;
}

/**
 * Records one hit for `key` and reports whether it is within the limit.
 * Call once per request you want to meter.
 */
export function checkRateLimit(key: string, now: number = Date.now()): RateLimitResult {
  const limit = configuredLimit();
  let bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(key, bucket);
  }

  // Opportunistically drop expired buckets so the map cannot grow forever.
  if (buckets.size > 5_000) {
    for (const [k, b] of buckets) {
      if (now >= b.resetAt) buckets.delete(k);
    }
  }

  bucket.count += 1;
  const allowed = bucket.count <= limit;
  return {
    allowed,
    retryAfter: allowed ? 0 : Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    remaining: Math.max(0, limit - bucket.count),
    limit,
  };
}

/** Test helper — clears all counters. */
export function __resetRateLimits(): void {
  buckets.clear();
}
