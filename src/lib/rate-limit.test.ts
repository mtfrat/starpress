import { describe, it, expect } from "vitest";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "./rate-limit";

describe("RATE_LIMITS", () => {
  it("has all required rate limit configs", () => {
    expect(RATE_LIMITS.scrape).toBeDefined();
    expect(RATE_LIMITS.ai).toBeDefined();
    expect(RATE_LIMITS.api).toBeDefined();
    expect(RATE_LIMITS.widget).toBeDefined();
    expect(RATE_LIMITS.feedback).toBeDefined();
  });

  it("each config has window, max, and label", () => {
    for (const config of Object.values(RATE_LIMITS)) {
      expect(config.window).toBeGreaterThan(0);
      expect(config.max).toBeGreaterThan(0);
      expect(typeof config.label).toBe("string");
    }
  });
});

describe("checkRateLimit", () => {
  it("allows first request", async () => {
    const result = await checkRateLimit("api", "test-user-1");
    expect(result.success).toBe(true);
    expect(result.remaining).toBeGreaterThanOrEqual(0);
  });

  it("returns reset timestamp", async () => {
    const result = await checkRateLimit("api", "test-user-2");
    expect(result.reset).toBeGreaterThan(Date.now());
  });
});

describe("rateLimitResponse", () => {
  it("returns 429 status", () => {
    const reset = Date.now() + 60000;
    const response = rateLimitResponse(reset);
    expect(response.status).toBe(429);
  });

  it("includes Retry-After header", () => {
    const reset = Date.now() + 60000;
    const response = rateLimitResponse(reset);
    const retryAfter = response.headers.get("Retry-After");
    expect(retryAfter).toBeDefined();
    expect(Number(retryAfter)).toBeGreaterThan(0);
  });

  it("includes JSON body with error message", async () => {
    const reset = Date.now() + 60000;
    const response = rateLimitResponse(reset);
    const body = await response.json();
    expect(body.error).toBe("Too many requests. Please try again later.");
    expect(body.retryAfter).toBeGreaterThan(0);
  });
});
