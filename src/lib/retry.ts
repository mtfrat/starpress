interface RetryOptions {
  retries: number;
  delay: number;
  backoff: number;
}

const DEFAULT_OPTIONS: RetryOptions = {
  retries: 3,
  delay: 1000,
  backoff: 2,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= opts.retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < opts.retries) {
        const waitTime = opts.delay * Math.pow(opts.backoff, attempt);
        console.warn(
          `[Retry] Attempt ${attempt + 1} failed, retrying in ${waitTime}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError!;
}
