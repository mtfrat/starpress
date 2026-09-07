import { describe, it, expect } from "vitest";
import { withTimeout } from "./timeout";

describe("withTimeout", () => {
  it("returns result before timeout", async () => {
    const promise = Promise.resolve("success");
    const result = await withTimeout(promise, 1000);
    expect(result).toBe("success");
  });

  it("throws on timeout", async () => {
    const promise = new Promise((resolve) => setTimeout(() => resolve("late"), 2000));

    await expect(withTimeout(promise, 50)).rejects.toThrow(
      "Operation timed out after 50ms"
    );
  });

  it("handles rejected promises", async () => {
    const promise = Promise.reject(new Error("failed"));

    await expect(withTimeout(promise, 1000)).rejects.toThrow("failed");
  });
});
