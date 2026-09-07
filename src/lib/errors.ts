export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter: number) {
    super("Rate limit exceeded", "RATE_LIMITED", 429, { retryAfter });
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super(`${service} error: ${message}`, "EXTERNAL_SERVICE_ERROR", 502, {
      service,
    });
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
  }
}

export class AuthError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, "AUTH_ERROR", 401);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND", 404);
  }
}
