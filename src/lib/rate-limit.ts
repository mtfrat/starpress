import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// In-memory fallback when Redis is not configured
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null;
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

function getRedisRatelimit(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
  });
}

// Different rate limits for different endpoints
export const RATE_LIMITS = {
  // Scrape: 5 per hour per user (costs money via Apify)
  scrape: { window: 3600, max: 5, label: "scrape" },
  // AI analysis: 10 per hour per user (costs money via OpenAI)
  ai: { window: 3600, max: 10, label: "ai" },
  // General API: 30 per minute per user
  api: { window: 60, max: 30, label: "api" },
  // Public widget: 100 per minute per IP
  widget: { window: 60, max: 100, label: "widget" },
  // Feedback: 10 per minute per IP (public endpoint)
  feedback: { window: 60, max: 10, label: "feedback" },
} as const;

type RateLimitType = keyof typeof RATE_LIMITS;

export async function checkRateLimit(
  type: RateLimitType,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const config = RATE_LIMITS[type];

  // Try Redis-backed rate limiting first
  const redisRatelimit = getRedisRatelimit();
  if (redisRatelimit) {
    try {
      const { success, limit, remaining, reset } = await redisRatelimit.limit(
        `${config.label}:${identifier}`
      );
      return { success, remaining: limit - remaining, reset };
    } catch (error) {
      console.error("[RateLimit] Redis error, falling back to memory:", error);
    }
  }

  // Fallback: in-memory rate limiting (resets on server restart)
  const key = `${config.label}:${identifier}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + config.window * 1000 });
    return { success: true, remaining: config.max - 1, reset: now + config.window * 1000 };
  }

  if (entry.count >= config.max) {
    return { success: false, remaining: 0, reset: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: config.max - entry.count, reset: entry.resetAt };
}

export function rateLimitResponse(reset: number): Response {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000);
  return new Response(
    JSON.stringify({
      error: "Too many requests. Please try again later.",
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
        "X-RateLimit-Reset": String(reset),
      },
    }
  );
}
