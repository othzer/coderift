// Lightweight in-memory, fixed-window rate limiter — no external dependency.
//
// Tradeoff: state lives in the process memory, so on a multi-instance / serverless
// deployment each instance keeps its own counters (a warm instance still throttles
// bursts, but the limit isn't shared globally). That's fine for this project; for a
// horizontally-scaled production app, swap this for @upstash/ratelimit backed by Redis.

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitEntry>();

// Opportunistic cleanup so the map can't grow unbounded from one-off identifiers.
let lastSweep = Date.now();
const SWEEP_INTERVAL_MS = 60_000;

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, entry] of buckets) {
    if (now >= entry.resetAt) buckets.delete(key);
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** epoch ms when the current window resets */
  reset: number;
}

/**
 * Fixed-window rate limit.
 * @param identifier stable key to limit on (e.g. `chat:<userId>`)
 * @param limit max requests allowed per window
 * @param windowMs window length in milliseconds
 */
export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const entry = buckets.get(identifier);

  if (!entry || now >= entry.resetAt) {
    buckets.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
  }

  if (entry.count >= limit) {
    return { success: false, limit, remaining: 0, reset: entry.resetAt };
  }

  entry.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset: entry.resetAt,
  };
}
