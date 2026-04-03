import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function redisRest(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url?.trim() || !token?.trim()) return null;
  return new Redis({ url: url.trim(), token: token.trim() });
}

const redis = redisRest();

const leadLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "15 m"),
      prefix: "rl:lead",
    })
  : null;

const siteLeadLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "15 m"),
      prefix: "rl:site-lead",
    })
  : null;

const registerLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "rl:register",
    })
  : null;

const authLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(40, "10 m"),
      prefix: "rl:auth",
    })
  : null;

const loginAttemptLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(25, "15 m"),
      prefix: "rl:login-try",
    })
  : null;

export type RateLimitKind = "lead" | "siteLead" | "register" | "auth" | "loginTry";

export async function rateLimitAllow(
  key: string,
  kind: RateLimitKind
): Promise<{ allowed: boolean; limit: number; remaining: number; reset: number }> {
  const limiter =
    kind === "lead"
      ? leadLimiter
      : kind === "siteLead"
        ? siteLeadLimiter
        : kind === "register"
          ? registerLimiter
          : kind === "auth"
            ? authLimiter
            : loginAttemptLimiter;

  if (!limiter) {
    return { allowed: true, limit: 999, remaining: 999, reset: Date.now() + 60_000 };
  }

  const result = await limiter.limit(key);
  return {
    allowed: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
